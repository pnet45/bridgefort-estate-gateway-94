-- 1. Notifications: ownership / admin-audience check
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Users create own notifications, admins create admin notices"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  (audience = 'user' AND auth.uid() = user_id)
  OR (audience = 'admin' AND public.has_role(auth.uid(), 'admin'))
);

-- 2. Blog bucket: folder-scoped uploads
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
CREATE POLICY "Users upload blog images to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'blog'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- 3. Estate pricing tables: authenticated-only reads
DROP POLICY IF EXISTS "Anyone can view estate other payments" ON public.estate_other_payments;
CREATE POLICY "Authenticated users can view estate other payments"
ON public.estate_other_payments FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.estate_other_payments FROM anon;

DROP POLICY IF EXISTS "Anyone can view estate doc pricing" ON public.estate_doc_pricing;
DROP POLICY IF EXISTS "Anyone can view estate documentation pricing" ON public.estate_doc_pricing;
CREATE POLICY "Authenticated users can view estate doc pricing"
ON public.estate_doc_pricing FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.estate_doc_pricing FROM anon;

-- 4. Role permission matrix: authenticated-only reads
DROP POLICY IF EXISTS "Anyone can view role permissions" ON public.role_permissions;
CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.role_permissions FROM anon;

-- 5. SECURITY DEFINER functions should not be API-callable
REVOKE ALL ON FUNCTION public.protect_profile_financial_fields() FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.get_withdrawal_funnel_stats() SECURITY INVOKER;
