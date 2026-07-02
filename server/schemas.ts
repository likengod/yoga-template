import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required'),
  category: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  published: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  views: z.number().int().nonnegative().optional().default(0),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  category: z.string().optional().nullable(),
  whatsapp_message: z.string().optional().nullable(),
  stock_quantity: z.number().int().nonnegative().optional().default(0),
  is_available: z.boolean().optional().default(true),
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
  image: z.string().url().optional().nullable().or(z.literal('')),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
});

export const onlineClassSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  instructor: z.string().optional().nullable(),
  classStarting: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  rating: z.number().nonnegative().max(5).optional().default(0),
  features: z.string().optional().nullable(),
  image: z.string().url().optional().nullable().or(z.literal('')),
  joinLink: z.string().url().optional().nullable().or(z.literal('')),
  maxSeats: z.number().int().nonnegative().optional().default(0),
  availableSeats: z.number().int().nonnegative().optional().default(0),
  featured: z.boolean().optional().default(false),
});
