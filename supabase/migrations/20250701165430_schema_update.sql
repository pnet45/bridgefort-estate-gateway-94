
-- Create table for center training bookings
CREATE TABLE public.centertraining (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_name text NOT NULL,
  center_leader_name text NOT NULL,
  address text NOT NULL,
  phone_number text NOT NULL,
  venue_capacity integer NOT NULL,
  expected_attendance integer NOT NULL,
  training_date date NOT NULL,
  training_time time NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.centertraining ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to insert center training bookings
CREATE POLICY "Authenticated users can create center training bookings" 
  ON public.centertraining 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policy for admins to view all center training bookings
CREATE POLICY "Admins can view all center training bookings" 
  ON public.centertraining 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Add new estate "The Ambassadors"
INSERT INTO public.estate (
  name,
  title,
  location,
  actual_price,
  size,
  total_plots,
  sold_plots,
  type,
  description,
  media
) VALUES (
  'The Ambassadors',
  'The Ambassadors - Lagoon View Estate',
  'Ode Omi, Ibeju Lekki, Lagos',
  1800000,
  500,
  36,
  21,
  'Residential',
  'A beautiful lagoon view estate located in the serene area of Ode Omi, Ibeju Lekki',
  ARRAY['/lovable-uploads/The Ambassadors.jpg']
);

-- Update training_registrations table to include PBO status and referral information
ALTER TABLE public.training_registrations 
ADD COLUMN referrer_name text,
ADD COLUMN referrer_phone text,
ADD COLUMN referrer_email text;
