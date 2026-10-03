create or replace function public.list_privileged_mailbox_managers()
returns table(id uuid, email text, legacy_role text, rbac_roles text[])
language sql
stable
security definer
set search_path = public
as $$
  select u.id,
    lower(coalesce(u.email, '')) as email,
    null::text as legacy_role,
    coalesce(array_agg(distinct ar.role_name) filter (where ar.role_name is not null), '{}'::text[]) as rbac_roles
  from auth.users u
  left join public.admin_roles ar on ar.user_id = u.id
  where (public.user_has_permission(auth.uid(), 'admin:manage_mailboxes')
         or public.user_has_permission(auth.uid(), 'admin:all'))
    and public.user_has_permission(u.id, 'mailbox:write')
  group by u.id, u.email
  order by lower(coalesce(u.email, ''));
$$;
revoke all on function public.list_privileged_mailbox_managers() from public;
grant execute on function public.list_privileged_mailbox_managers() to authenticated;