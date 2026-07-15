export interface OnlineClass {
  id: string;
  title: string;
  instructor: string;
  classStarting?: string;
  description: string;
  price: string;
  priceUSD?: string;
  duration: string;
  capacity: string;
  schedule: string;
  level: string;
  rating: number;
  features: string[];
  image: string;
  joinLink?: string;
  maxSeats?: number;
  availableSeats?: number;
  featured?: boolean;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  created_at: string;
  image_url?: string;
  category: string;
  published?: boolean;
  views?: number;
  featured?: boolean;
}
