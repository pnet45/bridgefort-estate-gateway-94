
DROP POLICY IF EXISTS "Users can view own training registrations" ON public.training_registrations;
CREATE POLICY "Users can view own training registrations"
ON public.training_registrations FOR SELECT
TO authenticated
USING (lower(email) = lower(coalesce(auth.jwt()->>'email','')));

DROP POLICY IF EXISTS "Users can view own centertraining" ON public.centertraining;
CREATE POLICY "Users can view own centertraining"
ON public.centertraining FOR SELECT
TO authenticated
USING (lower(email) = lower(coalesce(auth.jwt()->>'email','')));

DROP POLICY IF EXISTS "Block client inserts on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Block client updates on user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Block client deletes on user_roles" ON public.user_roles;
CREATE POLICY "Block client inserts on user_roles"
ON public.user_roles AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Block client updates on user_roles"
ON public.user_roles AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Block client deletes on user_roles"
ON public.user_roles AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "Service role can manage failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Service role can manage failed login attempts"
ON public.failed_login_attempts FOR ALL
TO service_role
USING (true) WITH CHECK (true);

ALTER TABLE public."BlogPost" ADD COLUMN IF NOT EXISTS user_id uuid;

REVOKE EXECUTE ON FUNCTION public.copy_contact_to_admin_emails() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_account_locked(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_failed_login(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.clear_failed_logins(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_login_attempts() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_profile_on_training_registration() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_listing_moderation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_listing_on_user_edit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_listing_moderation_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
