create table if not exists public.admin_role_mailbox_access (
  id uuid primary key default gen_random_uuid(),
  role_name text not null,
  mailbox_email text not null,
  created_at timestamptz not null default now(),
  unique (role_name, mailbox_email)
);

alter table public.admin_role_mailbox_access enable row level security;

insert into public.admin_role_mailbox_access (role_name, mailbox_email)
values
  ('admin_acct','account@bridgeforthomes.com'),
  ('admin_acct','sales@bridgeforthomes.com'),
  ('admin_sales','sales@bridgeforthomes.com'),
  ('admin_legal','legal@bridgeforthomes.com'),
  ('admin_legal','info@bridgeforthomes.com'),
  ('admin_cs','sales@bridgeforthomes.com'),
  ('admin_cs','info@bridgeforthomes.com'),
  ('admin_cs','support@bridgeforthomes.com'),
  ('admin_cs','noreply@bridgeforthomes.com'),
  ('admin_cs','training@bridgeforthomes.com'),
  ('admin_it','support@bridgeforthomes.com'),
  ('admin_it','it@bridgeforthomes.com'),
  ('admin_it','dpo@bridgeforthomes.com'),
  ('admin_adm','sales@bridgeforthomes.com'),
  ('admin_adm','admin@bridgeforthomes.com'),
  ('admin_adm','hr@bridgeforthomes.com'),
  ('admin_adm','training@bridgeforthomes.com')
on conflict (role_name, mailbox_email) do nothing;

revoke all on public.admin_role_mailbox_access from anon;
revoke all on public.admin_role_mailbox_access from authenticated;
revoke all on public.admin_role_mailbox_access from public;

create or replace function public.user_mailbox_access(
  _user_id uuid,
  _mailbox_email text,
  _provider text default 'gmail'
)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select case
    when auth.uid() is null then false
    when _user_id <> auth.uid()
      and not public.user_has_permission(auth.uid(), 'admin:manage_permissions')
      and not public.user_has_permission(auth.uid(), 'admin:all')
    then false
    when exists (
      select 1 from public.admin_roles ar
      where ar.user_id = _user_id
        and ar.role_name = 'admin_dir'
        and (ar.expires_at is null or ar.expires_at > now())
    ) then true
    else exists (
      select 1
      from public.admin_roles ar
      join public.admin_role_mailbox_access rma on rma.role_name = ar.role_name
      where ar.user_id = _user_id
        and (ar.expires_at is null or ar.expires_at > now())
        and lower(rma.mailbox_email) = lower(_mailbox_email)
    )
  end;
$function$;

revoke execute on function public.user_mailbox_access(uuid,text,text) from anon;
grant execute on function public.user_mailbox_access(uuid,text,text) to authenticated, service_role;
