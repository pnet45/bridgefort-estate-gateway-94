create or replace function public.list_privileged_mailbox_managers()
returns table (id uuid, email text, legacy_role text, rbac_roles text[])
language sql
stable
security definer
set search_path = public
as $function$
  select
    u.id,
    u.email,
    u.role,
    coalesce(array_agg(distinct ar.role_name) filter (where ar.role_name is not null), '{}'::text[])
  from public.users u
  left join public.admin_roles ar on ar.user_id = u.id and (ar.expires_at is null or ar.expires_at > now())
  where
    public.can_manage_departments(auth.uid())
    and (
      public.is_global_admin(u.id)
      or public.user_has_permission(u.id, 'admin:manage_departments')
      or public.user_has_permission(u.id, 'admin:manage_mailboxes')
    )
  group by u.id, u.email, u.role
  order by lower(u.email);
$function$;

grant execute on function public.list_privileged_mailbox_managers() to authenticated;
