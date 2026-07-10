
-- 1) Remove broad SELECT (listing) policies on public storage buckets.
-- Public files remain reachable via their public URL; only bucket listing is disabled.
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all media files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "imagebucket public read" ON storage.objects;
DROP POLICY IF EXISTS "media_files_public_select" ON storage.objects;

-- 2) Replace "always true" write policies with minimal shape checks.
-- applications
DROP POLICY IF EXISTS "Anyone can submit job applications" ON public.applications;
CREATE POLICY "Anyone can submit job applications" ON public.applications
  FOR INSERT TO public
  WITH CHECK (full_name IS NOT NULL AND email IS NOT NULL AND length(email) > 3);

-- centertraining
DROP POLICY IF EXISTS "Authenticated users can create center training bookings" ON public.centertraining;
CREATE POLICY "Authenticated users can create center training bookings" ON public.centertraining
  FOR INSERT TO authenticated
  WITH CHECK (email IS NOT NULL AND length(email) > 3);

-- contact_messages
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
  FOR INSERT TO public
  WITH CHECK (email IS NOT NULL AND message IS NOT NULL AND length(message) > 0);

-- contact_submissions
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON public.contact_submissions;
CREATE POLICY "Anyone can create contact submissions" ON public.contact_submissions
  FOR INSERT TO public
  WITH CHECK (email IS NOT NULL AND message IS NOT NULL AND length(message) > 0);

-- failed_login_attempts (service_role)
DROP POLICY IF EXISTS "Service role can manage failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Service role can manage failed login attempts" ON public.failed_login_attempts
  FOR ALL TO service_role
  USING (email IS NOT NULL)
  WITH CHECK (email IS NOT NULL);

-- newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can insert newsletter subscriptions" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can insert newsletter subscriptions" ON public.newsletter_subscribers
  FOR INSERT TO public
  WITH CHECK (email IS NOT NULL AND email ~ '^[^@]+@[^@]+\.[^@]+$');

-- newsletter_subscriptions
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions
  FOR INSERT TO public
  WITH CHECK (email IS NOT NULL AND email ~ '^[^@]+@[^@]+\.[^@]+$');

-- pending_admin_requests
DROP POLICY IF EXISTS "Service role can insert pending requests" ON public.pending_admin_requests;
CREATE POLICY "Service role can insert pending requests" ON public.pending_admin_requests
  FOR INSERT TO service_role
  WITH CHECK (email IS NOT NULL);

-- property_analytics
DROP POLICY IF EXISTS "Anyone can insert property analytics" ON public.property_analytics;
CREATE POLICY "Anyone can insert property analytics" ON public.property_analytics
  FOR INSERT TO public
  WITH CHECK (property_id IS NOT NULL);

-- property_views
DROP POLICY IF EXISTS "Anyone can insert views" ON public.property_views;
CREATE POLICY "Anyone can insert views" ON public.property_views
  FOR INSERT TO public
  WITH CHECK (property_id IS NOT NULL);

-- training_registrations
DROP POLICY IF EXISTS "Anyone can submit training registrations" ON public.training_registrations;
CREATE POLICY "Anyone can submit training registrations" ON public.training_registrations
  FOR INSERT TO authenticated
  WITH CHECK (email IS NOT NULL AND name IS NOT NULL);

-- travel_bookings
DROP POLICY IF EXISTS "Anyone can submit a travel booking" ON public.travel_bookings;
CREATE POLICY "Anyone can submit a travel booking" ON public.travel_bookings
  FOR INSERT TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND name IS NOT NULL);

-- 3) Convert has_role() to SECURITY INVOKER so signed-in users cannot execute a definer function.
-- The existing "Users can view own role" policy on user_roles lets the invoker read their own roles,
-- which is all that RLS policies calling has_role(auth.uid(), '...') require.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;
