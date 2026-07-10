-- Fix: listing_contacts exposes owner email/phone to all authenticated users
DROP POLICY IF EXISTS "Owner can view own listing contact" ON public.listing_contacts;
CREATE POLICY "Owner or admin can view listing contact"
ON public.listing_contacts
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_contacts.listing_id AND l.created_by = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Fix: password_reset_otps missing explicit INSERT deny for public/authenticated
CREATE POLICY "Block public OTP insert"
ON public.password_reset_otps
FOR INSERT
TO public
WITH CHECK (false);

-- Fix: user_roles self-escalation - restrict mutations to service_role only
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Service role manages roles - insert"
ON public.user_roles
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role manages roles - update"
ON public.user_roles
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role manages roles - delete"
ON public.user_roles
FOR DELETE
TO service_role
USING (true);