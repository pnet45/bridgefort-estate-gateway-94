
-- Add a nullable "email" column to the inspection_bookings table
ALTER TABLE public.inspection_bookings
ADD COLUMN IF NOT EXISTS email text;
