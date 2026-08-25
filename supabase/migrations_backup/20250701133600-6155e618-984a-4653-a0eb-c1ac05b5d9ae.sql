
-- Add profile_completed column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Create documentation_types table for the new pricing structure
CREATE TABLE IF NOT EXISTS public.documentation_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the three documentation types
INSERT INTO public.documentation_types (name, price, description) VALUES
('Deed of Assignment', 300000, 'Legal document transferring ownership'),
('Survey & Estate Layout', 300000, 'Professional surveying and layout planning'),
('Plot Demarcation', 100000, 'Physical marking and boundary definition')
ON CONFLICT DO NOTHING;

-- Update estate_documentation_payments to reference documentation types
ALTER TABLE public.estate_documentation_payments 
ADD COLUMN IF NOT EXISTS documentation_type_id UUID REFERENCES public.documentation_types(id),
ADD COLUMN IF NOT EXISTS is_bundle BOOLEAN DEFAULT TRUE;

-- Enable RLS on documentation_types
ALTER TABLE public.documentation_types ENABLE ROW LEVEL SECURITY;

-- Create policy for documentation_types (readable by all authenticated users)
CREATE POLICY "Authenticated users can view documentation types" 
  ON public.documentation_types 
  FOR SELECT 
  TO authenticated
  USING (true);
