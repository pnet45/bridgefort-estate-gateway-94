-- Division-specific BMC referral attribution for Travels and Agrovest.
-- This records attribution only; it does not calculate or promise commissions.
-- Homes continues to use the established BH-Realtors referral system.

create table if not exists public.bmc_division_referral_codes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.bmc_partner_divisions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  division text not null check (division in ('travels', 'agrovest')),
  referral_code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bmc_division_referral_codes_application_unique unique (application_id)
);

create index if not exists bmc_division_referral_codes_owner_idx
  on public.bmc_division_referral_codes(user_id, division, is_active);

alter table public.bmc_division_referral_codes enable row level security;
revoke all on public.bmc_division_referral_codes from anon, authenticated;

create table if not exists public.bmc_division_referral_attributions (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid not null references public.bmc_division_referral_codes(id) on delete restrict,
  division text not null check (division in ('travels', 'agrovest')),
  referrer_user_id uuid not null references auth.users(id) on delete restrict,
  referred_user_id uuid references auth.users(id) on delete set null,
  source_type text not null check (source_type in ('travel_booking', 'order')),
  source_record_id uuid not null,
  created_at timestamptz not null default now(),
  constraint bmc_division_referral_attribution_source_unique unique (source_type, source_record_id)
);

create index if not exists bmc_division_referral_attributions_owner_idx
  on public.bmc_division_referral_attributions(referrer_user_id, division, created_at desc);

alter table public.bmc_division_referral_attributions enable row level security;
revoke all on public.bmc_division_referral_attributions from anon, authenticated;

alter table public.travel_bookings
  add column if not exists bmc_referral_code_id uuid references public.bmc_division_referral_codes(id) on delete set null;

alter table public.orders
  add column if not exists bmc_referral_code_id uuid references public.bmc_division_referral_codes(id) on delete set null;

create or replace function public.sync_bmc_division_referral_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $bmc_referral_code$
declare
  candidate text;
  inserted_id uuid;
begin
  if new.division not in ('travels', 'agrovest') then
    return new;
  end if;

  if new.application_status = 'approved' then
    if not exists (
      select 1 from public.bmc_division_referral_codes c
      where c.application_id = new.id
    ) then
      loop
        candidate := 'BMC-' || upper(new.division) || '-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 8));
        begin
          insert into public.bmc_division_referral_codes
            (application_id, user_id, division, referral_code, is_active)
          values
            (new.id, new.user_id, new.division, candidate, true)
          returning id into inserted_id;
          exit;
        exception when unique_violation then
          -- Retry if another application generated the same random code.
          if exists (select 1 from public.bmc_division_referral_codes c where c.application_id = new.id) then
            exit;
          end if;
        end;
      end loop;
    else
      update public.bmc_division_referral_codes
      set is_active = true, updated_at = now()
      where application_id = new.id;
    end if;
  else
    update public.bmc_division_referral_codes
    set is_active = false, updated_at = now()
    where application_id = new.id;
  end if;

  return new;
end;
$bmc_referral_code$;

revoke all on function public.sync_bmc_division_referral_code() from public, anon, authenticated;

drop trigger if exists bmc_sync_division_referral_code on public.bmc_partner_divisions;
create trigger bmc_sync_division_referral_code
  after insert or update of application_status on public.bmc_partner_divisions
  for each row execute function public.sync_bmc_division_referral_code();

-- Backfill links for any Travels/Agrovest applications that were approved
-- before this migration is applied. The status value is unchanged; the trigger
-- only provisions the missing referral code.
update public.bmc_partner_divisions
set application_status = application_status
where division in ('travels', 'agrovest')
  and application_status = 'approved';

create or replace function public.get_my_bmc_division_referral_codes()
returns table (
  division text,
  referral_code text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $bmc_my_codes$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  return query
  select c.division, c.referral_code, c.created_at
  from public.bmc_division_referral_codes c
  join public.bmc_partner_divisions d on d.id = c.application_id
  where c.user_id = auth.uid()
    and c.is_active is true
    and d.application_status = 'approved'
  order by c.division;
end;
$bmc_my_codes$;

revoke all on function public.get_my_bmc_division_referral_codes() from public, anon;
grant execute on function public.get_my_bmc_division_referral_codes() to authenticated;

create or replace function public.record_bmc_travel_booking_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $bmc_travel_referral$
declare
  referral public.bmc_division_referral_codes;
begin
  if new.bmc_referral_code_id is null then
    return new;
  end if;

  select c.* into referral
  from public.bmc_division_referral_codes c
  join public.bmc_partner_divisions d on d.id = c.application_id
  where c.id = new.bmc_referral_code_id
    and c.division = 'travels'
    and c.is_active is true
    and d.application_status = 'approved';

  if not found then
    raise exception 'Invalid or inactive Bridgefort Travels referral code';
  end if;

  insert into public.bmc_division_referral_attributions
    (referral_code_id, division, referrer_user_id, referred_user_id, source_type, source_record_id)
  values
    (referral.id, 'travels', referral.user_id, new.customer_id, 'travel_booking', new.id)
  on conflict (source_type, source_record_id) do nothing;

  return new;
end;
$bmc_travel_referral$;

revoke all on function public.record_bmc_travel_booking_referral() from public, anon, authenticated;

drop trigger if exists bmc_record_travel_booking_referral on public.travel_bookings;
create trigger bmc_record_travel_booking_referral
  after insert on public.travel_bookings
  for each row execute function public.record_bmc_travel_booking_referral();

create or replace function public.record_bmc_agrovest_order_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $bmc_agro_referral$
declare
  referral public.bmc_division_referral_codes;
begin
  if new.bmc_referral_code_id is null then
    return new;
  end if;

  if jsonb_typeof(coalesce(new.items, '[]'::jsonb)) <> 'array'
     or jsonb_array_length(coalesce(new.items, '[]'::jsonb)) = 0
     or exists (
       select 1 from jsonb_array_elements(coalesce(new.items, '[]'::jsonb)) item
       where coalesce(item ->> 'property_type', '') <> 'Agrovest'
     ) then
    raise exception 'Agrovest referral codes can only be used for Agrovest-only orders';
  end if;

  select c.* into referral
  from public.bmc_division_referral_codes c
  join public.bmc_partner_divisions d on d.id = c.application_id
  where c.id = new.bmc_referral_code_id
    and c.division = 'agrovest'
    and c.is_active is true
    and d.application_status = 'approved';

  if not found then
    raise exception 'Invalid or inactive Bridgefort Agrovest referral code';
  end if;

  insert into public.bmc_division_referral_attributions
    (referral_code_id, division, referrer_user_id, referred_user_id, source_type, source_record_id)
  values
    (referral.id, 'agrovest', referral.user_id, new.user_id, 'order', new.id)
  on conflict (source_type, source_record_id) do nothing;

  return new;
end;
$bmc_agro_referral$;

revoke all on function public.record_bmc_agrovest_order_referral() from public, anon, authenticated;

drop trigger if exists bmc_record_agrovest_order_referral on public.orders;
create trigger bmc_record_agrovest_order_referral
  after insert on public.orders
  for each row execute function public.record_bmc_agrovest_order_referral();
