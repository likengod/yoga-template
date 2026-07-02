
-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  students TEXT NOT NULL,
  price TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  rating DECIMAL(2,1) DEFAULT 5.0,
  type TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create programs_section table for section content
CREATE TABLE IF NOT EXISTS programs_section (
  id TEXT PRIMARY KEY DEFAULT 'default',
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cta_title TEXT NOT NULL,
  cta_subtitle TEXT NOT NULL,
  cta_button_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs_section ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on programs" ON programs
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on programs_section" ON programs_section
  FOR SELECT USING (true);

-- Create policies for authenticated write access
CREATE POLICY "Allow authenticated insert on programs" ON programs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on programs" ON programs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on programs" ON programs
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert on programs_section" ON programs_section
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on programs_section" ON programs_section
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default programs section content
INSERT INTO programs_section (id, title, subtitle, cta_title, cta_subtitle, cta_button_text)
VALUES (
  'default',
  'Our Transformational Programs',
  'Choose from our carefully crafted programs designed to meet you wherever you are in your spiritual journey. Each offering provides a unique path to transformation and growth.',
  'Ready to Begin Your Transformation?',
  'Connect with our experienced guides to find the perfect program for your spiritual journey.',
  'Schedule Free Consultation'
) ON CONFLICT (id) DO NOTHING;
