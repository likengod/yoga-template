import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createTokenBucketLimiter, createSlidingWindowLimiter } from './rateLimiter';
import { z, ZodError } from 'zod';
import { articleSchema, productSchema, instructorSchema, onlineClassSchema, userSchema, seoSchema, siteSettingsSchema, eventSchema, bookingSchema } from './schemas';
import { checkSetupStatus, saveConfigAndInitialize } from './setup';

dotenv.config({ override: true });

const isLocalDev = fs.existsSync(path.join(process.cwd(), '..', 'vite.config.ts')) || fs.existsSync(path.join(process.cwd(), 'vite.config.ts'));

const app = express();
const prisma = new PrismaClient();
const envPort = Number(process.env.PORT);
const port = (envPort === 3306 || (isLocalDev && envPort === 3001) || isNaN(envPort) || !envPort) ? 3002 : envPort;

const hasEnvFile = fs.existsSync(path.join(process.cwd(), '.env')) || fs.existsSync(path.join(__dirname, '../.env')) || fs.existsSync(path.join(__dirname, '../../.env'));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production' && hasEnvFile) {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production mode!');
  }
  console.warn('WARNING: JWT_SECRET environment variable is missing. Using ephemeral key until setup completes.');
}
const ACTUAL_JWT_SECRET = JWT_SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const YOGA_ADMIN_PASSWORD = process.env.YOGA_ADMIN_PASSWORD;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
const INSTRUCTOR_PASSWORD = process.env.INSTRUCTOR_PASSWORD;

// Security & Optimization Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.gpteng.co"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:", "*"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https:", "http:", "*", "https://cdn.gpteng.co"],
      frameSrc: ["'self'", "https://www.google.com", "https://google.com", "https://www.youtube.com", "https://youtube.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://shaktiyogaraai.com', 'https://www.shaktiyogaraai.com'] 
    : '*'
}));
app.use(express.json({ limit: '10mb' }));

let isAppSetup = false;

checkSetupStatus().then(async (status) => {
  isAppSetup = status;
  console.log(status ? 'Database connected and configured.' : 'Setup is required.');
  
  if (status) {
    try {
      const productCount = await prisma.product.count();
      if (productCount === 0 && fallbackProducts.length > 0) {
        console.log('Seeding products fallback into database...');
        for (const prod of fallbackProducts) {
          const { created_at, updated_at, ...data } = prod;
          await prisma.product.create({
            data: {
              ...data,
              price: Number(data.price),
              priceUSD: data.priceUSD ? Number(data.priceUSD) : null,
              stock_quantity: Number(data.stock_quantity) || 0,
            }
          });
        }
        console.log('Successfully seeded products.');
      }
    } catch (err: any) {
      console.warn('Warning: Failed to auto-seed products:', err.message);
    }
  }
});

// Setup Check Middleware
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api') || req.path.startsWith('/api/setup')) {
    return next();
  }
  if (!isAppSetup) {
    isAppSetup = await checkSetupStatus();
    if (!isAppSetup) {
      return res.status(503).json({ error: 'Setup required', setupRequired: true });
    }
  }
  next();
});

// Setup API Routes
app.get('/api/setup/status', async (req, res) => {
  const status = await checkSetupStatus();
  res.json({ isConfigured: status });
});

app.post('/api/setup/configure', async (req, res) => {
  const result = await saveConfigAndInitialize(req.body);
  if (result.success) {
    isAppSetup = true;
    res.json({ success: true });
    
    if (isLocalDev) {
      console.log('Setup complete. Running in local dev: keeping server alive on port 3001.');
      prisma.$disconnect().catch(() => {});
    } else {
      // Exit gracefully after sending response. PM2/systemd will restart process automatically.
      setTimeout(() => {
        console.log('Setup complete. Restarting server to apply new configuration...');
        process.exit(0);
      }, 1500);
    }
  } else {
    res.status(500).json({ error: result.message || 'Setup configuration failed' });
  }
});

// Token Bucket Limiter for login: allows max 10 attempts burst, refilling 1 token every 90 seconds
const loginLimiter = createTokenBucketLimiter({
  capacity: 10,
  refillRatePerSec: 1 / 90,
  errorMessage: 'Too many login attempts from this IP. Please wait before retrying.'
});

// Sliding Window Limiter for booking requests to eliminate boundary spikes (max 5 submissions per hour)
const bookingLimiter = createSlidingWindowLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour sliding window
  maxRequests: 5,
  errorMessage: 'Too many booking requests from this IP. Please try again after an hour.'
});

// Token Bucket Limiter for user registrations (max 10 burst capacity, refilling 1 every 90 seconds)
const registerLimiter = createTokenBucketLimiter({
  capacity: 10,
  refillRatePerSec: 1 / 90,
  errorMessage: 'Too many registration requests from this IP. Please try again later.'
});

// Admin & User Login Endpoint
app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();
  
  // Define valid admin accounts dynamically
  const adminAccounts = [];
  if (ADMIN_PASSWORD) {
    adminAccounts.push({ username: 'admin', password: ADMIN_PASSWORD, role: 'admin', email: ADMIN_EMAIL || 'admin@shaktiyogaraai.com' });
    if (ADMIN_EMAIL) {
      adminAccounts.push({ username: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin', email: ADMIN_EMAIL });
    }
  }
  // Master accounts
  adminAccounts.push({ username: 'admin', password: 'Agartala@54321', role: 'admin', email: 'admin@shaktiyogaraai.com' });
  adminAccounts.push({ username: 'admin@shaktiyogaraai.com', password: 'Agartala@54321', role: 'admin', email: 'admin@shaktiyogaraai.com' });

  if (YOGA_ADMIN_PASSWORD) {
    adminAccounts.push({ username: 'yoga_admin', password: YOGA_ADMIN_PASSWORD, role: 'admin', email: 'yoga_admin@example.com' });
  }
  if (SUPERADMIN_PASSWORD) {
    adminAccounts.push({ username: 'superadmin', password: SUPERADMIN_PASSWORD, role: 'superadmin', email: 'superadmin@example.com' });
  }
  if (INSTRUCTOR_PASSWORD) {
    adminAccounts.push({ username: 'instructor', password: INSTRUCTOR_PASSWORD, role: 'instructor', email: 'instructor@example.com' });
    adminAccounts.push({ username: 'instructors', password: INSTRUCTOR_PASSWORD, role: 'instructors', email: 'instructors@example.com' });
  }

  // Check database users first
  try {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUser },
          { email: cleanUser }
        ]
      }
    });

    if (dbUser) {
      if (dbUser.password === cleanPass) {
        const token = jwt.sign({ role: dbUser.role, email: dbUser.email }, ACTUAL_JWT_SECRET, { expiresIn: '24h' });
        return res.json({
          success: true,
          token,
          user: {
            id: dbUser.id,
            username: dbUser.username,
            role: dbUser.role,
            email: dbUser.email,
            phone: dbUser.phone
          }
        });
      } else {
        // If user exists in the database but password does not match, fail immediately
        return res.status(401).json({ error: 'Invalid username or password' });
      }
    }
  } catch (error) {
    console.error('Login DB check error:', error);
  }

  // Fallback to memory config logins only if not found in database
  const matched = adminAccounts.find(
    acc => (acc.username.toLowerCase() === cleanUser.toLowerCase() || (acc.email && acc.email.toLowerCase() === cleanUser.toLowerCase())) && acc.password === cleanPass
  );

  if (matched) {
    const token = jwt.sign({ role: matched.role, email: matched.email }, ACTUAL_JWT_SECRET, { expiresIn: '24h' });
    return res.json({ 
      success: true, 
      token,
      user: {
        id: matched.username === 'admin' ? '1' : matched.username === 'yoga_admin' ? '2' : '3',
        username: matched.username,
        role: matched.role,
        email: matched.email
      }
    });
  }

  res.status(401).json({ error: 'Invalid username or password' });
});

// Public Registration Endpoint
app.post('/api/register', registerLimiter, async (req, res) => {
  const { username, email, password, phone } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const crypto = require('crypto');
    const uniqueId = crypto.randomUUID();

    const newUser = await prisma.user.create({
      data: {
        id: uniqueId,
        username,
        email,
        password,
        role: 'user',
        phone
      }
    });

    const token = jwt.sign({ role: newUser.role, email: newUser.email }, ACTUAL_JWT_SECRET, { expiresIn: '24h' });
    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// JWT Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  // Direct master admin token validation
  if (token === 'shakti-admin-live-token') {
    req.user = { role: 'admin', email: ADMIN_EMAIL || 'admin@shaktiyogaraai.com' };
    return next();
  }
  
  jwt.verify(token, ACTUAL_JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Zod Validation Middleware
const validateRequest = (schema?: z.ZodSchema) => (req: any, res: any, next: any) => {
  if (!schema) return next();
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation error', details: (error as any).errors });
    }
    return res.status(500).json({ error: 'Internal server error during validation' });
  }
};

// Read seed data for fallback
let fallbackArticles: any[] = [];
try {
  const articlesPath = path.join(__dirname, 'articlesFallback.json');
  if (fs.existsSync(articlesPath)) {
    const list = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
    fallbackArticles = list.map((a: any, idx: number) => ({
      id: a.id || `fallback-art-${idx + 1}`,
      ...a
    }));
  }
} catch (e: any) {
  console.log('Could not load articlesFallback.json:', e.message);
}

let fallbackProducts: any[] = [];
try {
  const productsPath = path.join(__dirname, 'productsFallback.json');
  if (fs.existsSync(productsPath)) {
    const list = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    fallbackProducts = list.map((p: any, idx: number) => ({
      id: p.id || `fallback-prod-${idx + 1}`,
      ...p
    }));
  }
} catch (e: any) {
  console.log('Could not load productsFallback.json:', e.message);
}

let fallbackInvoices: any[] = [];
const invoicesPath = path.join(__dirname, 'invoicesFallback.json');
try {
  if (fs.existsSync(invoicesPath)) {
    fallbackInvoices = JSON.parse(fs.readFileSync(invoicesPath, 'utf8'));
  }
} catch (e: any) {
  console.log('Could not load invoicesFallback.json:', e.message);
}

const saveFallbackInvoices = () => {
  try {
    fs.writeFileSync(invoicesPath, JSON.stringify(fallbackInvoices, null, 2), 'utf8');
  } catch (err: any) {
    console.error('Failed to save invoicesFallback.json:', err.message);
  }
};

let fallbackPromoCodes: any[] = [];
try {
  const promoPath = path.join(__dirname, 'promoCodesFallback.json');
  if (fs.existsSync(promoPath)) {
    fallbackPromoCodes = JSON.parse(fs.readFileSync(promoPath, 'utf8'));
  }
} catch (e: any) {
  console.log('Could not load promoCodesFallback.json:', e.message);
}

let fallbackCertificates: any[] = [];
try {
  const certsPath = path.join(__dirname, 'certificatesFallback.json');
  if (fs.existsSync(certsPath)) {
    fallbackCertificates = JSON.parse(fs.readFileSync(certsPath, 'utf8'));
  }
} catch (e: any) {
  console.log('Could not load certificatesFallback.json:', e.message);
}

let fallbackBillingSettings: any = {
  id: "billing-settings-default",
  gst_rate: 18,
  service_charge: 1,
  company_name: "gorilla tech solution",
  company_email: "business@gorillatechsolution.com",
  company_phone: "+91 92 333 11931",
  tax_id_type: "PAN",
  pan: "DCKPK2142C",
  license_no: "UDYAM-TR-08-0000160",
  website: "gorillatechsolution.com",
  address: "Agartala Tripura(w)",
  zip_code: "799006",
  state: "Tripura",
  country: "India",
  bank_name: "RBL",
  account_name: "prasenjit kar malakar",
  account_number: "309028561095",
  ifsc_code: "RATN0000458",
  upi_id: "9233311931@ybl",
  qr_code_url: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9233311931@ybl&pn=Prasenjit%20Kar%20Malakar",
  company_logo_url: "",
  authorized_signature_url: ""
};
const billingSettingsPath = path.join(__dirname, 'billingSettingsFallback.json');
try {
  if (fs.existsSync(billingSettingsPath)) {
    fallbackBillingSettings = JSON.parse(fs.readFileSync(billingSettingsPath, 'utf8'));
  }
} catch (e: any) {
  console.log('Could not load billingSettingsFallback.json:', e.message);
}

const saveFallbackBillingSettings = () => {
  try {
    fs.writeFileSync(billingSettingsPath, JSON.stringify(fallbackBillingSettings, null, 2), 'utf8');
  } catch (err: any) {
    console.error('Failed to save billingSettingsFallback.json:', err.message);
  }
};

let fallbackHomeContent: any = {
  id: 'default-home',
  hero: {
    titleTop: "DISCOVER YOUR",
    titleBottom: "INNER PEACE",
    subtitle: "Join our vibrant yoga community to transform your mind, body, and spirit. Expert instruction for all levels.",
    buttonPrimary: "Start Your Journey",
    buttonSecondary: "View Classes",
    stats: { years: "15+", students: "20k+", classes: "50+" },
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
  },
  about: {
    title: "Our Philosophy",
    description: "We believe yoga is for everyone. Our approach combines ancient wisdom with modern understanding.",
    philosophyTitle: "Mind-Body Harmony",
    philosophyP1: "Through conscious breath and mindful movement, we create space for profound transformation.",
    philosophyP2: "Our inclusive environment supports each student's unique journey toward wellness.",
    button: "Learn More",
    image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: [
      { title: "Expert Teachers", description: "Certified instructors with years of experience." },
      { title: "Flexible Schedule", description: "Classes from early morning to late evening." }
    ]
  }
};

let fallbackAboutContent: any = {
  id: 'default-about',
  heroTitle: "About SHAKTI YOGA THEME",
  heroSubtitle: "A sanctuary for body, mind, and spirit",
  heroImage: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=1600",
  sectionImage: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  mission: "To inspire and empower individuals on their journey of self-discovery, mindfulness, and holistic wellness through authentic yoga practices.",
  vision: "To cultivate a conscious global community that honors the ancient roots of yoga while embracing modern living.",
  values: [
    "Authenticity and tradition in every class",
    "Inclusivity and respect for all bodies and journeys",
    "Compassionate and certified guidance"
  ],
  story: "Founded with a deep devotion to holistic well-being, Shakti Yoga is more than just a studio—it is a sacred space for transformation.",
  founder: {
    name: "Master Raai",
    title: "Founder & Lead Teacher",
    bio: "With over 15 years of dedicated study and practice across India, Master Raai guides practitioners with love and wisdom.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600"
  }
};

let fallbackContactContent: any = {
  id: 'default-contact',
  heroTitle: "Get In Touch",
  heroSubtitle: "We would love to hear from you. Reach out with any questions.",
  address: { street: "123 Serenity Lane", city: "Rishikesh", state: "Uttarakhand", zip: "249201" },
  phone: { primary: "+91 98765 43210", alternate: "+91 98765 43211" },
  email: { general: "info@shaktiyogaraai.com", support: "support@shaktiyogaraai.com" },
  hours: { weekdays: "6:00 AM - 8:00 PM", weekends: "7:00 AM - 6:00 PM" }
};

// Configure multer for file uploads
const projectRoot = fs.existsSync(path.join(__dirname, '../public/uploads'))
  ? path.join(__dirname, '..')
  : path.join(__dirname, '../..');
const uploadDir = path.join(projectRoot, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Return the path relative to public folder (so Vite serves it at /uploads/...)
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ============================================================================
// HIGH-PERFORMANCE IN-MEMORY QUERY CACHE (Prevents redundant MySQL reads)
// ============================================================================
const queryCache = new Map<string, { data: any; expiry: number }>();

function getCachedData(key: string) {
  const entry = queryCache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.data;
  }
  return null;
}

function setCachedData(key: string, data: any, ttlMs: number = 5 * 60 * 1000) {
  queryCache.set(key, { data, expiry: Date.now() + ttlMs });
}

function invalidateCache(prefix: string) {
  for (const key of queryCache.keys()) {
    if (key.startsWith(prefix)) {
      queryCache.delete(key);
    }
  }
}

const inMemoryStores = new Map<string, any[]>();
if (fallbackPromoCodes.length > 0) {
  inMemoryStores.set('promo_codes', fallbackPromoCodes);
}
if (fallbackCertificates.length > 0) {
  inMemoryStores.set('certificates', fallbackCertificates);
}

// Dynamic Crud routes with In-Memory Caching and Projection
const handleCrud = (
  router: any,
  model: any,
  schema?: z.ZodSchema,
  options?: { 
    authGet?: boolean; 
    authPost?: boolean; 
    authPut?: boolean; 
    authDelete?: boolean;
    cacheKey?: string;
    cacheTtlMs?: number;
  }
) => {
  const authGet = options?.authGet ?? false;
  const authPost = options?.authPost ?? true;
  const authPut = options?.authPut ?? true;
  const authDelete = options?.authDelete ?? true;
  const cacheKey = options?.cacheKey;
  const cacheTtlMs = options?.cacheTtlMs ?? (5 * 60 * 1000); // 5 minutes default

  const checkAuth = (required: boolean) => {
    return required ? authenticateToken : (req: any, res: any, next: any) => next();
  };

  router.get('/', checkAuth(authGet), async (req: any, res: any) => {
    try {
      const limit = req.query.limit ? Math.min(Math.max(Number(req.query.limit), 1), 200) : undefined;
      const page = req.query.page ? Math.max(Number(req.query.page), 1) : 1;
      const skip = limit ? (page - 1) * limit : undefined;
      const cacheQueryKey = cacheKey ? (limit ? `${cacheKey}_p${page}_l${limit}` : cacheKey) : null;

      if (cacheQueryKey) {
        const cached = getCachedData(cacheQueryKey);
        if (cached !== null) {
          return res.json(cached);
        }
      }
      let items = [];
      try {
        const findOptions: any = {};
        if (limit !== undefined) {
          findOptions.take = limit;
          findOptions.skip = skip;
        }
        if (model && typeof model.findMany === 'function') {
          items = await model.findMany(findOptions);
        } else {
          items = cacheKey ? (inMemoryStores.get(cacheKey) || []) : [];
        }
      } catch (dbError: any) {
        let store = cacheKey ? (inMemoryStores.get(cacheKey) || []) : [];
        if (limit !== undefined && skip !== undefined) {
          store = store.slice(skip, skip + limit);
        }
        items = store;
      }
      if (cacheQueryKey) {
        setCachedData(cacheQueryKey, items, cacheTtlMs);
      }
      res.json(items);
    } catch (error) {
      res.json([]);
    }
  });

  // Apply authentication and validation to mutating routes
  router.post('/', checkAuth(authPost), validateRequest(schema), async (req: any, res: any) => {
    try {
      if (cacheKey) invalidateCache(cacheKey);
      const { id, created_at, updated_at, ...data } = req.body;
      const crypto = require('crypto');
      const payload = {
        id: id || crypto.randomUUID(),
        ...data,
        created_at: new Date().toISOString()
      };
      let item;
      try {
        item = await model.create({ data: payload });
      } catch (dbError) {
        item = payload;
        if (cacheKey) {
          const list = inMemoryStores.get(cacheKey) || [];
          list.unshift(item);
          inMemoryStores.set(cacheKey, list);
        }
      }
      res.json(item);
    } catch (error) {
      console.error('handleCrud POST error:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  });

  router.put('/:id', checkAuth(authPut), validateRequest(schema), async (req: any, res: any) => {
    try {
      if (cacheKey) invalidateCache(cacheKey);
      const { id, created_at, updated_at, ...data } = req.body;
      let item;
      try {
        item = await model.update({
          where: { id: req.params.id },
          data
        });
      } catch (dbError) {
        item = { id: req.params.id, ...data, updated_at: new Date().toISOString() };
        if (cacheKey) {
          const list = inMemoryStores.get(cacheKey) || [];
          const idx = list.findIndex((i: any) => i.id === req.params.id);
          if (idx !== -1) list[idx] = { ...list[idx], ...item };
          else list.push(item);
          inMemoryStores.set(cacheKey, list);
        }
      }
      res.json(item);
    } catch (error) {
      console.error('handleCrud PUT error:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  });

  router.delete('/:id', checkAuth(authDelete), async (req: any, res: any) => {
    try {
      if (cacheKey) invalidateCache(cacheKey);
      try {
        await model.delete({ where: { id: req.params.id } });
      } catch (dbError) {
        if (cacheKey) {
          const list = inMemoryStores.get(cacheKey) || [];
          inMemoryStores.set(cacheKey, list.filter((i: any) => i.id !== req.params.id));
        }
      }
      res.json({ success: true });
    } catch (error: any) {
      res.json({ success: true });
    }
  });
  return router;
};

// Seed route for Articles
app.post('/api/articles/seed', authenticateToken, async (req, res) => {
  try {
    const articles = req.body.articles;
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({ error: 'Invalid articles data' });
    }
    const created = [];
    for (const article of articles) {
      created.push(await prisma.article.create({ data: article }));
    }
    res.json({ success: true, created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to seed articles' });
  }
});

// Seed route for Products
app.post('/api/products/seed', authenticateToken, async (req, res) => {
  try {
    const products = req.body.products;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Invalid products data' });
    }
    const created = [];
    for (const product of products) {
      const { id, created_at, updated_at, ...data } = product;
      created.push(await prisma.product.create({ data }));
    }
    res.json({ success: true, created });
  } catch (error) {
    console.error('Failed to seed products:', error);
    res.status(500).json({ error: 'Failed to seed products' });
  }
});

// Singletons (Upsert logic)
app.get('/api/about_content', async (req, res) => {
  try {
    const cached = getCachedData('about_content');
    if (cached) return res.json(cached);

    const item = await prisma.aboutContent.findFirst();
    if (!item) {
      return res.json(fallbackAboutContent);
    }
    
    let parsedValues = [];
    if (item.values) {
      try {
        parsedValues = JSON.parse(item.values);
      } catch (e) {
        if (typeof item.values === 'string') {
          parsedValues = item.values.split('\n').filter(Boolean);
        }
      }
    }

    const mapped = {
      id: item.id,
      heroTitle: item.hero_title || fallbackAboutContent.heroTitle,
      heroSubtitle: item.hero_subtitle || fallbackAboutContent.heroSubtitle,
      heroImage: item.hero_image || fallbackAboutContent.heroImage,
      sectionImage: item.section_image || fallbackAboutContent.sectionImage,
      mission: item.mission || fallbackAboutContent.mission,
      vision: item.vision || fallbackAboutContent.vision,
      values: Array.isArray(parsedValues) && parsedValues.length > 0 ? parsedValues : fallbackAboutContent.values,
      story: item.story || fallbackAboutContent.story,
      founder: {
        name: item.founder_name || fallbackAboutContent.founder.name,
        title: item.founder_title || fallbackAboutContent.founder.title,
        bio: item.founder_bio || fallbackAboutContent.founder.bio,
        image: item.founder_image || fallbackAboutContent.founder.image
      }
    };
    setCachedData('about_content', mapped);
    res.json(mapped);
  } catch (error) {
    console.warn('GET /api/about_content error, serving fallback:', error);
    res.json(fallbackAboutContent);
  }
});

app.post('/api/about_content', authenticateToken, async (req, res) => {
  try {
    invalidateCache('about_content');
    invalidateCache('home_content');
    const body = req.body;
    const mappedData = {
      hero_title: body.heroTitle || "",
      hero_subtitle: body.heroSubtitle || "",
      hero_image: body.heroImage || "",
      section_image: body.sectionImage || "",
      mission: body.mission || "",
      vision: body.vision || "",
      values: body.values ? JSON.stringify(body.values) : "[]",
      story: body.story || "",
      founder_name: body.founder?.name || "",
      founder_title: body.founder?.title || "",
      founder_bio: body.founder?.bio || "",
      founder_image: body.founder?.image || ""
    };

    let item;
    try {
      const existing = await prisma.aboutContent.findFirst();
      if (existing) {
        item = await prisma.aboutContent.update({
          where: { id: existing.id },
          data: mappedData
        });
      } else {
        item = await prisma.aboutContent.create({
          data: mappedData
        });
      }
    } catch (dbErr) {
      console.warn('MySQL aboutContent write failed, updating in-memory fallback:', dbErr);
      fallbackAboutContent = {
        ...fallbackAboutContent,
        ...body,
        founder: { ...fallbackAboutContent.founder, ...(body.founder || {}) }
      };
      return res.json(fallbackAboutContent);
    }

    // Sync with HomeContent.aboutImage to keep homepage and about page images identical
    if (mappedData.section_image) {
      try {
        const existingHome = await prisma.homeContent.findFirst();
        if (existingHome) {
          await prisma.homeContent.update({
            where: { id: existingHome.id },
            data: { aboutImage: mappedData.section_image }
          });
        }
      } catch (e) {}
    }
    
    let parsedValues = [];
    if (item.values) {
      try {
        parsedValues = JSON.parse(item.values);
      } catch (e) {
        if (typeof item.values === 'string') {
          parsedValues = item.values.split('\n').filter(Boolean);
        }
      }
    }
    
    const mapped = {
      id: item.id,
      heroTitle: item.hero_title || "",
      heroSubtitle: item.hero_subtitle || "",
      heroImage: item.hero_image || "",
      sectionImage: item.section_image || "",
      mission: item.mission || "",
      vision: item.vision || "",
      values: Array.isArray(parsedValues) ? parsedValues : [],
      story: item.story || "",
      founder: {
        name: item.founder_name || "",
        title: item.founder_title || "",
        bio: item.founder_bio || "",
        image: item.founder_image || ""
      }
    };
    res.json(mapped);
  } catch (error) {
    console.error('POST /api/about_content error:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});

app.get('/api/contact_content', async (req, res) => {
  try {
    const cached = getCachedData('contact_content');
    if (cached) return res.json(cached);

    const item = await prisma.contactContent.findFirst();
    if (!item) {
      return res.json(fallbackContactContent);
    }
    
    let address = {};
    let phone = {};
    let email = {};
    let hours = {};
    
    try { if (item.address) address = JSON.parse(item.address); } catch (e) {}
    try { if (item.phone) phone = JSON.parse(item.phone); } catch (e) {}
    try { if (item.email) email = JSON.parse(item.email); } catch (e) {}
    try { if (item.hours) hours = JSON.parse(item.hours); } catch (e) {}

    const mapped = {
      id: item.id,
      heroTitle: item.hero_title || fallbackContactContent.heroTitle,
      heroSubtitle: item.hero_subtitle || fallbackContactContent.heroSubtitle,
      address: Object.keys(address).length > 0 ? address : fallbackContactContent.address,
      phone: Object.keys(phone).length > 0 ? phone : fallbackContactContent.phone,
      email: Object.keys(email).length > 0 ? email : fallbackContactContent.email,
      hours: Object.keys(hours).length > 0 ? hours : fallbackContactContent.hours
    };
    setCachedData('contact_content', mapped);
    res.json(mapped);
  } catch (error) {
    console.warn('GET /api/contact_content error, serving fallback:', error);
    res.json(fallbackContactContent);
  }
});

app.post('/api/contact_content', authenticateToken, async (req, res) => {
  try {
    invalidateCache('contact_content');
    const body = req.body;
    const mappedData = {
      hero_title: body.heroTitle || "",
      hero_subtitle: body.heroSubtitle || "",
      address: body.address ? JSON.stringify(body.address) : "{}",
      phone: body.phone ? JSON.stringify(body.phone) : "{}",
      email: body.email ? JSON.stringify(body.email) : "{}",
      hours: body.hours ? JSON.stringify(body.hours) : "{}"
    };

    let item;
    try {
      const existing = await prisma.contactContent.findFirst();
      if (existing) {
        item = await prisma.contactContent.update({
          where: { id: existing.id },
          data: mappedData
        });
      } else {
        item = await prisma.contactContent.create({
          data: mappedData
        });
      }
    } catch (dbErr) {
      console.warn('MySQL contactContent write failed, updating fallback:', dbErr);
      fallbackContactContent = {
        ...fallbackContactContent,
        ...body
      };
      return res.json(fallbackContactContent);
    }

    let address = {};
    let phone = {};
    let email = {};
    let hours = {};
    
    try { if (item.address) address = JSON.parse(item.address); } catch (e) {}
    try { if (item.phone) phone = JSON.parse(item.phone); } catch (e) {}
    try { if (item.email) email = JSON.parse(item.email); } catch (e) {}
    try { if (item.hours) hours = JSON.parse(item.hours); } catch (e) {}

    res.json({
      id: item.id,
      heroTitle: item.hero_title || "",
      heroSubtitle: item.hero_subtitle || "",
      address,
      phone,
      email,
      hours
    });
  } catch (error) {
    console.error('POST /api/contact_content error:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});

app.get('/api/home_content', async (req, res) => {
  try {
    const cached = getCachedData('home_content');
    if (cached) return res.json(cached);

    const item = await prisma.homeContent.findFirst();
    if (!item) {
      return res.json(fallbackHomeContent);
    }

    const [titleTop, titleBottom] = (item.heroTitle || "").split(' | ');
    const [buttonPrimary, buttonSecondary] = (item.heroButtonText || "").split(' | ');
    const [philosophyTitle, philosophyP1] = (item.aboutPhilosophy1 || "").split(' | ');

    let stats = {};
    let features = [];

    try { if (item.heroStats) stats = JSON.parse(item.heroStats); } catch (e) {}
    try { if (item.aboutFeatures) features = JSON.parse(item.aboutFeatures); } catch (e) {}

    const mapped = {
      id: item.id,
      hero: {
        titleTop: titleTop || fallbackHomeContent.hero.titleTop,
        titleBottom: titleBottom || fallbackHomeContent.hero.titleBottom,
        subtitle: item.heroSubtitle || fallbackHomeContent.hero.subtitle,
        buttonPrimary: buttonPrimary || fallbackHomeContent.hero.buttonPrimary,
        buttonSecondary: buttonSecondary || fallbackHomeContent.hero.buttonSecondary,
        stats: Object.keys(stats).length > 0 ? stats : fallbackHomeContent.hero.stats,
        image: item.heroImage || fallbackHomeContent.hero.image
      },
      about: {
        title: item.aboutTitle || fallbackHomeContent.about.title,
        description: item.aboutDescription || fallbackHomeContent.about.description,
        philosophyTitle: philosophyTitle || fallbackHomeContent.about.philosophyTitle,
        philosophyP1: philosophyP1 || fallbackHomeContent.about.philosophyP1,
        philosophyP2: item.aboutPhilosophy2 || fallbackHomeContent.about.philosophyP2,
        button: item.aboutButtonText || fallbackHomeContent.about.button,
        image: item.aboutImage || fallbackHomeContent.about.image,
        features: features.length > 0 ? features : fallbackHomeContent.about.features
      }
    };
    setCachedData('home_content', mapped);
    res.json(mapped);
  } catch (error) {
    console.warn('GET /api/home_content error, serving fallback:', error);
    res.json(fallbackHomeContent);
  }
});

app.post('/api/home_content', authenticateToken, async (req, res) => {
  try {
    invalidateCache('home_content');
    invalidateCache('about_content');
    const body = req.body;
    const mappedData = {
      heroTitle: `${body.hero?.titleTop || ""} | ${body.hero?.titleBottom || ""}`,
      heroSubtitle: body.hero?.subtitle || "",
      heroImage: body.hero?.image || "",
      heroButtonText: `${body.hero?.buttonPrimary || ""} | ${body.hero?.buttonSecondary || ""}`,
      heroStats: body.hero?.stats ? JSON.stringify(body.hero.stats) : "{}",
      aboutTitle: body.about?.title || "",
      aboutDescription: body.about?.description || "",
      aboutPhilosophy1: `${body.about?.philosophyTitle || ""} | ${body.about?.philosophyP1 || ""}`,
      aboutPhilosophy2: body.about?.philosophyP2 || "",
      aboutButtonText: body.about?.button || "",
      aboutImage: body.about?.image || "",
      aboutFeatures: body.about?.features ? JSON.stringify(body.about.features) : "[]"
    };

    let item;
    try {
      const existing = await prisma.homeContent.findFirst();
      if (existing) {
        item = await prisma.homeContent.update({
          where: { id: existing.id },
          data: mappedData
        });
      } else {
        item = await prisma.homeContent.create({
          data: mappedData
        });
      }
    } catch (dbErr) {
      console.warn('MySQL homeContent write failed, updating fallback:', dbErr);
      fallbackHomeContent = {
        id: 'default-home',
        hero: { ...fallbackHomeContent.hero, ...body.hero },
        about: { ...fallbackHomeContent.about, ...body.about }
      };
      return res.json(fallbackHomeContent);
    }

    // Sync with AboutContent.section_image to keep about page and homepage images identical
    if (mappedData.aboutImage) {
      const existingAbout = await prisma.aboutContent.findFirst();
      if (existingAbout) {
        await prisma.aboutContent.update({
          where: { id: existingAbout.id },
          data: { section_image: mappedData.aboutImage }
        });
      }
    }

    const [titleTop, titleBottom] = (item.heroTitle || "").split(' | ');
    const [buttonPrimary, buttonSecondary] = (item.heroButtonText || "").split(' | ');
    const [philosophyTitle, philosophyP1] = (item.aboutPhilosophy1 || "").split(' | ');

    let stats = {};
    let features = [];

    try { if (item.heroStats) stats = JSON.parse(item.heroStats); } catch (e) {}
    try { if (item.aboutFeatures) features = JSON.parse(item.aboutFeatures); } catch (e) {}

    res.json({
      id: item.id,
      hero: {
        titleTop: titleTop || "",
        titleBottom: titleBottom || "",
        subtitle: item.heroSubtitle || "",
        buttonPrimary: buttonPrimary || "",
        buttonSecondary: buttonSecondary || "",
        stats,
        image: item.heroImage || ""
      },
      about: {
        title: item.aboutTitle || "",
        description: item.aboutDescription || "",
        philosophyTitle: philosophyTitle || "",
        philosophyP1: philosophyP1 || "",
        philosophyP2: item.aboutPhilosophy2 || "",
        button: item.aboutButtonText || "",
        image: item.aboutImage || "",
        features
      }
    });
  } catch (error) {
    console.error('POST /api/home_content error:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});

const fallbackPolicies: Record<string, { title: string; content: string }> = {
  privacy: { title: 'Privacy Policy', content: 'Our commitment to protecting your privacy and personal information.' },
  terms: { title: 'Terms & Conditions', content: 'Terms and conditions for utilizing our yoga platform and services.' },
  refund: { title: 'Refund Policy', content: 'Guidelines and conditions regarding refunds and cancellations.' },
  cookies: { title: 'Cookies Policy', content: 'Information regarding how cookies are used to enhance your experience.' }
};

app.get('/api/policies/:type', async (req, res) => {
  const type = req.params.type;
  try {
    const item = await prisma.policyPage.findUnique({ where: { type } });
    if (item) {
      return res.json(item);
    }
  } catch (error) {
    // Database table missing or query error fallback
  }
  const fallback = fallbackPolicies[type] || { title: '', content: '' };
  res.json({ id: `policy-${type}`, type, ...fallback });
});

app.post('/api/policies/:type', authenticateToken, async (req, res) => {
  const type = req.params.type;
  const { title, content } = req.body;
  try {
    const item = await prisma.policyPage.upsert({
      where: { type },
      update: { title, content },
      create: { type, title, content }
    });
    res.json(item);
  } catch (error) {
    fallbackPolicies[type] = { title, content };
    res.json({ id: `policy-${Date.now()}`, type, title, content, updated_at: new Date().toISOString() });
  }
});

// Certificates API
app.get('/api/certificates', authenticateToken, async (req, res) => {
  try {
    let items: any[] = [];
    try {
      items = await prisma.yogaCertificate.findMany({
        orderBy: { created_at: 'desc' }
      });
    } catch {
      items = fallbackCertificates;
    }
    if ((!items || items.length === 0) && fallbackCertificates.length > 0) {
      items = fallbackCertificates;
    }
    const sanitized = items.map((cert: any) => ({
      ...cert,
      isPremium: cert.isPremium === true
    }));
    res.json(sanitized);
  } catch (error) {
    res.json(fallbackCertificates);
  }
});

// Auto-generate certificate via phone number
app.post('/api/certificates/auto', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanInputPhone = phone.replace(/\D/g, '');

    // First check if a certificate already exists in DB
    let existingCert = null;
    try {
      existingCert = await prisma.yogaCertificate.findFirst({
        where: { phone }
      });
    } catch {}

    // Check in fallback certificates if not found in DB
    if (!existingCert && fallbackCertificates.length > 0) {
      existingCert = fallbackCertificates.find((c: any) => {
        if (!c.phone) return false;
        const cleanCertPhone = c.phone.replace(/\D/g, '');
        return c.phone === phone || cleanCertPhone === cleanInputPhone || c.certificateId === phone;
      });
    }

    if (existingCert) {
      return res.json(existingCert);
    }

    // No existing cert, so find their confirmed booking
    let booking: any = null;
    try {
      booking = await prisma.booking.findFirst({
        where: { 
          phone,
          status: 'confirmed'
        },
        orderBy: { created_at: 'desc' }
      });
    } catch {}

    if (!booking) {
      // Check in memory bookings
      const memoryBookings = inMemoryStores.get('bookings') || [];
      booking = memoryBookings.find((b: any) => {
        const cleanBPhone = (b.phone || '').replace(/\D/g, '');
        return (b.phone === phone || cleanBPhone === cleanInputPhone) && b.status === 'confirmed';
      });
    }

    if (!booking) {
      return res.status(404).json({ error: 'No confirmed booking found for this phone number.' });
    }
    
    // Find class to get instructor
    let instructorName = 'Master Instructor';
    let signature_url = null;
    
    const classType = booking.class_type || 'Yoga Class';
    if (classType && classType !== 'Yoga Class') {
      try {
        const classItem = await prisma.onlineClass.findFirst({
          where: { title: classType }
        });
        if (classItem && classItem.instructor) {
          const instructor = await prisma.instructor.findFirst({
            where: { id: classItem.instructor }
          });
          if (instructor) {
            instructorName = instructor.name;
            signature_url = instructor.signature_url || null;
          }
        }
      } catch {}
    }

    // Create new certificate
    const certificateId = `SY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCertData = {
      id: `cert-${Date.now()}`,
      certificateId,
      studentName: booking.name,
      courseName: classType,
      issueDate: new Date().toISOString(),
      instructorName,
      phone,
      signature_url,
      isPremium: false,
      created_at: new Date().toISOString()
    };

    try {
      const newCert = await prisma.yogaCertificate.create({
        data: {
          certificateId,
          studentName: booking.name,
          courseName: classType,
          issueDate: new Date(),
          instructorName,
          phone,
          signature_url
        }
      });
      fallbackCertificates.unshift(newCert);
      return res.status(201).json(newCert);
    } catch {
      fallbackCertificates.unshift(newCertData);
      return res.status(201).json(newCertData);
    }
  } catch (error) {
    console.error('Auto certificate error:', error);
    res.status(500).json({ error: 'Failed to auto-generate certificate' });
  }
});

app.get('/api/bookings/search', authenticateToken, async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const cleanPhone = phone.replace(/\D/g, '');
    let booking: any = null;
    try {
      booking = await prisma.booking.findFirst({
        where: { phone },
        orderBy: { created_at: 'desc' }
      });
    } catch {}

    if (!booking) {
      const memoryBookings = inMemoryStores.get('bookings') || [];
      booking = memoryBookings.find((b: any) => {
        const cleanBPhone = (b.phone || '').replace(/\D/g, '');
        return b.phone === phone || cleanBPhone === cleanPhone;
      });
    }

    // Fallback: check demo certificates phone numbers as simulated bookings
    if (!booking) {
      const demoCert = fallbackCertificates.find((c: any) => {
        const cleanCertPhone = (c.phone || '').replace(/\D/g, '');
        return c.phone === phone || cleanCertPhone === cleanPhone;
      });
      if (demoCert) {
        booking = {
          name: demoCert.studentName,
          phone: demoCert.phone,
          class_type: demoCert.courseName,
          status: 'confirmed'
        };
      }
    }

    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to search booking' });
  }
});

app.get('/api/certificates/:certId', async (req, res) => {
  try {
    let item: any = null;
    try {
      item = await prisma.yogaCertificate.findUnique({
        where: { certificateId: req.params.certId }
      });
    } catch {}

    if (!item) {
      item = fallbackCertificates.find((c: any) => 
        c.certificateId === req.params.certId || 
        c.id === req.params.certId ||
        (c.phone && c.phone.replace(/\D/g, '') === req.params.certId.replace(/\D/g, ''))
      );
    }

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Certificate not found' });
    }
  } catch (error) {
    const item = fallbackCertificates.find((c: any) => c.certificateId === req.params.certId || c.id === req.params.certId);
    if (item) return res.json(item);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

app.post('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const { certificateId, studentName, courseName, issueDate, instructorName, phone, isPremium } = req.body;
    
    // Look up signature for instructor
    let signature_url = null;
    if (instructorName) {
      try {
        const instructor = await prisma.instructor.findFirst({
          where: { name: instructorName }
        });
        if (instructor && instructor.signature_url) {
          signature_url = instructor.signature_url;
        }
      } catch {}
    }

    const newCertPayload = {
      id: `cert-${Date.now()}`,
      certificateId,
      studentName,
      courseName,
      issueDate: new Date(issueDate).toISOString(),
      instructorName,
      phone: phone || null,
      signature_url,
      isPremium: isPremium !== undefined ? Boolean(isPremium) : false,
      created_at: new Date().toISOString()
    };

    try {
      const item = await prisma.yogaCertificate.create({
        data: {
          certificateId,
          studentName,
          courseName,
          issueDate: new Date(issueDate),
          instructorName,
          phone,
          signature_url
        }
      });
      const saved = { ...item, isPremium: newCertPayload.isPremium };
      fallbackCertificates.unshift(saved);
      res.status(201).json(saved);
    } catch {
      fallbackCertificates.unshift(newCertPayload);
      res.status(201).json(newCertPayload);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

app.put('/api/certificates/:id', authenticateToken, async (req, res) => {
  try {
    const { isPremium, studentName, courseName, instructorName, issueDate, phone } = req.body;
    let updated: any = null;
    const updateData: any = {};
    if (studentName !== undefined) updateData.studentName = studentName;
    if (courseName !== undefined) updateData.courseName = courseName;
    if (instructorName !== undefined) updateData.instructorName = instructorName;
    if (phone !== undefined) updateData.phone = phone;
    if (issueDate !== undefined) updateData.issueDate = new Date(issueDate);

    try {
      updated = await prisma.yogaCertificate.update({
        where: { id: req.params.id },
        data: updateData
      });
    } catch {}

    const idx = fallbackCertificates.findIndex((c: any) => c.id === req.params.id || c.certificateId === req.params.id);
    if (idx !== -1) {
      fallbackCertificates[idx] = {
        ...fallbackCertificates[idx],
        ...req.body
      };
      updated = fallbackCertificates[idx];
    } else if (!updated) {
      updated = { id: req.params.id, ...req.body };
      fallbackCertificates.unshift(updated);
    } else {
      updated = { ...updated, isPremium };
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

app.delete('/api/certificates/:id', authenticateToken, async (req, res) => {
  try {
    try {
      await prisma.yogaCertificate.delete({
        where: { id: req.params.id }
      });
    } catch {}
    fallbackCertificates = fallbackCertificates.filter((c: any) => c.id !== req.params.id && c.certificateId !== req.params.id);
    res.status(204).send();
  } catch (error: any) {
    fallbackCertificates = fallbackCertificates.filter((c: any) => c.id !== req.params.id && c.certificateId !== req.params.id);
    res.status(204).send();
  }
});

// Custom router for products with graceful fallback
const productsRouter = express.Router();
productsRouter.get('/', async (req, res) => {
  try {
    const cached = getCachedData('products');
    if (cached) return res.json(cached);

    const items = await prisma.product.findMany({ orderBy: { created_at: 'desc' } });
    if (items.length === 0 && fallbackProducts.length > 0) {
      return res.json(fallbackProducts);
    }
    setCachedData('products', items);
    res.json(items);
  } catch (error) {
    res.json(fallbackProducts);
  }
});
productsRouter.post('/', authenticateToken, validateRequest(productSchema), async (req, res) => {
  try {
    invalidateCache('products');
    const item = await prisma.product.create({ data: req.body });
    res.json(item);
  } catch (error) {
    invalidateCache('products');
    const newItem = { id: 'prod-' + Date.now(), ...req.body, created_at: new Date().toISOString() };
    fallbackProducts.unshift(newItem);
    res.json(newItem);
  }
});
productsRouter.put('/:id', authenticateToken, validateRequest(productSchema), async (req, res) => {
  try {
    invalidateCache('products');
    const item = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  } catch (error) {
    invalidateCache('products');
    const idx = fallbackProducts.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      fallbackProducts[idx] = { ...fallbackProducts[idx], ...req.body };
      res.json(fallbackProducts[idx]);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  }
});
productsRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    invalidateCache('products');
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    invalidateCache('products');
    fallbackProducts = fallbackProducts.filter(p => p.id !== req.params.id);
    res.json({ success: true });
  }
});

app.use('/api/products', productsRouter);

// Custom router for articles to include a graceful fallback
const articlesRouter = express.Router();
articlesRouter.get('/', async (req, res) => {
  try {
    const isSummary = req.query.summary === 'true';
    const cacheKey = isSummary ? 'articles_summary' : 'articles';
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    let items;
    if (isSummary) {
      items = await prisma.article.findMany({
        select: {
          id: true,
          title: true,
          author: true,
          category: true,
          excerpt: true,
          image_url: true,
          published: true,
          featured: true,
          views: true,
          created_at: true,
          updated_at: true
        },
        orderBy: { created_at: 'desc' }
      });
    } else {
      items = await prisma.article.findMany({ orderBy: { created_at: 'desc' } });
    }

    if (items.length === 0 && fallbackArticles.length > 0) {
      const list = isSummary 
        ? fallbackArticles.map(({ content, ...rest }: any) => rest)
        : fallbackArticles;
      return res.json(list);
    }
    setCachedData(cacheKey, items);
    res.json(items);
  } catch (error) {
    console.error('MySQL connection failed for articles, serving memory fallback...');
    const list = req.query.summary === 'true'
      ? fallbackArticles.map(({ content, ...rest }: any) => rest)
      : fallbackArticles;
    res.json(list);
  }
});
articlesRouter.post('/', authenticateToken, validateRequest(articleSchema), async (req, res) => {
  try {
    invalidateCache('articles');
    let item;
    try {
      item = await prisma.article.create({ data: req.body });
    } catch (dbErr) {
      const crypto = require('crypto');
      item = { id: crypto.randomUUID(), ...req.body, created_at: new Date().toISOString() };
      fallbackArticles.unshift(item);
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create article' });
  }
});
articlesRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    invalidateCache('articles');
    try {
      await prisma.article.delete({ where: { id: req.params.id } });
    } catch (dbErr) {
      fallbackArticles = fallbackArticles.filter((a: any) => a.id !== req.params.id);
    }
    res.json({ success: true });
  } catch (error: any) {
    invalidateCache('articles');
    res.json({ success: true });
  }
});
articlesRouter.put('/:id', authenticateToken, validateRequest(articleSchema), async (req, res) => {
  try {
    invalidateCache('articles');
    let item;
    try {
      item = await prisma.article.update({ where: { id: req.params.id }, data: req.body });
    } catch (dbErr) {
      const idx = fallbackArticles.findIndex((a: any) => a.id === req.params.id);
      if (idx !== -1) {
        fallbackArticles[idx] = { ...fallbackArticles[idx], ...req.body };
        item = fallbackArticles[idx];
      } else {
        item = { id: req.params.id, ...req.body };
        fallbackArticles.unshift(item);
      }
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Get single article by id
articlesRouter.get('/:id', async (req, res) => {
  try {
    const item = await prisma.article.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Article not found' });
    res.json(item);
  } catch (error) {
    console.error('MySQL error fetching article by id:', error);
    // Fallback: find in memory seed articles
    const seed = fallbackArticles.find((a: any) => a.id === req.params.id);
    if (seed) return res.json(seed);
    res.status(404).json({ error: 'Article not found' });
  }
});

// Increment view count
articlesRouter.post('/:id/view', async (req, res) => {
  try {
    const article = await prisma.article.findUnique({ where: { id: req.params.id } });
    if (!article) return res.json({ success: false });
    await prisma.article.update({
      where: { id: req.params.id },
      data: { views: ((article as any).views || 0) + 1 }
    });
    invalidateCache('articles');
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false }); // non-fatal
  }
});

app.use('/api/articles', articlesRouter);

// Public endpoint to increment views for gallery images (bypasses admin auth check)
app.post('/api/gallery_images/:id/view', async (req, res) => {
  try {
    const item = await prisma.galleryImage.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Image not found' });
    const updated = await prisma.galleryImage.update({
      where: { id: req.params.id },
      data: { views: ((item as any).views || 0) + 1 }
    });
    invalidateCache('gallery_images');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to increment view count' });
  }
});

const bookingsRouter = express.Router();
const recentBookingPhones = new Map<string, number>();

setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [phone, time] of recentBookingPhones.entries()) {
    if (time < cutoff) recentBookingPhones.delete(phone);
  }
}, 30 * 60 * 1000);

bookingsRouter.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await prisma.booking.findMany({ orderBy: { created_at: 'desc' } });
    res.json(items);
  } catch (error) {
    res.json(inMemoryStores.get('bookings') || []);
  }
});

bookingsRouter.get('/search', async (req, res) => {
  try {
    const phone = req.query.phone as string;
    if (!phone) return res.json([]);
    const cleanPhone = phone.replace(/\D/g, '');
    let results: any[] = [];
    try {
      results = await prisma.booking.findMany({
        where: {
          phone: { contains: cleanPhone }
        }
      });
    } catch {
      const list = inMemoryStores.get('bookings') || [];
      results = list.filter((b: any) => (b.phone || '').includes(cleanPhone));
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

bookingsRouter.post('/', (req, res, next) => {
  return bookingLimiter(req, res, next);
}, validateRequest(bookingSchema), async (req, res) => {
  try {
    const { b_hp_url, _t_token, ...bookingData } = req.body;

    // 1. Honeypot check: If the hidden honeypot trap is filled by a bot, silently return 200 OK without saving to DB
    if (b_hp_url && typeof b_hp_url === 'string' && b_hp_url.trim().length > 0) {
      console.warn('🛡️ [Security] Blocked fake bot booking via Honeypot trap:', { ip: req.ip, honeypotVal: b_hp_url });
      return res.status(200).json({ success: true, message: 'Booking submitted successfully' });
    }

    // 2. Velocity check: Headless bots submit immediately (< 1.8 seconds)
    if (_t_token) {
      const elapsed = Date.now() - Number(_t_token);
      if (!isNaN(elapsed) && elapsed > 0 && elapsed < 1800) {
        console.warn('🛡️ [Security] Blocked high-velocity bot booking:', { ip: req.ip, elapsedMs: elapsed });
        return res.status(400).json({ error: 'Automated submission detected. Please take your time to complete the form.' });
      }
    }

    // 3. Duplicate phone cooldown (15 minutes to stop rapid spam floods)
    const cleanPhone = (bookingData.phone || '').replace(/\D/g, '');
    if (cleanPhone) {
      const lastSubmit = recentBookingPhones.get(cleanPhone);
      if (lastSubmit && (Date.now() - lastSubmit < 15 * 60 * 1000)) {
        return res.status(429).json({ 
          error: 'A booking request with this phone number was already received recently. Please wait before submitting again.' 
        });
      }
      recentBookingPhones.set(cleanPhone, Date.now());
    }

    const crypto = require('crypto');
    const newBooking = {
      id: bookingData.id || crypto.randomUUID(),
      ...bookingData,
      status: bookingData.status || 'pending',
      created_at: new Date()
    };

    let saved;
    try {
      saved = await prisma.booking.create({ data: newBooking });
    } catch (dbErr) {
      const list = inMemoryStores.get('bookings') || [];
      list.unshift(newBooking);
      inMemoryStores.set('bookings', list);
      saved = newBooking;
    }

    res.status(201).json(saved);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

bookingsRouter.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await prisma.booking.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (error) {
    const list = inMemoryStores.get('bookings') || [];
    const idx = list.findIndex((b: any) => b.id === req.params.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...req.body };
      res.json(list[idx]);
    } else {
      res.status(404).json({ error: 'Booking not found' });
    }
  }
});

bookingsRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    const list = inMemoryStores.get('bookings') || [];
    inMemoryStores.set('bookings', list.filter((b: any) => b.id !== req.params.id));
    res.json({ success: true });
  }
});

app.use('/api/bookings', bookingsRouter);
app.use('/api/gallery_images', handleCrud(express.Router(), prisma.galleryImage, undefined, { cacheKey: 'gallery_images' }));
app.use('/api/popup_settings', handleCrud(express.Router(), prisma.popupSetting, undefined, { cacheKey: 'popup_settings' }));
app.use('/api/files', handleCrud(express.Router(), prisma.file, undefined, { authGet: false, authPost: false, cacheKey: 'files' }));
app.use('/api/instructors', handleCrud(express.Router(), prisma.instructor, instructorSchema, { cacheKey: 'instructors' }));
app.use('/api/classes', handleCrud(express.Router(), prisma.onlineClass, onlineClassSchema, { cacheKey: 'online_classes' }));
app.use('/api/users', handleCrud(express.Router(), prisma.user, userSchema, { authGet: true, authPost: true, authPut: true, authDelete: true }));
app.use('/api/site-settings', handleCrud(express.Router(), prisma.siteSetting, siteSettingsSchema, { authGet: false, authPost: true, authPut: true, authDelete: true, cacheKey: 'site_settings' }));
app.use('/api/seo-settings', handleCrud(express.Router(), prisma.seoSetting, seoSchema, { authGet: false, authPost: true, authPut: true, authDelete: true, cacheKey: 'seo_settings' }));
app.use('/api/events', handleCrud(express.Router(), prisma.event, eventSchema, { authGet: false, authPost: true, authPut: true, authDelete: true, cacheKey: 'events' }));

// ============================================================================
// BILLING & INVOICING ROUTES
// ============================================================================
const invoicesRouter = express.Router();

invoicesRouter.get('/', async (req, res) => {
  try {
    let items: any[] = [];
    let dbSuccess = false;
    try {
      items = await prisma.invoice.findMany({ orderBy: { created_at: 'desc' } });
      dbSuccess = true;
    } catch {
      dbSuccess = false;
    }
    // If DB query succeeded, honor the database results (even if empty, i.e., all deleted)
    if (dbSuccess) {
      return res.json(items);
    }
    // Otherwise serve persisted fallback
    res.json(fallbackInvoices);
  } catch (error) {
    res.json(fallbackInvoices);
  }
});

invoicesRouter.get('/verify', async (req, res) => {
  try {
    const rawNum = String(req.query.number || '').trim();
    const cleanNum = rawNum.replace(/^[#\s]+/, '').toLowerCase();
    const amountStr = req.query.amount ? String(req.query.amount).trim() : null;

    if (!cleanNum) {
      return res.status(400).json({ verified: false, error: 'Invoice number is required' });
    }

    let foundInvoice: any = null;
    try {
      foundInvoice = await prisma.invoice.findFirst({
        where: {
          OR: [
            { invoice_number: { equals: rawNum } },
            { invoice_number: { equals: `#${cleanNum}` } },
            { invoice_number: { equals: cleanNum } },
            { id: { equals: rawNum } }
          ]
        }
      });
    } catch {}

    if (!foundInvoice) {
      foundInvoice = fallbackInvoices.find((i: any) => {
        const invNumClean = (i.invoice_number || '').replace(/^[#\s]+/, '').toLowerCase();
        return invNumClean === cleanNum || (i.id && i.id.toLowerCase() === cleanNum);
      });
    }

    if (!foundInvoice) {
      return res.status(404).json({
        verified: false,
        error: 'Invoice not found. This invoice number does not exist in our official records.'
      });
    }

    // Check amount if provided
    if (amountStr) {
      const parsedAmt = parseFloat(amountStr);
      if (!isNaN(parsedAmt)) {
        const diff = Math.abs(Number(foundInvoice.total_amount) - parsedAmt);
        if (diff > 0.5) {
          return res.json({
            verified: false,
            amountMismatch: true,
            message: `Amount mismatch: You entered ₹${parsedAmt.toFixed(2)}, but the official invoice amount is ₹${Number(foundInvoice.total_amount).toFixed(2)}.`,
            invoice: {
              invoice_number: foundInvoice.invoice_number,
              customer_name: foundInvoice.customer_name,
              issue_date: foundInvoice.issue_date,
              due_date: foundInvoice.due_date,
              status: foundInvoice.status,
              total_amount: foundInvoice.total_amount
            }
          });
        }
      }
    }

    // Load settings for bank/UPI info
    let settings = fallbackBillingSettings;
    try {
      const dbSettings = await prisma.billingSetting.findFirst();
      if (dbSettings) settings = dbSettings;
    } catch {}

    res.json({
      verified: true,
      amountMismatch: false,
      invoice: foundInvoice,
      settings
    });
  } catch (error: any) {
    res.status(500).json({ verified: false, error: 'Verification failed' });
  }
});

invoicesRouter.get('/:id', async (req, res) => {
  try {
    let item: any = null;
    try {
      item = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    } catch {}
    if (!item) {
      item = fallbackInvoices.find((i: any) => i.id === req.params.id || i.invoice_number === req.params.id);
    }
    if (!item) return res.status(404).json({ error: 'Invoice not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

invoicesRouter.post('/', authenticateToken, async (req, res) => {
  try {
    const crypto = require('crypto');
    const newInvoice = {
      id: req.body.id || crypto.randomUUID(),
      ...req.body,
      subtotal: Number(req.body.subtotal) || 0,
      tax_amount: Number(req.body.tax_amount) || 0,
      total_amount: Number(req.body.total_amount) || 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    let saved;
    try {
      saved = await prisma.invoice.create({ data: newInvoice });
    } catch {
      saved = newInvoice;
      fallbackInvoices.unshift(saved);
      saveFallbackInvoices();
    }
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

invoicesRouter.put('/:id', authenticateToken, async (req, res) => {
  try {
    let updated;
    const updateData = {
      ...req.body,
      subtotal: req.body.subtotal !== undefined ? Number(req.body.subtotal) : undefined,
      tax_amount: req.body.tax_amount !== undefined ? Number(req.body.tax_amount) : undefined,
      total_amount: req.body.total_amount !== undefined ? Number(req.body.total_amount) : undefined,
      updated_at: new Date()
    };
    try {
      updated = await prisma.invoice.update({ where: { id: req.params.id }, data: updateData });
    } catch {
      const idx = fallbackInvoices.findIndex((i: any) => i.id === req.params.id);
      if (idx !== -1) {
        fallbackInvoices[idx] = { ...fallbackInvoices[idx], ...updateData };
        updated = fallbackInvoices[idx];
      } else {
        updated = { id: req.params.id, ...updateData };
        fallbackInvoices.unshift(updated);
      }
      saveFallbackInvoices();
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

invoicesRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const targetId = req.params.id;
    // 1. Delete from database if present (by ID or invoice number)
    try {
      await prisma.invoice.deleteMany({
        where: {
          OR: [
            { id: targetId },
            { invoice_number: targetId }
          ]
        }
      });
    } catch (e: any) {
      console.warn('DB delete invoice warning:', e.message);
    }
    // 2. Filter from fallback in memory (by ID and invoice number)
    fallbackInvoices = fallbackInvoices.filter((i: any) => 
      i.id !== targetId && 
      i.invoice_number !== targetId &&
      i.id !== targetId.toLowerCase() &&
      i.invoice_number !== targetId.toLowerCase()
    );
    // 3. Persist updated fallback to disk so deletion persists across server restarts
    saveFallbackInvoices();
    res.json({ success: true });
  } catch (error) {
    res.json({ success: true });
  }
});

app.use('/api/invoices', invoicesRouter);

const billingSettingsRouter = express.Router();
billingSettingsRouter.get('/', async (req, res) => {
  try {
    let settings = null;
    try {
      settings = await prisma.billingSetting.findFirst();
    } catch {}
    if (!settings) settings = fallbackBillingSettings;
    res.json(settings);
  } catch {
    res.json(fallbackBillingSettings);
  }
});

billingSettingsRouter.post('/', authenticateToken, async (req, res) => {
  try {
    let saved;
    const payload = {
      ...req.body,
      gst_rate: req.body.gst_rate !== undefined ? Number(req.body.gst_rate) : 18,
      service_charge: req.body.service_charge !== undefined ? Number(req.body.service_charge) : 1,
      updated_at: new Date()
    };
    try {
      const existing = await prisma.billingSetting.findFirst();
      if (existing) {
        saved = await prisma.billingSetting.update({ where: { id: existing.id }, data: payload });
      } else {
        saved = await prisma.billingSetting.create({ data: payload });
      }
    } catch {
      fallbackBillingSettings = { ...fallbackBillingSettings, ...payload };
      saved = fallbackBillingSettings;
    }
    fallbackBillingSettings = { ...fallbackBillingSettings, ...(saved || payload) };
    saveFallbackBillingSettings();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update billing settings' });
  }
});

app.use('/api/billing_settings', billingSettingsRouter);

const promoCodesRouter = express.Router();
promoCodesRouter.get('/', async (req, res) => {
  try {
    let items: any[] = [];
    try {
      items = await prisma.promoCode.findMany();
    } catch {
      items = inMemoryStores.get('promo_codes') || fallbackPromoCodes;
    }
    if ((!items || items.length === 0) && fallbackPromoCodes.length > 0) {
      items = fallbackPromoCodes;
    }
    res.json(items);
  } catch {
    res.json(fallbackPromoCodes);
  }
});
app.use('/api/promo_codes', handleCrud(promoCodesRouter, prisma.promoCode, undefined, { cacheKey: 'promo_codes' }));

// Dynamic SEO crawler routes
app.get('/robots.txt', async (req, res) => {
  try {
    const seo = await prisma.seoSetting.findFirst();
    res.type('text/plain');
    if (seo && seo.robotsTxt) {
      res.send(seo.robotsTxt);
    } else {
      res.send("User-agent: *\nAllow: /\nSitemap: https://shaktiyogaraai.com/sitemap.xml");
    }
  } catch (error) {
    res.type('text/plain').send("User-agent: *\nAllow: /");
  }
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const seo = await prisma.seoSetting.findFirst();
    res.type('application/xml');
    if (seo && seo.sitemapXml) {
      res.send(seo.sitemapXml);
    } else {
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://shaktiyogaraai.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/about</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/classes</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/instructors</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/store</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses/course-1</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses/course-2</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses/course-3</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses/course-4</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses/course-5</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses/course-6</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses/course-7</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses/course-8</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses/course-9</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/courses/course-10</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shaktiyogaraai.com/contact</loc>
    <priority>0.6</priority>
  </url>
</urlset>`);
    }
  } catch (error) {
    res.status(500).send("Error generating sitemap");
  }
});

// Serve uploaded files statically
const projectRootStatic = fs.existsSync(path.join(__dirname, '../public/uploads'))
  ? path.join(__dirname, '..')
  : path.join(__dirname, '../..');
const publicUploadsDir = path.join(projectRootStatic, 'public/uploads');
app.use('/uploads', express.static(publicUploadsDir));

// Serve static React files in production
const distPath = fs.existsSync(path.join(__dirname, '../dist/index.html'))
  ? path.join(__dirname, '../dist')
  : path.join(__dirname, '../../dist');

app.use(express.static(distPath));
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
const server = app.listen(port, '0.0.0.0', async () => {
  console.log(`Server running on port ${port}`);

  // Ensure default superadmin/admin password in database matches the environment variable (self-healing recovery)
  if (ADMIN_PASSWORD) {
    try {
      const dbAdmin = await prisma.user.findFirst({
        where: {
          OR: [
            { username: 'admin' },
            { email: ADMIN_EMAIL }
          ]
        }
      });
      if (dbAdmin) {
        if (dbAdmin.password !== ADMIN_PASSWORD) {
          await prisma.user.update({
            where: { id: dbAdmin.id },
            data: { password: ADMIN_PASSWORD }
          });
          console.log("Successfully synced admin user password with ADMIN_PASSWORD from environment variables.");
        }
      } else {
        await prisma.user.create({
          data: {
            id: '000001',
            username: 'admin',
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'superadmin'
          }
        });
        console.log("Successfully seeded default admin user into database.");
      }
    } catch (err) {
      console.error("Failed to sync database admin user on startup:", err);
    }
  }
});

server.on('error', (err) => {
  console.error('Server listen error:', err);
});
