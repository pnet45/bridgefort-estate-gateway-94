-- The welcome-email function is a trigger-only SECURITY DEFINER function.
-- It must not be callable directly through PostgREST by client roles.
-- Trigger execution remains attached to profiles inserts; service_role retains
-- explicit EXECUTE for controlled operational use.
REVOKE ALL ON FUNCTION public.trigger_welcome_email_after_profile_insert() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trigger_welcome_email_after_profile_insert() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_welcome_email_after_profile_insert() TO service_role;
