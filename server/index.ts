import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { z, ZodError } from 'zod';
import { articleSchema, productSchema, instructorSchema, onlineClassSchema, userSchema, seoSchema, siteSettingsSchema, eventSchema } from './schemas';
import { checkSetupStatus, saveConfigAndInitialize } from './setup';

dotenv.config({ override: true });

const isLocalDev = fs.existsSync(path.join(process.cwd(), '..', 'vite.config.ts')) || fs.existsSync(path.join(process.cwd(), 'vite.config.ts'));

const app = express();
const prisma = new PrismaClient();
const port = isLocalDev 
  ? 3001 
  : ((Number(process.env.PORT) === 3306 ? 3001 : Number(process.env.PORT)) || 3001);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production mode!');
  }
  console.warn('WARNING: JWT_SECRET environment variable is missing. Using fallback insecure key.');
}
const ACTUAL_JWT_SECRET = JWT_SECRET || 'shakti-yoga-super-secret-key';
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

// Rate limiter for login route to prevent brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

// Rate limiter for booking requests to prevent database flooding (max 5 submissions per hour)
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many booking requests from this IP, please try again after an hour' }
});

// Rate limiter for user registrations (max 10 registrations per 15 minutes)
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many registration requests from this IP, please try again after 15 minutes' }
});

// Admin & User Login Endpoint
app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  
  // Define valid admin accounts dynamically
  const adminAccounts = [];
  if (ADMIN_PASSWORD) {
    adminAccounts.push({ username: 'admin', password: ADMIN_PASSWORD, role: 'admin', email: ADMIN_EMAIL });
  }
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
          { username: username },
          { email: username }
        ]
      }
    });

    if (dbUser) {
      if (dbUser.password === password) {
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
    acc => (acc.username === username || acc.email === username) && acc.password === password
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

    let uniqueId = '';
    let isUnique = false;
    while (!isUnique) {
      uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
      const existingUser = await prisma.user.findUnique({ where: { id: uniqueId } });
      if (!existingUser) {
        isUnique = true;
      }
    }

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

// Helper to handle generic CRUD
// Dynamic Crud routes
const handleCrud = (
  router: any,
  model: any,
  schema?: z.ZodSchema,
  options?: { authGet?: boolean; authPost?: boolean; authPut?: boolean; authDelete?: boolean }
) => {
  const authGet = options?.authGet ?? false;
  const authPost = options?.authPost ?? true;
  const authPut = options?.authPut ?? true;
  const authDelete = options?.authDelete ?? true;

  const checkAuth = (required: boolean) => {
    return required ? authenticateToken : (req: any, res: any, next: any) => next();
  };

  router.get('/', checkAuth(authGet), async (req: any, res: any) => {
    try {
      const items = await model.findMany();
      res.json(items);
    } catch (error) {
      console.error('handleCrud GET error:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  });

  // Apply authentication and validation to mutating routes
  router.post('/', checkAuth(authPost), validateRequest(schema), async (req: any, res: any) => {
    try {
      const { id, created_at, updated_at, ...data } = req.body;
      const crypto = require('crypto');
      const payload = {
        id: id || crypto.randomUUID(),
        ...data
      };
      const item = await model.create({ data: payload });
      res.json(item);
    } catch (error) {
      console.error('handleCrud POST error:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  });

  router.put('/:id', checkAuth(authPut), validateRequest(schema), async (req: any, res: any) => {
    try {
      const { id, created_at, updated_at, ...data } = req.body;
      const item = await model.update({
        where: { id: req.params.id },
        data
      });
      res.json(item);
    } catch (error) {
      console.error('handleCrud PUT error:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  });

  router.delete('/:id', checkAuth(authDelete), async (req: any, res: any) => {
    try {
      await model.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error: any) {
      if (error && error.code === 'P2025') {
        return res.json({ success: true, message: 'Already deleted' });
      }
      console.error('handleCrud DELETE error:', error);
      res.status(500).json({ error: 'Failed to delete item' });
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
    const item = await prisma.aboutContent.findFirst();
    if (!item) {
      return res.json({});
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
    console.error('GET /api/about_content error:', error);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.post('/api/about_content', authenticateToken, async (req, res) => {
  try {
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

    const existing = await prisma.aboutContent.findFirst();
    let item;
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

    // Sync with HomeContent.aboutImage to keep homepage and about page images identical
    if (mappedData.section_image) {
      const existingHome = await prisma.homeContent.findFirst();
      if (existingHome) {
        await prisma.homeContent.update({
          where: { id: existingHome.id },
          data: { aboutImage: mappedData.section_image }
        });
      }
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
    const item = await prisma.contactContent.findFirst();
    if (!item) {
      return res.json({});
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
    console.error('GET /api/contact_content error:', error);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.post('/api/contact_content', authenticateToken, async (req, res) => {
  try {
    const body = req.body;
    const mappedData = {
      hero_title: body.heroTitle || "",
      hero_subtitle: body.heroSubtitle || "",
      address: body.address ? JSON.stringify(body.address) : "{}",
      phone: body.phone ? JSON.stringify(body.phone) : "{}",
      email: body.email ? JSON.stringify(body.email) : "{}",
      hours: body.hours ? JSON.stringify(body.hours) : "{}"
    };

    const existing = await prisma.contactContent.findFirst();
    let item;
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
    const item = await prisma.homeContent.findFirst();
    if (!item) {
      return res.json({});
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
    console.error('GET /api/home_content error:', error);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.post('/api/home_content', authenticateToken, async (req, res) => {
  try {
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

    const existing = await prisma.homeContent.findFirst();
    let item;
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

app.get('/api/policies/:type', async (req, res) => {
  try {
    const item = await prisma.policyPage.findUnique({ where: { type: req.params.type } });
    if (item) {
      res.json(item);
    } else {
      res.json({ title: '', content: '' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

app.post('/api/policies/:type', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const item = await prisma.policyPage.upsert({
      where: { type: req.params.type },
      update: { title, content },
      create: { type: req.params.type, title, content }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update policy' });
  }
});

// Certificates API
app.get('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const items = await prisma.yogaCertificate.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Auto-generate certificate via phone number
app.post('/api/certificates/auto', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // First check if a certificate already exists for this exact phone number!
    const existingCert = await prisma.yogaCertificate.findFirst({
      where: { phone }
    });

    if (existingCert) {
      return res.json(existingCert);
    }

    // No existing cert, so find their confirmed booking
    const booking = await prisma.booking.findFirst({
      where: { 
        phone,
        status: 'confirmed'
      },
      orderBy: { created_at: 'desc' }
    });

    if (!booking) {
      return res.status(404).json({ error: 'No confirmed booking found for this phone number.' });
    }
    
    // Find class to get instructor
    let instructorName = 'Master Instructor';
    let signature_url = null;
    
    const classType = booking.class_type || 'Yoga Class';
    if (classType && classType !== 'Yoga Class') {
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
    }

    // Create new certificate
    const certificateId = `SY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
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

    res.status(201).json(newCert);
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
    const booking = await prisma.booking.findFirst({
      where: { phone },
      orderBy: { created_at: 'desc' }
    });
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
    const item = await prisma.yogaCertificate.findUnique({
      where: { certificateId: req.params.certId }
    });
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

app.post('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const { certificateId, studentName, courseName, issueDate, instructorName, phone } = req.body;
    
    // Look up signature for instructor
    let signature_url = null;
    if (instructorName) {
      const instructor = await prisma.instructor.findFirst({
        where: { name: instructorName }
      });
      if (instructor && instructor.signature_url) {
        signature_url = instructor.signature_url;
      }
    }

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
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

app.delete('/api/certificates/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.yogaCertificate.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error && error.code === 'P2025') {
      return res.status(204).send();
    }
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

// Custom router for products with graceful fallback
const productsRouter = express.Router();
productsRouter.get('/', async (req, res) => {
  try {
    const items = await prisma.product.findMany({ orderBy: { created_at: 'desc' } });
    if (items.length === 0 && fallbackProducts.length > 0) {
      return res.json(fallbackProducts);
    }
    res.json(items);
  } catch (error) {
    res.json(fallbackProducts);
  }
});
productsRouter.post('/', authenticateToken, validateRequest(productSchema), async (req, res) => {
  try {
    const item = await prisma.product.create({ data: req.body });
    res.json(item);
  } catch (error) {
    const newItem = { id: 'prod-' + Date.now(), ...req.body, created_at: new Date().toISOString() };
    fallbackProducts.unshift(newItem);
    res.json(newItem);
  }
});
productsRouter.put('/:id', authenticateToken, validateRequest(productSchema), async (req, res) => {
  try {
    const item = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  } catch (error) {
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
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    fallbackProducts = fallbackProducts.filter(p => p.id !== req.params.id);
    res.json({ success: true });
  }
});

app.use('/api/products', productsRouter);

// Custom router for articles to include a graceful fallback
const articlesRouter = express.Router();
articlesRouter.get('/', async (req, res) => {
  try {
    const items = await prisma.article.findMany({ orderBy: { created_at: 'desc' } });
    if (items.length === 0 && fallbackArticles.length > 0) {
      return res.json(fallbackArticles);
    }
    res.json(items);
  } catch (error) {
    console.error('MySQL connection failed for articles, serving memory fallback...');
    res.json(fallbackArticles);
  }
});
articlesRouter.post('/', authenticateToken, validateRequest(articleSchema), async (req, res) => {
  try {
    const item = await prisma.article.create({ data: req.body });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item in MySQL' });
  }
});
articlesRouter.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error && error.code === 'P2025') {
      return res.json({ success: true, message: 'Already deleted' });
    }
    res.status(500).json({ error: 'Failed to delete item in MySQL' });
  }
});
articlesRouter.put('/:id', authenticateToken, validateRequest(articleSchema), async (req, res) => {
  try {
    const item = await prisma.article.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item in MySQL' });
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
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to increment view count' });
  }
});

app.use('/api/bookings', (req, res, next) => {
  if (req.method === 'POST') {
    return bookingLimiter(req, res, next);
  }
  next();
}, handleCrud(express.Router(), prisma.booking, undefined, { authGet: true, authPost: false }));
app.use('/api/gallery_images', handleCrud(express.Router(), prisma.galleryImage));
app.use('/api/popup_settings', handleCrud(express.Router(), prisma.popupSetting));
app.use('/api/files', handleCrud(express.Router(), prisma.file, undefined, { authGet: true, authPost: true }));
app.use('/api/instructors', handleCrud(express.Router(), prisma.instructor, instructorSchema));
app.use('/api/classes', handleCrud(express.Router(), prisma.onlineClass, onlineClassSchema));
app.use('/api/users', handleCrud(express.Router(), prisma.user, userSchema, { authGet: true, authPost: true, authPut: true, authDelete: true }));
app.use('/api/site-settings', handleCrud(express.Router(), prisma.siteSetting, siteSettingsSchema, { authGet: false, authPost: true, authPut: true, authDelete: true }));
app.use('/api/seo-settings', handleCrud(express.Router(), prisma.seoSetting, seoSchema, { authGet: false, authPost: true, authPut: true, authDelete: true }));
app.use('/api/events', handleCrud(express.Router(), prisma.event, eventSchema, { authGet: false, authPost: true, authPut: true, authDelete: true }));

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
app.listen(port, '0.0.0.0', async () => {
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
