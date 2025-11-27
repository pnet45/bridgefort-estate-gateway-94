-- Create training_attendance table to track completed trainings
CREATE TABLE IF NOT EXISTS public.training_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  registration_id UUID REFERENCES public.training_registrations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.training_events(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_issued_at TIMESTAMP WITH TIME ZONE,
  attendance_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_attendance ENABLE ROW LEVEL SECURITY;

-- Users can view their own attendance records
CREATE POLICY "Users can view own attendance"
  ON public.training_attendance
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all attendance records
CREATE POLICY "Admins can view all attendance"
  ON public.training_attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Admins can manage attendance records
CREATE POLICY "Admins can manage attendance"
  ON public.training_attendance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_training_attendance_user_id ON public.training_attendance(user_id);
CREATE INDEX idx_training_attendance_event_id ON public.training_attendance(event_id);

-- Update trigger for updated_at
CREATE TRIGGER update_training_attendance_updated_at
  BEFORE UPDATE ON public.training_attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_training_events_updated_at();

-- Function to auto-complete profile when training registration is complete
CREATE OR REPLACE FUNCTION public.complete_profile_on_training_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If registration has all required fields, mark profile as completed
  IF NEW.name IS NOT NULL 
     AND NEW.email IS NOT NULL 
     AND NEW.phone IS NOT NULL 
     AND NEW.address IS NOT NULL 
     AND NEW.state IS NOT NULL 
     AND NEW.gender IS NOT NULL THEN
    
    -- Find or create profile for this email
    INSERT INTO public.profiles (id, first_name, phone_number, address, state_of_origin, gender, profile_completed)
    SELECT 
      auth.uid(),
      NEW.name,
      NEW.phone,
      NEW.address,
      NEW.state,
      NEW.gender,
      true
    FROM auth.users
    WHERE email = NEW.email
    ON CONFLICT (id) 
    DO UPDATE SET
      first_name = EXCLUDED.first_name,
      phone_number = EXCLUDED.phone_number,
      address = EXCLUDED.address,
      state_of_origin = EXCLUDED.state_of_origin,
      gender = EXCLUDED.gender,
      profile_completed = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-complete profile on training registration
CREATE TRIGGER on_training_registration_complete
  AFTER INSERT OR UPDATE ON public.training_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.complete_profile_on_training_registration();