-- Create password reset OTP table
CREATE TABLE public.password_reset_otps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own OTPs" ON public.password_reset_otps
FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.uid() IS NULL);

CREATE POLICY "Anyone can create OTPs" ON public.password_reset_otps
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own OTPs" ON public.password_reset_otps
FOR UPDATE USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.uid() IS NULL);

-- Add homes/rental properties to estate table
INSERT INTO public.estate (
  name, title, location, property_category, type, bedrooms, bathrooms, 
  promo_price, actual_price, size, description, media, is_for_sale, is_for_rent, monthly_rent, annual_rent
) VALUES 
-- Lagos Properties
('Luxury 3BR Apartment Lagos', 'Premium 3-Bedroom Apartment in Victoria Island', 'Lagos', 'home', 'apartment', 3, 2, 
 45000000, 50000000, 120, 'Stunning 3-bedroom apartment with breathtaking lagoon views in the heart of Victoria Island. Features modern finishes, spacious living areas, and premium amenities including a gym, pool, and 24/7 security.', 
 ARRAY['/src/assets/luxury-3bedroom-lagos.jpg'], true, true, 800000, 9600000),

('Luxury Terrace Duplex Lagos', 'Executive 4-Bedroom Terrace in Lekki Phase 1', 'Lagos', 'home', 'terrace', 4, 3,
 75000000, 85000000, 200, 'Elegant 4-bedroom terrace duplex in the prestigious Lekki Phase 1. Boasts contemporary design, fitted kitchen, BQ, parking for 2 cars, and access to estate amenities including clubhouse and children''s playground.',
 ARRAY['/src/assets/luxury-terrace-lagos.jpg'], true, true, 1200000, 14400000),

-- Asaba Properties  
('Luxury 4BR Detached Asaba', 'Magnificent 4-Bedroom Detached House in GRA Asaba', 'Asaba', 'home', 'detached', 4, 4,
 35000000, 40000000, 300, 'Exquisite 4-bedroom detached house in the coveted GRA area of Asaba. Features spacious rooms, modern kitchen, family lounge, study room, BQ, beautiful garden, and secure gated environment.',
 ARRAY['/src/assets/luxury-4bedroom-asaba.jpg'], true, true, 600000, 7200000),

('Luxury Detached Villa Asaba', 'Premium 5-Bedroom Detached Villa', 'Asaba', 'home', 'detached', 5, 4,
 55000000, 65000000, 400, 'Spectacular 5-bedroom detached villa with luxury finishes throughout. Includes master suite with walk-in closet, home office, entertainment room, 2-car garage, landscaped garden, and swimming pool.',
 ARRAY['/src/assets/luxury-detached-asaba.jpg'], true, true, 900000, 10800000),

-- Ogun Properties
('Luxury Semi-Detached Ogun', 'Beautiful 3-Bedroom Semi-Detached in Magodo Phase 2', 'Ogun State', 'home', 'semi-detached', 3, 2,
 25000000, 30000000, 180, 'Charming 3-bedroom semi-detached house in the serene Magodo Phase 2 extension. Features open-plan living, modern kitchen, en-suite master bedroom, BQ, parking space, and estate recreational facilities.',
 ARRAY['/src/assets/luxury-semi-detached-ogun.jpg'], true, true, 450000, 5400000),

('Luxury Rental Villa Ogun', 'Exclusive 4-Bedroom Rental Villa in Ibafo', 'Ogun State', 'home', 'detached', 4, 3,
 0, 45000000, 250, 'Luxurious 4-bedroom rental villa perfect for executive living. Fully furnished with premium appliances, air conditioning throughout, landscaped compound, security house, and proximity to major highways.',
 ARRAY['/src/assets/luxury-rental-ogun.jpg'], false, true, 700000, 8400000);