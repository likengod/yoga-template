
-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  image_url TEXT,
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery_images table
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create instructors table
CREATE TABLE public.instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience TEXT NOT NULL,
  certifications TEXT[],
  rating DECIMAL(2,1) DEFAULT 4.5,
  students TEXT DEFAULT '0+',
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_content table
CREATE TABLE public.contact_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  address_street TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_zip TEXT NOT NULL,
  address_country TEXT NOT NULL,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  phone_whatsapp TEXT,
  email_info TEXT NOT NULL,
  email_classes TEXT,
  email_support TEXT,
  hours_weekdays TEXT NOT NULL,
  hours_saturday TEXT NOT NULL,
  hours_sunday TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create popup_settings table
CREATE TABLE public.popup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  button_text TEXT NOT NULL,
  button_url TEXT NOT NULL,
  image TEXT,
  delay INTEGER DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create about_content table
CREATE TABLE public.about_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  hero_image TEXT NOT NULL,
  section_image TEXT NOT NULL,
  mission TEXT NOT NULL,
  vision TEXT NOT NULL,
  values TEXT[] NOT NULL,
  story TEXT NOT NULL,
  founder_name TEXT NOT NULL,
  founder_title TEXT NOT NULL,
  founder_bio TEXT NOT NULL,
  founder_image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  class_type TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT,
  experience TEXT,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access and admin write access
-- Articles policies
CREATE POLICY "Anyone can view articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert articles" ON public.articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update articles" ON public.articles FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete articles" ON public.articles FOR DELETE USING (true);

-- Gallery policies
CREATE POLICY "Anyone can view gallery" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gallery" ON public.gallery_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update gallery" ON public.gallery_images FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete gallery" ON public.gallery_images FOR DELETE USING (true);

-- Instructors policies
CREATE POLICY "Anyone can view instructors" ON public.instructors FOR SELECT USING (true);
CREATE POLICY "Anyone can insert instructors" ON public.instructors FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update instructors" ON public.instructors FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete instructors" ON public.instructors FOR DELETE USING (true);

-- Contact content policies
CREATE POLICY "Anyone can view contact content" ON public.contact_content FOR SELECT USING (true);
CREATE POLICY "Anyone can insert contact content" ON public.contact_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update contact content" ON public.contact_content FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete contact content" ON public.contact_content FOR DELETE USING (true);

-- Popup settings policies
CREATE POLICY "Anyone can view popup settings" ON public.popup_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert popup settings" ON public.popup_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update popup settings" ON public.popup_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete popup settings" ON public.popup_settings FOR DELETE USING (true);

-- About content policies
CREATE POLICY "Anyone can view about content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Anyone can insert about content" ON public.about_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update about content" ON public.about_content FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete about content" ON public.about_content FOR DELETE USING (true);

-- Bookings policies
CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete bookings" ON public.bookings FOR DELETE USING (true);

-- Insert default data
INSERT INTO public.contact_content (
  hero_title, hero_subtitle, address_street, address_city, address_state, 
  address_zip, address_country, phone_primary, phone_secondary, phone_whatsapp,
  email_info, email_classes, email_support, hours_weekdays, hours_saturday, hours_sunday
) VALUES (
  'Get In Touch',
  'Ready to begin your yoga journey? We''re here to support you every step of the way.',
  '123 Wellness Street',
  'Mumbai',
  'Maharashtra',
  '400001',
  'India',
  '+91 87778 16410',
  '+91 87778 16410',
  'WhatsApp Available',
  'info@shaktiyogaraai.com',
  'classes@shaktiyogaraai.com',
  'support@shaktiyogaraai.com',
  'Monday - Friday: 6:00 AM - 9:00 PM',
  'Saturday: 7:00 AM - 8:00 PM',
  'Sunday: 8:00 AM - 6:00 PM'
);

INSERT INTO public.popup_settings (
  enabled, title, message, button_text, button_url, image, delay
) VALUES (
  true,
  'Transform Your Life with Yoga',
  'Join thousands who have discovered inner peace and strength through our authentic yoga practices. Start your journey today with a free consultation.',
  'Get Free Consultation',
  'https://wa.me/918777816410?text=Hi! I would like to schedule a free yoga consultation.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  10000
);

INSERT INTO public.about_content (
  hero_title, hero_subtitle, hero_image, section_image, mission, vision, 
  values, story, founder_name, founder_title, founder_bio, founder_image
) VALUES (
  'About Shakti Yoga Raai',
  'Transforming lives through authentic yoga practices and spiritual guidance',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'https://i.postimg.cc/ZnnS7KY3/Whats-App-Image-2025-06-06-at-11-19-59-PM.jpg',
  'To provide authentic, transformative yoga experiences that nurture the mind, body, and spirit, helping individuals discover their inner strength and achieve holistic wellness.',
  'To create a global community of conscious individuals who embrace yoga as a way of life, spreading peace, healing, and spiritual awakening.',
  ARRAY['Authenticity in traditional yoga practices', 'Compassionate guidance for all levels', 'Holistic approach to wellness', 'Community and connection', 'Continuous learning and growth'],
  'Shakti Yoga Raai was born from a deep passion for sharing the transformative power of yoga. Founded with the vision of creating a sacred space where ancient wisdom meets modern life, we have been guiding students on their journey of self-discovery for over a decade.',
  'Sushmita Debnath',
  'Founder & Lead Instructor',
  'With over 15 years of dedicated practice and teaching, Sushmita brings authentic yoga wisdom to modern practitioners. Her gentle yet powerful approach has transformed hundreds of lives.',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
);
