-- Create the listings table with full schema for regional property listings
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL CHECK (region IN ('Lagos', 'Asaba', 'Port Harcourt', 'Ogun')),
  city text,
  estate text,
  title text NOT NULL,
  description text,
  property_type text NOT NULL DEFAULT 'Villa' CHECK (property_type IN ('Villa', 'Apartment', 'Penthouse', 'Townhouse', 'Land', 'Duplex', 'Bungalow', 'Other')),
  price_amount numeric NOT NULL DEFAULT 0,
  price_currency text NOT NULL DEFAULT 'NGN',
  price_period text NOT NULL DEFAULT 'sale' CHECK (price_period IN ('sale', 'rent', 'lease')),
  address text,
  latitude numeric,
  longitude numeric,
  built_sqm numeric,
  land_sqm numeric,
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  parking integer DEFAULT 0,
  parking_type text DEFAULT 'open' CHECK (parking_type IN ('garage', 'open', 'street', 'none')),
  year_built integer,
  amenities text[] DEFAULT ARRAY[]::text[],
  photos text[] DEFAULT ARRAY[]::text[],
  video_tours text[] DEFAULT ARRAY[]::text[],
  drone_footage text[] DEFAULT ARRAY[]::text[],
  floor_plans text[] DEFAULT ARRAY[]::text[],
  tour_3d_url text,
  deposit_amount numeric,
  monthly_rent numeric,
  annual_rent numeric,
  payment_options text[] DEFAULT ARRAY[]::text[],
  maintenance_fees numeric,
  hoa_fees numeric,
  min_rental_months integer,
  max_rental_months integer,
  price_negotiable boolean DEFAULT false,
  owner_name text,
  owner_phone text,
  owner_email text,
  ownership_status text DEFAULT 'Clear' CHECK (ownership_status IN ('Clear', 'Lien', 'Unregistered')),
  tax_status text DEFAULT 'Paid' CHECK (tax_status IN ('Paid', 'Due')),
  encumbrances text DEFAULT 'None' CHECK (encumbrances IN ('None', 'Yes')),
  hotspot text,
  roi_percent numeric,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  listing_start_date date,
  special_notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published listings"
  ON public.listings FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all listings"
  ON public.listings FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE INDEX idx_listings_region ON public.listings(region);
CREATE INDEX idx_listings_property_type ON public.listings(property_type);
CREATE INDEX idx_listings_price ON public.listings(price_amount);