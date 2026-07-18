import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required'),
  category: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  views: z.number().int().nonnegative().optional().default(0),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  priceUSD: z.number().nonnegative().optional().nullable(),
  image_url: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  whatsapp_message: z.string().optional().nullable(),
  stock_quantity: z.number().int().nonnegative().optional().default(0),
  is_available: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false),
  buy_action: z.enum(['whatsapp', 'link', 'razorpay']).optional().default('whatsapp'),
  external_link: z.string().optional().nullable(),
});

export const instructorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  certifications: z.string().optional().nullable(),
  rating: z.number().nonnegative().max(5).optional().default(0),
  students: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  connected_user: z.string().optional().nullable(),
});

export const onlineClassSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instructor: z.string().optional().nullable(),
  classStarting: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  priceUSD: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  rating: z.number().nonnegative().max(5).optional().default(0),
  features: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  joinLink: z.string().optional().nullable(),
  maxSeats: z.number().int().nonnegative().optional().default(0),
  availableSeats: z.number().int().nonnegative().optional().default(0),
  featured: z.boolean().optional().default(false),
});

export const userSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['guest', 'user', 'admin', 'superadmin', 'instructor']),
  phone: z.string().optional().nullable(),
});

export const seoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  keywords: z.string().optional().nullable(),
  robotsTxt: z.string().optional().nullable(),
  sitemapXml: z.string().optional().nullable(),
});

export const siteSettingsSchema = z.object({
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  socialLinks: z.string().optional().nullable(),
  businessName: z.string().optional().nullable(),
  businessEmail: z.string().optional().nullable(),
  businessPhone: z.string().optional().nullable(),
});

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  price: z.string().min(1, 'Price is required'),
  image: z.string().min(1, 'Image URL is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  joinUrl: z.string().min(1, 'Join URL is required'),
  buttonText: z.string().optional().nullable(),
  buttonUrl: z.string().optional().nullable(),
});
