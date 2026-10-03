-- Phase 12: remove legacy admin authorization fallbacks from callable helpers.
-- Canonical administrative authority is admin_roles/admin_permissions.
-- Business roles continue to use user_roles where appropriate.

create or replace function public.has_role(_user_id uuid, _role text)
returns boolean language sql stable security definer set search_path = public
as $$
  select case
    when auth.uid() is not null
      and auth.uid() is distinct from _user_id
      and not public.is_global_admin(auth.uid())
    then false
    when _role in ('admin','super_admin','admin_dir','admin_adm','admin_acct','admin_sales','admin_cs','admin_legal','admin_it')
    then exists (
      select 1 from public.admin_roles ar
      where ar.user_id = _user_id
        and (ar.expires_at is null or ar.expires_at > now())
        and (
          ar.role_name = _role
          or (_role = 'admin' and ar.role_name in ('super_admin','admin_dir','admin_adm','admin_acct','admin_sales','admin_cs','admin_legal','admin_it'))
        )
    )
    else exists (select 1 from public.user_roles ur where ur.user_id = _user_id and ur.role = _role)
  end;
$$;

create or replace function public.can_approve_financial_requests(_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when _user_id is distinct from auth.uid() and not public.is_global_admin(auth.uid()) then false
    else coalesce(public.is_global_admin(coalesce(_user_id, auth.uid()))
      or public.user_has_permission(coalesce(_user_id, auth.uid()), 'admin:approve_payments'), false)
  end;
$$;

create or replace function public.can_manage_bhrealtor_financials(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when p_user_id is distinct from auth.uid() and not public.is_global_admin(auth.uid()) then false
    else public.is_global_admin(p_user_id)
      or exists (
        select 1 from public.admin_roles ar
        where ar.user_id = p_user_id
          and (ar.expires_at is null or ar.expires_at > now())
          and ar.role_name = 'admin_acct'
      )
  end;
$$;

create or replace function public.can_manage_bhrealtor_funnel(_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when _user_id is distinct from auth.uid() and not public.is_global_admin(auth.uid()) then false
    else public.is_global_admin(_user_id)
      or exists (
        select 1 from public.admin_roles ar
        where ar.user_id = _user_id
          and (ar.expires_at is null or ar.expires_at > now())
          and ar.role_name = 'admin_acct'
      )
  end;
$$;

revoke execute on function public.has_role(uuid,text) from anon;
revoke execute on function public.can_approve_financial_requests(uuid) from anon;
revoke execute on function public.can_manage_bhrealtor_financials(uuid) from anon;
revoke execute on function public.can_manage_bhrealtor_funnel(uuid) from anon;

grant execute on function public.has_role(uuid,text) to authenticated, service_role;
grant execute on function public.can_approve_financial_requests(uuid) to authenticated, service_role;
grant execute on function public.can_manage_bhrealtor_financials(uuid) to authenticated, service_role;
grant execute on function public.can_manage_bhrealtor_funnel(uuid) to authenticated, service_role;