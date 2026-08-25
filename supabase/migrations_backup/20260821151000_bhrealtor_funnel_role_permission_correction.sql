-- BHRealtor Funnel access is financial and must be limited to:
-- Super Admin, Admin, Admin-Dir and Admin-Acct.
-- Admin-IT is intentionally NOT included because it is a technical role.

insert into public.role_permissions (role, permission_key, is_enabled)
values
  ('admin', 'admin:view_mlm_funnel', true),
  ('admin_acct', 'admin:view_mlm_funnel', true),
  ('admin_dir', 'admin:view_mlm_funnel', true),
  ('super_admin', 'admin:view_mlm_funnel', true)
on conflict (role, permission_key) do update
set is_enabled = excluded.is_enabled,
    updated_at = now();

-- Explicit financial-funnel authorization. Do not use has_role(..., 'admin')
-- because that helper intentionally treats many operational roles as admin.
create or replace function public.can_manage_bhrealtor_funnel(_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.is_global_admin(_user_id)
    or exists (
      select 1 from public.admin_roles ar
      where ar.user_id = _user_id
        and ar.role_name in ('admin', 'admin_acct')
        and (ar.expires_at is null or ar.expires_at > now())
    )
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = _user_id
        and ur.role in ('admin', 'admin_acct')
    ),
    false
  );
$$;

revoke all on function public.can_manage_bhrealtor_funnel(uuid) from public;
grant execute on function public.can_manage_bhrealtor_funnel(uuid) to authenticated;
