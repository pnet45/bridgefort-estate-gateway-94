-- Supabase grants EXECUTE on functions to PUBLIC by default. Removing anon alone
-- is insufficient because PUBLIC still includes anonymous callers.
REVOKE EXECUTE ON FUNCTION public.admin_has_permission(text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_approve_financial_requests(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_manage_admin_module(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_manage_departments(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_manage_mailboxes(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_global_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_has_permission(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_mailbox_access(uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_downline_ids(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_withdrawal_funnel_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_business_user_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_role_after_payment_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_role_after_profile_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
