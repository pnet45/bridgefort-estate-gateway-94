
-- Create enum for user roles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'pbo', 'client');
    END IF;
END $$;

-- Create inspection bookings table
CREATE TABLE IF NOT EXISTS public.inspection_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  estate_name TEXT NOT NULL,
  inspection_date DATE NOT NULL,
  inspection_time TIME NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inspection_bookings
ALTER TABLE public.inspection_bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inspection_bookings
CREATE POLICY "Users can view their own inspection bookings" 
  ON public.inspection_bookings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inspection bookings" 
  ON public.inspection_bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inspection bookings" 
  ON public.inspection_bookings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow staff and admin to view all inspection bookings
CREATE POLICY "Staff and admin can view all inspection bookings" 
  ON public.inspection_bookings 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'staff')
    )
  );

-- Add sold_plots and total_plots columns if they don't exist
ALTER TABLE public.estate 
ADD COLUMN IF NOT EXISTS total_plots INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS sold_plots INTEGER DEFAULT 0;

-- Update estate table to mark Precious Garden Estate as sold out
UPDATE public.estate 
SET 
  total_plots = 100,
  sold_plots = 100
WHERE name ILIKE '%precious garden%' OR name ILIKE '%precious gardens%';
