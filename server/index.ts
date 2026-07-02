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
import { articleSchema, productSchema, instructorSchema, onlineClassSchema } from './schemas';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = 3001;

const JWT_SECRET = process.env.JWT_SECRET || 'shakti-yoga-super-secret-key';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Security & Optimization Middlewares
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://shaktiyogaraai.com', 'https://www.shaktiyogaraai.com'] 
    : '*'
}));
app.use(express.json({ limit: '50mb' }));

// Rate limiter for login route to prevent brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

// Admin Login Endpoint
app.post('/api/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// JWT Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
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
let fallbackProducts: any[] = [];
// Bypass TypeScript and CommonJS ESM constraints by using raw dynamic import
eval(`import('../src/utils/seedData.ts')`).then((module: any) => {
  fallbackArticles = module.SEED_ARTICLES;
}).catch((e: any) => console.log('Could not load fallback articles', e.message));

eval(`import('../src/data/seedProducts.ts')`).then((module: any) => {
  fallbackProducts = module.SEED_PRODUCTS;
}).catch((e: any) => console.log('Could not load fallback products', e.message));

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../public/uploads');
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
const handleCrud = (router: any, model: any, schema?: z.ZodSchema) => {
  router.get('/', async (req: any, res: any) => {
    try {
      const items = await model.findMany();
      res.json(items);
    } catch (error) {
      console.error('handleCrud GET error:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  });

  // Apply authentication and validation to mutating routes
  router.post('/', authenticateToken, validateRequest(schema), async (req: any, res: any) => {
    try {
      const item = await model.create({ data: req.body });
      res.json(item);
    } catch (error) {
      console.error('handleCrud POST error:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  });

  router.put('/:id', authenticateToken, validateRequest(schema), async (req: any, res: any) => {
    try {
      const item = await model.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(item);
    } catch (error) {
      console.error('handleCrud PUT error:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  });

  router.delete('/:id', authenticateToken, async (req: any, res: any) => {
    try {
      await model.delete({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
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

// Singletons (Upsert logic)
app.get('/api/about_content', async (req, res) => {
  try {
    const item = await prisma.aboutContent.findFirst();
    res.json(item || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});
app.post('/api/about_content', authenticateToken, async (req, res) => {
  try {
    const existing = await prisma.aboutContent.findFirst();
    let item;
    if (existing) {
      item = await prisma.aboutContent.update({ where: { id: existing.id }, data: req.body });
    } else {
      item = await prisma.aboutContent.create({ data: req.body });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

app.get('/api/contact_content', async (req, res) => {
  try {
    const item = await prisma.contactContent.findFirst();
    res.json(item || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});
app.post('/api/contact_content', authenticateToken, async (req, res) => {
  try {
    const existing = await prisma.contactContent.findFirst();
    let item;
    if (existing) {
      item = await prisma.contactContent.update({ where: { id: existing.id }, data: req.body });
    } else {
      item = await prisma.contactContent.create({ data: req.body });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

app.get('/api/home_content', async (req, res) => {
  try {
    const item = await prisma.homeContent.findFirst();
    res.json(item || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});
app.post('/api/home_content', authenticateToken, async (req, res) => {
  try {
    const existing = await prisma.homeContent.findFirst();
    let item;
    if (existing) {
      item = await prisma.homeContent.update({ where: { id: existing.id }, data: req.body });
    } else {
      item = await prisma.homeContent.create({ data: req.body });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Custom router for products with graceful fallback
const productsRouter = express.Router();
productsRouter.get('/', async (req, res) => {
  try {
    const items = await prisma.product.findMany({ orderBy: { created_at: 'desc' } });
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
  } catch (error) {
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

app.use('/api/bookings', handleCrud(express.Router(), prisma.booking));
app.use('/api/gallery_images', handleCrud(express.Router(), prisma.galleryImage));
app.use('/api/popup_settings', handleCrud(express.Router(), prisma.popupSetting));
app.use('/api/files', handleCrud(express.Router(), prisma.file));
app.use('/api/instructors', handleCrud(express.Router(), prisma.instructor, instructorSchema));
app.use('/api/classes', handleCrud(express.Router(), prisma.onlineClass, onlineClassSchema));

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
