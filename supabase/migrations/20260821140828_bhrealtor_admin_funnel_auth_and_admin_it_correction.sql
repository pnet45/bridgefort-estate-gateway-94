-- Canonical Admin-IT role name is admin_it / Admin-IT. Financial funnel access is Super Admin, Admin, Admin-Dir, Admin-Acct.
create or replace function public.can_manage_bhrealtor_funnel(_user_id uuid default auth.uid()) returns boolean language sql stable security definer set search_path=public as $$ select coalesce(public.is_global_admin(_user_id) or exists(select 1 from public.admin_roles ar where ar.user_id=_user_id and ar.role_name in ('admin','admin_acct') and (ar.expires_at is null or ar.expires_at>now())) or exists(select 1 from public.user_roles ur where ur.user_id=_user_id and ur.role in ('admin','admin_acct')),false); $$;
revoke all on function public.can_manage_bhrealtor_funnel(uuid) from public;
grant execute on function public.can_manage_bhrealtor_funnel(uuid) to authenticated;
insert into public.roles (name,display_name,description) values ('admin_it','Admin-IT','Information Technology administrator') on conflict(name) do update set display_name='Admin-IT';
update public.admin_departments set role_name='admin_it' where lower(role_name)='admin-ti';
