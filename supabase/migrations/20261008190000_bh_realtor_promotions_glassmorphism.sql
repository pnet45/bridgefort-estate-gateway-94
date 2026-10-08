-- BHRealtor promotions: controlled admin publishing with Realtor-only read access.
create table if not exists public.bh_realtor_promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  content text not null default '',
  terms_and_conditions text not null default '',
  image_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  display_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bh_realtor_promotions_dates_chk check (ends_at > starts_at),
  constraint bh_realtor_promotions_slug_chk check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists bh_realtor_promotions_status_dates_idx
  on public.bh_realtor_promotions(status, starts_at, ends_at, display_order);

create or replace function public.set_bh_realtor_promotions_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bh_realtor_promotions_updated_at on public.bh_realtor_promotions;
create trigger bh_realtor_promotions_updated_at
before update on public.bh_realtor_promotions
for each row execute function public.set_bh_realtor_promotions_updated_at();

alter table public.bh_realtor_promotions enable row level security;

drop policy if exists "BHRealtors can read published promotions" on public.bh_realtor_promotions;
create policy "BHRealtors can read published promotions"
on public.bh_realtor_promotions
for select to authenticated
using (
  status = 'published'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.is_pbo, false) = true
      and coalesce(p.is_active, false) = true
  )
);

drop policy if exists "Admins can read all promotions" on public.bh_realtor_promotions;
create policy "Admins can read all promotions"
on public.bh_realtor_promotions
for select to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can insert promotions" on public.bh_realtor_promotions;
create policy "Admins can insert promotions"
on public.bh_realtor_promotions
for insert to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can update promotions" on public.bh_realtor_promotions;
create policy "Admins can update promotions"
on public.bh_realtor_promotions
for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can delete promotions" on public.bh_realtor_promotions;
create policy "Admins can delete promotions"
on public.bh_realtor_promotions
for delete to authenticated
using (public.is_admin(auth.uid()));

grant select, insert, update, delete on public.bh_realtor_promotions to authenticated;
revoke all on public.bh_realtor_promotions from anon;
