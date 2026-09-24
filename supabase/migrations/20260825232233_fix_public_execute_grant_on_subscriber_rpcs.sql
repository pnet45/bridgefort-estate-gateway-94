-- These two ended up with EXECUTE granted to the PUBLIC pseudo-role (Postgres's
-- default for newly created functions unless explicitly revoked). Revoking
-- specifically FROM anon last time didn't touch this separate PUBLIC grant,
-- so anon kept inheriting access through it. Revoke PUBLIC's grant and
-- re-grant explicitly to authenticated only (real admins already reach
-- these through their authenticated session; the internal
-- user_has_permission() check still gates actual authorization).
REVOKE EXECUTE ON FUNCTION public.admin_get_estate_subscribers(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_subscriber_history(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_get_estate_subscribers(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_subscriber_history(uuid) TO authenticated;
