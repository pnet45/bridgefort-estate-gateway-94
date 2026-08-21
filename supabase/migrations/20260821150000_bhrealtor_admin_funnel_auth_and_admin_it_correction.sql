-- BHRealtor Admin Funnel security hardening
-- Canonical technical-admin role name is Admin-IT (admin_it), never Admin-TI.
-- Financial funnel access: Super Admin, Admin-Dir and Admin-Acct.

create or replace function public.can_manage_bhrealtor_funnel(_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.is_global_admin(_user_id)
    or public.has_role(_user_id, 'admin_dir')
    or public.has_role(_user_id, 'admin_acct'),
    false
  );
$$;

revoke all on function public.can_manage_bhrealtor_funnel(uuid) from public;
grant execute on function public.can_manage_bhrealtor_funnel(uuid) to authenticated;

-- Keep the analytics RPC behind authenticated financial-admin authorization.
-- Do not expose raw financial rows to anonymous callers.
create or replace function public.get_bhrealtor_admin_analytics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.can_manage_bhrealtor_funnel(auth.uid()) then
    raise exception using errcode = '42501', message = 'You do not have permission to view BHRealtor financial analytics.';
  end if;

  select jsonb_build_object(
    'generated_at', now(),
    'total_realtors', (select count(*) from public.profiles where is_pbo = true),
    'active_realtors', (select count(*) from public.profiles where is_pbo = true and is_active = true),
    'inactive_realtors', (select count(*) from public.profiles where is_pbo = true and coalesce(is_active,false) = false),
    'package_distribution', coalesce((select jsonb_agg(x) from (
      select current_package as package_code, count(*) as realtor_count
      from public.profiles where is_pbo = true group by current_package order by current_package
    ) x), '[]'::jsonb),
    'commission_summary', coalesce((select jsonb_agg(x) from (
      select status, count(*) as transaction_count, coalesce(sum(commission_amount),0) as total_amount
      from public.mlm_commissions group by status order by status
    ) x), '[]'::jsonb),
    'withdrawal_summary', coalesce((select jsonb_agg(x) from (
      select status, count(*) as request_count, coalesce(sum(amount),0) as total_amount
      from public.withdrawal_requests group by status order by status
    ) x), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_bhrealtor_admin_analytics() from public;
grant execute on function public.get_bhrealtor_admin_analytics() to authenticated;

-- Canonical Admin-IT role/department identity.
insert into public.roles (name, display_name, description)
values ('admin_it', 'Admin-IT', 'Information Technology administrator')
on conflict (name) do update set display_name = 'Admin-IT';

update public.roles
set display_name = 'Admin-IT'
where name = 'admin_it';

update public.admin_departments
set role_name = 'admin_it'
where lower(role_name) = 'admin-ti';

-- Do not delete or rename arbitrary roles here: preserving assignments is safer.
-- If an old admin-ti role exists, it is left intact until its assignments are audited.
