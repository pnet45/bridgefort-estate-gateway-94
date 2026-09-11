REVOKE EXECUTE ON FUNCTION public.is_account_locked(text, integer, integer) FROM anon;

CREATE OR REPLACE FUNCTION public.get_downline_ids(root_id uuid)
RETURNS TABLE(id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH RECURSIVE downline AS (
    SELECT p.id FROM public.profiles p WHERE p.referred_by_id = root_id
    UNION ALL
    SELECT p.id FROM public.profiles p JOIN downline d ON p.referred_by_id = d.id
  )
  SELECT id FROM downline
  WHERE root_id = auth.uid()
     OR public.is_global_admin(auth.uid());
$function$;

REVOKE EXECUTE ON FUNCTION public.get_downline_ids(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_downline_ids(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_available_mailboxes(_user_id uuid)
RETURNS TABLE(mailbox_email text, mailbox_provider text, is_connected boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT m.mailbox_email, m.mailbox_provider,
    EXISTS (
      SELECT 1 FROM public.gmail_oauth_tokens t
      WHERE t.email = m.mailbox_email AND m.mailbox_provider = 'gmail'
    ) AS is_connected
  FROM (
    SELECT mailbox_email, mailbox_provider
    FROM public.admin_mailboxes
    WHERE user_id = _user_id AND status = 'active'
    UNION
    SELECT mailbox_email, mailbox_provider
    FROM public.role_default_mailboxes
    WHERE public.is_global_admin(_user_id)
  ) m
  WHERE _user_id = auth.uid() OR public.is_global_admin(auth.uid());
$function$;

REVOKE EXECUTE ON FUNCTION public.get_available_mailboxes(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_available_mailboxes(uuid) TO authenticated, service_role;
