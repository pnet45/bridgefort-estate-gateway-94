-- Isolated PostgreSQL fixture and behavioural checks for BMC migrations.
-- Runs only in the disposable GitHub Actions Postgres service; never against production.

create role anon nologin;
create role authenticated nologin;
create schema auth;
create schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

create or replace function auth.uid()
returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth, extensions to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;

create or replace function public.user_has_permission(_user_id uuid, _permission_key text)
returns boolean language sql stable
as $$
  select current_setting('test.permission', true) in (_permission_key, 'admin:all')
$$;
create or replace function public.is_global_admin(_user_id uuid)
returns boolean language sql stable
as $$ select false $$;
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean language sql stable
as $$ select false $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_pbo boolean default false,
  pbo_referral_code text,
  wallet_balance numeric default 0,
  total_commissions numeric default 0,
  current_package text,
  current_rank text,
  total_personal_volume numeric default 0,
  is_active boolean default false
);
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  category text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  permission_key text not null,
  is_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (role, permission_key)
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, first_name, last_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'first_name',''), coalesce(new.raw_user_meta_data ->> 'last_name',''))
  on conflict (id) do nothing;
  insert into public.users(id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.protect_profile_financial_fields()
returns trigger language plpgsql as $$ begin return new; end $$;
create trigger protect_profile_financial_fields
  before update on public.profiles for each row execute function public.protect_profile_financial_fields();

alter table public.profiles enable row level security;
grant select, update on public.profiles to authenticated;
create policy "test users update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create table public.travel_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  departure_date date not null,
  return_date date not null,
  travelers integer not null,
  package text not null,
  destination text,
  notes text,
  status text not null,
  customer_id uuid,
  crm_lead_id uuid,
  service_journey_id uuid,
  assigned_to uuid,
  confirmation_token text,
  status_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  customer_email text not null,
  customer_name text not null,
  total_amount numeric not null,
  payment_reference text not null,
  payment_status text not null,
  items jsonb not null,
  amount_paid numeric not null default 0,
  balance numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated;
grant execute on function public.user_has_permission(uuid,text) to anon, authenticated;

-- The migration files are applied by the workflow after this fixture is loaded.
