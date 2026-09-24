REVOKE EXECUTE ON FUNCTION public.clear_failed_logins(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon;

CREATE OR REPLACE FUNCTION public.user_mailbox_access(
  _user_id uuid,
  _mailbox_email text,
  _provider text DEFAULT 'gmail'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    WHEN _user_id <> auth.uid()
      AND NOT public.user_has_permission(auth.uid(), 'admin:manage_permissions')
      AND NOT public.user_has_permission(auth.uid(), 'admin:all')
    THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.admin_mailboxes am
      WHERE am.user_id = _user_id
        AND lower(am.mailbox_email) = lower(_mailbox_email)
        AND lower(am.mailbox_provider) = lower(_provider)
        AND am.status = 'active'
    )
    OR public.user_has_permission(_user_id, 'admin:all')
  END;
$function$;

REVOKE EXECUTE ON FUNCTION public.user_mailbox_access(uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.user_mailbox_access(uuid, text, text) TO authenticated, service_role;
