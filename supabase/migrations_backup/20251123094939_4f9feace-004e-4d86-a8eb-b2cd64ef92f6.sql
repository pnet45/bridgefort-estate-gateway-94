-- Create training_events table
CREATE TABLE IF NOT EXISTS public.training_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  image TEXT,
  capacity TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Training',
  description TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_events ENABLE ROW LEVEL SECURITY;

-- Anyone can view training events
CREATE POLICY "Anyone can view training events"
ON public.training_events
FOR SELECT
USING (true);

-- Only admins can insert training events
CREATE POLICY "Only admins can insert training events"
ON public.training_events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Only admins can update training events
CREATE POLICY "Only admins can update training events"
ON public.training_events
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Only admins can delete training events
CREATE POLICY "Only admins can delete training events"
ON public.training_events
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_training_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_training_events_updated_at
BEFORE UPDATE ON public.training_events
FOR EACH ROW
EXECUTE FUNCTION public.update_training_events_updated_at();