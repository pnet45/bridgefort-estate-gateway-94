
-- Fix 1: Remove unauthenticated access to password_reset_otps
DROP POLICY IF EXISTS "Users can view their own OTPs" ON public.password_reset_otps;
DROP POLICY IF EXISTS "Users can update their own OTPs" ON public.password_reset_otps;

-- OTP validation should only happen server-side via edge functions
-- No SELECT access needed for regular users
CREATE POLICY "Only service role can view OTPs"
ON public.password_reset_otps FOR SELECT
USING (false);

CREATE POLICY "Only service role can update OTPs"
ON public.password_reset_otps FOR UPDATE
USING (false);

-- Fix 2: Ensure contact_messages has proper RLS
-- First ensure RLS is enabled
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Add admin UPDATE policy (was missing)
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Add admin DELETE policy (was missing)
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Fix 3: Ensure applications has proper RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
