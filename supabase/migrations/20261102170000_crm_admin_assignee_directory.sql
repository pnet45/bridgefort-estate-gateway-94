-- Expose a minimal, read-only directory of active admin staff for CRM lead assignment.
-- The internal helper bypasses admin_roles RLS only after verifying the caller is an admin.
-- No email addresses or non-admin accounts are returned.

create schema if not exists private;

create or replace function private.crm_admin_assignees()
returns table (
  user_id uuid,
  first_name text,
  last_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1
    from public.admin_roles caller_role
    where caller_role.user_id = auth.uid()
      and caller_role.role_name in (
        'admin',
        'super_admin',
        'admin_dir',
        'admin_adm',
        'admin_acct',
        'admin_sales',
        'admin_cs',
        'admin_legal',
        'admin_it',
        'manager'
      )
      and (caller_role.expires_at is null or caller_role.expires_at > now())
  ) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return query
  select distinct
    ar.user_id,
    p.first_name,
    p.last_name
  from public.admin_roles ar
  join public.profiles p on p.id = ar.user_id
  where ar.role_name in (
      'admin',
      'super_admin',
      'admin_dir',
      'admin_adm',
      'admin_acct',
      'admin_sales',
      'admin_cs',
      'admin_legal',
      'admin_it',
      'manager'
    )
    and (ar.expires_at is null or ar.expires_at > now())
    and (
      nullif(trim(p.first_name), '') is not null
      or nullif(trim(p.last_name), '') is not null
    )
  order by p.first_name nulls last, p.last_name nulls last;
end;
$$;

grant usage on schema private to authenticated;
revoke all on function private.crm_admin_assignees() from public, anon;
grant execute on function private.crm_admin_assignees() to authenticated;

create or replace function public.get_crm_admin_assignees()
returns table (
  user_id uuid,
  first_name text,
  last_name text
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null or not coalesce(public.is_admin(auth.uid()), false) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return query
  select directory.user_id, directory.first_name, directory.last_name
  from private.crm_admin_assignees() as directory
  order by directory.first_name nulls last, directory.last_name nulls last;
end;
$$;

revoke all on function public.get_crm_admin_assignees() from public, anon;
grant execute on function public.get_crm_admin_assignees() to authenticated;
