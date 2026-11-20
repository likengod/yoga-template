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
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
  geo_region?: string;
  geo_placename?: string;
  geo_position?: string;
  aeo_key_takeaways?: string;
  aeo_faq_json?: string;
}
