
-- 1) pending_admin_requests: restrict INSERT to service role only
DROP POLICY IF EXISTS "Allow insert from service role" ON public.pending_admin_requests;
CREATE POLICY "Service role can insert pending requests"
  ON public.pending_admin_requests
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 2) Remove sensitive tables from supabase_realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.applications;
ALTER PUBLICATION supabase_realtime DROP TABLE public.contact_messages;

-- 3) Drop empty single-arg has_role overload (ambiguity / always-null risk)
DROP FUNCTION IF EXISTS public.has_role(role_name text);

-- 4) contact_submissions: remove permissive policy exposing anonymous submissions
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.contact_submissions;
-- Allow admins to read all submissions (including anonymous)
CREATE POLICY "Admins can view all contact submissions"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5) listings: hide owner PII columns from anonymous/public role
REVOKE SELECT (owner_name, owner_phone, owner_email) ON public.listings FROM anon;
REVOKE SELECT (owner_name, owner_phone, owner_email) ON public.listings FROM PUBLIC;
