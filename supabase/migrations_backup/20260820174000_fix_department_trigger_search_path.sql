create or replace function public.prevent_admin_department_identity_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.slug is distinct from old.slug or new.role_name is distinct from old.role_name then
    raise exception 'Department slug and role identity cannot be changed after creation';
  end if;
  return new;
end;
$$;
revoke all on function public.prevent_admin_department_identity_change() from public, anon, authenticated;
