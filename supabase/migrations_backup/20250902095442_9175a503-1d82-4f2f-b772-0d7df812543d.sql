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

-- Insert sample home data 
INSERT INTO public.estate (
  name, location, property_category, type, 
  promo_price, actual_price, bedrooms, bathrooms,
  is_for_sale, is_for_rent, monthly_rent, annual_rent,
  description, media
) 
SELECT * FROM (VALUES 
(
  'Luxury 3-Bedroom Terrace'::text, 
  'Lekki Phase 1, Lagos'::text, 
  'home'::text, 
  'Terrace'::text, 
  45000000::numeric, 
  50000000::numeric, 
  3::integer, 
  4::integer, 
  true::boolean, 
  true::boolean, 
  800000::numeric, 
  9600000::numeric,
  'Modern 3-bedroom terrace duplex with contemporary finishes and prime location access.'::text,
  ARRAY['/src/assets/luxury-terrace-lagos.jpg']::text[]
),
(
  'Executive 4-Bedroom Detached'::text, 
  'GRA Asaba, Delta State'::text, 
  'home'::text, 
  'Detached'::text, 
  65000000::numeric, 
  70000000::numeric, 
  4::integer, 
  5::integer, 
  true::boolean, 
  true::boolean, 
  1200000::numeric, 
  14400000::numeric,
  'Spacious 4-bedroom detached duplex in prestigious Government Reserved Area.'::text,
  ARRAY['/src/assets/luxury-4bedroom-asaba.jpg']::text[]
),
(
  'Modern 2-Bedroom Apartment'::text, 
  'Ikoyi, Lagos'::text, 
  'home'::text, 
  'Apartment'::text, 
  35000000::numeric, 
  40000000::numeric, 
  2::integer, 
  3::integer, 
  true::boolean, 
  true::boolean, 
  600000::numeric, 
  7200000::numeric,
  'Fully serviced 2-bedroom apartment with panoramic city views and premium amenities.'::text,
  ARRAY['/src/assets/luxury-rental-ogun.jpg']::text[]
),
(
  'Luxury 5-Bedroom Mansion'::text, 
  'Banana Island, Lagos'::text, 
  'home'::text, 
  'Mansion'::text, 
  150000000::numeric, 
  160000000::numeric, 
  5::integer, 
  6::integer, 
  true::boolean, 
  false::boolean, 
  NULL::numeric, 
  NULL::numeric,
  'Ultra-luxury 5-bedroom mansion with swimming pool, gym, and waterfront views.'::text,
  ARRAY['/src/assets/luxury-detached-asaba.jpg']::text[]
),
(
  'Semi-Detached 3-Bedroom'::text, 
  'Magboro, Ogun State'::text, 
  'home'::text, 
  'Semi-Detached'::text, 
  25000000::numeric, 
  28000000::numeric, 
  3::integer, 
  3::integer, 
  true::boolean, 
  true::boolean, 
  400000::numeric, 
  4800000::numeric,
  'Affordable 3-bedroom semi-detached house in a gated community with modern facilities.'::text,
  ARRAY['/src/assets/luxury-semi-detached-ogun.jpg']::text[]
)
) AS t(name, location, property_category, type, promo_price, actual_price, bedrooms, bathrooms, is_for_sale, is_for_rent, monthly_rent, annual_rent, description, media)
WHERE NOT EXISTS (
  SELECT 1 FROM public.estate WHERE name = t.name AND location = t.location
);