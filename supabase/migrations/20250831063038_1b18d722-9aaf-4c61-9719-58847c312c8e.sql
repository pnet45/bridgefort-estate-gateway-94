-- Add PBO referral code to profiles table
ALTER TABLE public.profiles 
ADD COLUMN pbo_referral_code text,
ADD COLUMN is_pbo boolean DEFAULT false,
ADD COLUMN profile_picture_url text;

-- Create index for PBO referral code lookups
CREATE INDEX idx_profiles_pbo_referral_code ON public.profiles(pbo_referral_code) WHERE pbo_referral_code IS NOT NULL;

-- Add property types for homes sales and rentals
ALTER TABLE public.estate 
ADD COLUMN property_category text DEFAULT 'land',
ADD COLUMN bedrooms integer,
ADD COLUMN bathrooms integer,
ADD COLUMN is_for_sale boolean DEFAULT true,
ADD COLUMN is_for_rent boolean DEFAULT false,
ADD COLUMN monthly_rent numeric,
ADD COLUMN annual_rent numeric;

-- Insert luxury home properties for sales and rentals
INSERT INTO public.estate (
  name, title, location, type, property_category, bedrooms, bathrooms, 
  actual_price, monthly_rent, annual_rent, is_for_sale, is_for_rent,
  description, media, size, total_plots, sold_plots
) VALUES 
(
  'Premium 3-Bedroom House Lagos',
  'Luxury 3-Bedroom House in Victoria Island',
  'Victoria Island, Lagos',
  'Residential',
  'house',
  3,
  3,
  45000000,
  800000,
  9600000,
  true,
  true,
  'Stunning 3-bedroom house in the heart of Victoria Island. Features modern finishes, spacious living areas, fitted kitchen, and excellent security. Perfect for both purchase and rental.',
  ARRAY['src/assets/luxury-3bedroom-lagos.jpg'],
  250,
  1,
  0
),
(
  'Elegant 4-Bedroom Duplex Asaba',
  'Luxurious 4-Bedroom Duplex in GRA Asaba',
  'GRA, Asaba, Delta State',
  'Residential',
  'house',
  4,
  4,
  35000000,
  600000,
  7200000,
  true,
  true,
  'Beautiful 4-bedroom duplex in the prestigious GRA area of Asaba. Boasts contemporary design, master ensuite, family lounge, and ample parking space.',
  ARRAY['src/assets/luxury-4bedroom-asaba.jpg'],
  300,
  1,
  0
),
(
  'Semi-Detached Duplex Ogun',
  'Modern Semi-Detached Duplex in Mowe',
  'Mowe, Ogun State',
  'Residential',
  'house',
  4,
  3,
  28000000,
  450000,
  5400000,
  true,
  true,
  'Exquisite semi-detached duplex in a serene environment in Mowe. Features include spacious bedrooms, modern kitchen, and beautiful compound.',
  ARRAY['src/assets/luxury-semi-detached-ogun.jpg'],
  280,
  1,
  0
),
(
  'Luxury Terrace Houses Lagos',
  'Premium Terrace Houses in Lekki',
  'Lekki Phase 1, Lagos',
  'Residential',
  'house',
  3,
  3,
  32000000,
  550000,
  6600000,
  true,
  true,
  'Sophisticated terrace houses in the exclusive Lekki Phase 1. Contemporary design with top-notch finishes, close to major amenities and business districts.',
  ARRAY['src/assets/luxury-terrace-lagos.jpg'],
  220,
  1,
  0
),
(
  'Detached Duplex Mansion Asaba',
  'Magnificent Detached Duplex in Asaba',
  'Cable Point, Asaba, Delta State',
  'Residential',
  'house',
  5,
  5,
  55000000,
  900000,
  10800000,
  true,
  true,
  'Magnificent detached duplex mansion in the upscale Cable Point area. Features include 5 bedrooms, guest rooms, study, swimming pool area, and expansive compound.',
  ARRAY['src/assets/luxury-detached-asaba.jpg'],
  400,
  1,
  0
),
(
  'Luxury Rental Apartments Ogun',
  'Modern 3-Bedroom Apartments for Rent',
  'Arepo, Ogun State',
  'Residential',
  'house',
  3,
  2,
  0,
  350000,
  4200000,
  false,
  true,
  'Modern 3-bedroom apartments in a well-planned estate in Arepo. Perfect for families seeking quality rental accommodation with excellent facilities.',
  ARRAY['src/assets/luxury-rental-ogun.jpg'],
  180,
  20,
  5
);