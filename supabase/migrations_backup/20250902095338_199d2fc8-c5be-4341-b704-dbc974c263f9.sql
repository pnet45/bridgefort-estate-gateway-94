-- Update estate table to better categorize homes
-- Add home-specific fields if not already exist
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estate' AND column_name = 'bedrooms') THEN
    ALTER TABLE public.estate ADD COLUMN bedrooms integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estate' AND column_name = 'bathrooms') THEN
    ALTER TABLE public.estate ADD COLUMN bathrooms integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estate' AND column_name = 'is_for_sale') THEN
    ALTER TABLE public.estate ADD COLUMN is_for_sale boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estate' AND column_name = 'is_for_rent') THEN
    ALTER TABLE public.estate ADD COLUMN is_for_rent boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estate' AND column_name = 'monthly_rent') THEN
    ALTER TABLE public.estate ADD COLUMN monthly_rent numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estate' AND column_name = 'annual_rent') THEN
    ALTER TABLE public.estate ADD COLUMN annual_rent numeric;
  END IF;
END $$;

-- Update property_category field to use 'home' for residential properties
UPDATE public.estate 
SET property_category = 'home' 
WHERE property_category IS NULL 
   OR property_category = 'residential'
   OR type ILIKE '%home%' 
   OR type ILIKE '%house%' 
   OR type ILIKE '%apartment%'
   OR name ILIKE '%home%'
   OR name ILIKE '%house%'
   OR name ILIKE '%apartment%';

-- Insert sample home data if not exists
INSERT INTO public.estate (
  name, location, property_category, type, 
  promo_price, actual_price, bedrooms, bathrooms,
  is_for_sale, is_for_rent, monthly_rent, annual_rent,
  description, media
) VALUES 
(
  'Luxury 3-Bedroom Terrace', 
  'Lekki Phase 1, Lagos', 
  'home', 
  'Terrace', 
  45000000, 
  50000000, 
  3, 
  4, 
  true, 
  true, 
  800000, 
  9600000,
  'Modern 3-bedroom terrace duplex with contemporary finishes and prime location access.',
  ARRAY['/src/assets/luxury-terrace-lagos.jpg']
) ON CONFLICT DO NOTHING,
(
  'Executive 4-Bedroom Detached', 
  'GRA Asaba, Delta State', 
  'home', 
  'Detached', 
  65000000, 
  70000000, 
  4, 
  5, 
  true, 
  true, 
  1200000, 
  14400000,
  'Spacious 4-bedroom detached duplex in prestigious Government Reserved Area.',
  ARRAY['/src/assets/luxury-4bedroom-asaba.jpg']
) ON CONFLICT DO NOTHING,
(
  'Modern 2-Bedroom Apartment', 
  'Ikoyi, Lagos', 
  'home', 
  'Apartment', 
  35000000, 
  40000000, 
  2, 
  3, 
  true, 
  true, 
  600000, 
  7200000,
  'Fully serviced 2-bedroom apartment with panoramic city views and premium amenities.',
  ARRAY['/src/assets/luxury-rental-ogun.jpg']
) ON CONFLICT DO NOTHING,
(
  'Luxury 5-Bedroom Mansion', 
  'Banana Island, Lagos', 
  'home', 
  'Mansion', 
  150000000, 
  160000000, 
  5, 
  6, 
  true, 
  false, 
  NULL, 
  NULL,
  'Ultra-luxury 5-bedroom mansion with swimming pool, gym, and waterfront views.',
  ARRAY['/src/assets/luxury-detached-asaba.jpg']
) ON CONFLICT DO NOTHING,
(
  'Semi-Detached 3-Bedroom', 
  'Magboro, Ogun State', 
  'home', 
  'Semi-Detached', 
  25000000, 
  28000000, 
  3, 
  3, 
  true, 
  true, 
  400000, 
  4800000,
  'Affordable 3-bedroom semi-detached house in a gated community with modern facilities.',
  ARRAY['/src/assets/luxury-semi-detached-ogun.jpg']
) ON CONFLICT DO NOTHING;