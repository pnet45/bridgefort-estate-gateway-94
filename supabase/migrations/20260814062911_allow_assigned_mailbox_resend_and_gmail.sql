create or replace function public.user_mailbox_access(_user_id uuid, _mailbox_email text, _provider text default 'gmail')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when _user_id <> auth.uid()
      and not public.is_global_admin(auth.uid())
      and not public.user_has_permission(auth.uid(), 'admin:manage_permissions')
    then false
    when public.is_global_admin(_user_id) then true
    else exists (
      select 1
      from public.admin_mailboxes am
      where am.user_id = _user_id
        and lower(am.mailbox_email) = lower(_mailbox_email)
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
  end;
$$;
