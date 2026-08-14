-- Allow the mailbox access RPC to be called safely by authenticated
-- browser sessions and service-role edge functions. Service-role calls do
-- not have auth.uid(), so the previous guard incorrectly rejected every
-- mailbox connection attempt from the Gmail edge functions.

create or replace function public.user_mailbox_access(_user_id uuid, _mailbox_email text, _provider text default 'gmail')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is not null
      and _user_id <> auth.uid()
      and not public.is_global_admin(auth.uid())
      and not public.user_has_permission(auth.uid(), 'admin:manage_permissions')
    then false
    when public.is_global_admin(_user_id)
      or public.has_role(_user_id, 'admin_dir')
      or public.user_has_permission(_user_id, 'admin:all')
    then true
    else exists (
      select 1 from public.admin_mailboxes am
      where am.user_id = _user_id
        and lower(am.mailbox_email) = lower(_mailbox_email)
        and lower(coalesce(am.mailbox_provider, _provider)) = lower(_provider)
        and am.status = 'active'
    )
    or exists (
      select 1
      from public.admin_roles ar
      join public.admin_role_mailbox_access rma on rma.role_name = ar.role_name
      where ar.user_id = _user_id
        and (ar.expires_at is null or ar.expires_at > now())
        and lower(rma.mailbox_email) = lower(_mailbox_email)
    )
    or exists (
      select 1
      from public.admin_roles ar
      join public.role_default_mailboxes rdm on rdm.role_name = ar.role_name
      where ar.user_id = _user_id
        and (ar.expires_at is null or ar.expires_at > now())
        and lower(rdm.mailbox_email) = lower(_mailbox_email)
        and lower(rdm.mailbox_provider) = lower(_provider)
    )
  end;
$$;

revoke all on function public.user_mailbox_access(uuid, text, text) from public, anon;
grant execute on function public.user_mailbox_access(uuid, text, text) to authenticated, service_role;
