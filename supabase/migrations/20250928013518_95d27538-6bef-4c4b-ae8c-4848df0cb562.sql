-- Add missing RLS policies for admin operations on popup_settings
CREATE POLICY "Allow all operations on popup_settings" 
ON public.popup_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add missing RLS policies for admin operations on other tables
CREATE POLICY "Allow all operations on articles" 
ON public.articles 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on gallery_images" 
ON public.gallery_images 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on about_content" 
ON public.about_content 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on contact_content" 
ON public.contact_content 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on products" 
ON public.products 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update bookings to allow status updates
CREATE POLICY "Allow all operations on bookings" 
ON public.bookings 
FOR ALL 
USING (true) 
WITH CHECK (true);