-- Phase 1: harden the legacy has_role() compatibility path so older
-- frontend/edge-function checks for the generic 'admin' role remain correct
-- with the newer department-based RBAC model.
--
-- The canonical frontend role list lives in src/lib/rbac.ts, but database
-- authorization must not depend on the UI. When callers ask whether a user
-- has the aggregate 'admin' role, treat every active administrative role as
-- an admin role. Explicit role checks (for example 'admin_sales') remain
-- exact-match checks.

create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = _user_id
      and (ar.expires_at is null or ar.expires_at > now())
      and (
        ar.role_name = _role
        or (
          _role = 'admin'
          and ar.role_name in (
            'super_admin',
            'admin',
            'admin_dir',
            'admin_adm',
            'admin_acct',
            'admin_sales',
            'admin_cs',
            'admin_legal',
            'admin_it',
            'manager',
            'team_leader',
            'associate',
            'staff'
          )
        )
      )
  )
  or exists (
    select 1
    from public.user_roles ur
    where ur.user_id = _user_id
      and (
        ur.role = _role
        or (
          _role = 'admin'
          and ur.role in (
            'super_admin',
            'admin',
            'admin_dir',
            'admin_adm',
            'admin_acct',
            'admin_sales',
            'admin_cs',
            'admin_legal',
            'admin_it',
            'manager',
            'team_leader',
            'associate',
            'staff'
          )
        )
      )
  );
$$;

comment on function public.has_role(uuid, text) is
  'Role compatibility helper. Explicit roles use exact matching; the aggregate admin role accepts all active administrative roles.';
