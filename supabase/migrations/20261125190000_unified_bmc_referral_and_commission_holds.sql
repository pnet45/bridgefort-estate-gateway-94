-- One canonical BMC referral code, accepted by Homes, Travels and Agrovest.
-- Attribution is accepted before division approval; commission is held until approval.
-- Legacy BH-Realtors codes and existing division codes remain valid.

alter table public.bmc_partner_divisions
  drop constraint if exists bmc_partner_divisions_application_status_check;
alter table public.bmc_partner_divisions
  add constraint bmc_partner_divisions_application_status_check
  check (application_status in ('pending_review','referral_only','legacy_existing','approved','rejected','suspended','withdrawn'));
alter table public.bmc_partner_divisions
  drop constraint if exists bmc_partner_divisions_review_state_check;
alter table public.bmc_partner_divisions
  add constraint bmc_partner_divisions_review_state_check check (
    (application_status in ('pending_review','referral_only','legacy_existing') and reviewed_at is null)
    or (application_status in ('approved','rejected','suspended','withdrawn') and reviewed_at is not null)
  );

-- Existing per-division codes remain as legacy aliases. New BMC identities get
-- one canonical code, mirrored into each division lookup so existing booking,
-- checkout and attribution flows can resolve it without invalidating old codes.
create table if not exists public.bmc_identity_referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  referral_code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.bmc_identity_referral_codes enable row level security;
revoke all on public.bmc_identity_referral_codes from public, anon, authenticated;
grant select on public.bmc_identity_referral_codes to authenticated;
drop policy if exists "BMCs can read their own identity referral code" on public.bmc_identity_referral_codes;
create policy "BMCs can read their own identity referral code"
  on public.bmc_identity_referral_codes for select to authenticated
  using (user_id = (select auth.uid()));

alter table public.bmc_division_referral_codes
  drop constraint if exists bmc_division_referral_codes_referral_code_key;
alter table public.bmc_division_referral_codes
  drop constraint if exists bmc_division_referral_codes_application_id_key;
alter table public.bmc_division_referral_codes drop constraint if exists bmc_division_referral_codes_application_unique;
create unique index if not exists bmc_division_referral_codes_code_division_uidx
  on public.bmc_division_referral_codes(referral_code, division);
create index if not exists bmc_division_referral_codes_application_idx
  on public.bmc_division_referral_codes(application_id);

create or replace function public.ensure_bmc_identity_referral_code(_user_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  canonical_code text;
  selected_division text;
  app_id uuid;
begin
  if _user_id is null then raise exception 'BMC user is required'; end if;
  insert into public.bmc_identity_referral_codes(user_id, referral_code)
  values (_user_id, 'BMC-' || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 10)))
  on conflict (user_id) do nothing;

  select c.referral_code into canonical_code
  from public.bmc_identity_referral_codes c
  where c.user_id = _user_id and c.is_active is true;

  if canonical_code is null then
    raise exception 'This BMC referral identity is inactive';
  end if;

  foreach selected_division in array array['homes','travels','agrovest'] loop
    insert into public.bmc_partner_divisions(user_id, division, application_status)
    values (
      _user_id,
      selected_division,
      case when selected_division = 'homes'
                 and exists (select 1 from public.profiles p where p.id = _user_id and p.is_pbo is true)
           then 'legacy_existing'
           else 'referral_only'
      end
    )
    on conflict (user_id, division) do nothing;

    select d.id into app_id
    from public.bmc_partner_divisions d
    where d.user_id = _user_id and d.division = selected_division;

    insert into public.bmc_division_referral_codes
      (application_id, user_id, division, referral_code, is_active)
    values (app_id, _user_id, selected_division, canonical_code, true)
    on conflict (referral_code, division) do update
      set is_active = true, updated_at = now();
  end loop;

  return canonical_code;
end;
$function$;

revoke all on function public.ensure_bmc_identity_referral_code(uuid) from public, anon, authenticated;

-- New BMC registrations create an application row only for divisions selected
-- by the applicant. Other divisions receive referral_only rows: referrals can
-- be attributed there, but no commission can be paid before division approval.
create or replace function public.create_bmc_division_applications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  selected_division text;
  requested jsonb;
begin
  if (new.raw_user_meta_data ->> 'bmc_agreement_accepted') is distinct from 'true'
     or (new.raw_user_meta_data ->> 'bmc_privacy_acknowledged') is distinct from 'true' then
    return new;
  end if;

  requested := coalesce(new.raw_user_meta_data -> 'bmc_selected_divisions', '[]'::jsonb);
  if jsonb_typeof(requested) = 'array' then
    for selected_division in
      select distinct lower(trim(value))
      from jsonb_array_elements_text(requested) as selected(value)
      where lower(trim(value)) in ('homes','travels','agrovest')
    loop
      insert into public.bmc_partner_divisions(user_id, division, application_status)
      values (new.id, selected_division, 'pending_review')
      on conflict (user_id, division) do nothing;
    end loop;
  end if;

  perform public.ensure_bmc_identity_referral_code(new.id);
  return new;
end;
$function$;

-- Recreate the auth trigger to preserve the existing trusted signup workflow.
drop trigger if exists on_auth_user_created_create_bmc_divisions on auth.users;
create trigger on_auth_user_created_create_bmc_divisions
  after insert on auth.users
  for each row execute function public.create_bmc_division_applications();

-- Backfill all existing BMC/BH-Realtors identities without changing existing
-- application decisions, membership packages, wallet balances or old codes.
insert into public.bmc_partner_divisions(user_id, division, application_status, requested_at)
select p.id, 'homes', 'legacy_existing', coalesce(p.created_at, now())
from public.profiles p
where p.is_pbo is true
on conflict (user_id, division) do nothing;

insert into public.bmc_partner_divisions(user_id, division, application_status)
select distinct d.user_id, requested.division, 'referral_only'
from public.bmc_partner_divisions d
cross join (values ('homes'),('travels'),('agrovest')) as requested(division)
on conflict (user_id, division) do nothing;

do $backfill$
declare
  partner record;
begin
  for partner in
    select distinct d.user_id
    from public.bmc_partner_divisions d
  loop
    perform public.ensure_bmc_identity_referral_code(partner.user_id);
  end loop;
end;
$backfill$;

-- Promote referral-only rows to real applications when a BMC selects a new
-- division later. Existing approved/rejected/suspended decisions are untouched.
create or replace function public.request_bmc_division_application(
  _division text,
  _agree_to_bmc_terms boolean,
  _acknowledge_bmc_privacy boolean,
  _marketing_consent boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid := auth.uid();
  application_id uuid;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  if _division is null or _division not in ('homes','travels','agrovest') then
    raise exception 'Invalid BMC division';
  end if;
  if coalesce(_agree_to_bmc_terms,false) is not true
     or coalesce(_acknowledge_bmc_privacy,false) is not true then
    raise exception 'BMC agreement acceptance and privacy acknowledgement are required';
  end if;
  if not exists (
    select 1 from public.profiles p where p.id = current_user_id and p.is_pbo is true
  ) and not exists (
    select 1 from public.bmc_partner_divisions d where d.user_id = current_user_id
  ) then
    raise exception 'A registered BMC account is required to apply for a division';
  end if;

  insert into public.bmc_agreement_acceptances (
    user_id, agreement_version, agreement_name, accepted_at,
    acceptance_source, marketing_consent, privacy_notice_version,
    privacy_notice_acknowledged
  ) values (
    current_user_id, '1.0', 'Bridgefort Multi-Business Consultants Partner Agreement',
    now(), 'partner_hub', coalesce(_marketing_consent,false), '1.0', true
  );

  update public.bmc_partner_divisions
  set application_status = 'pending_review',
      requested_at = now(),
      reviewed_at = null,
      reviewed_by = null,
      review_note = null,
      updated_at = now()
  where user_id = current_user_id
    and division = _division
    and application_status = 'referral_only'
  returning id into application_id;

  if application_id is null then
    insert into public.bmc_partner_divisions(user_id, division, application_status)
    values (current_user_id, _division, 'pending_review')
    on conflict (user_id, division) do nothing
    returning id into application_id;
  end if;

  if application_id is null then
    select d.id into application_id from public.bmc_partner_divisions d
    where d.user_id = current_user_id and d.division = _division;
  end if;

  return application_id;
end;
$function$;

revoke all on function public.request_bmc_division_application(text, boolean, boolean, boolean) from public, anon;
grant execute on function public.request_bmc_division_application(text, boolean, boolean, boolean) to authenticated;

-- Division state no longer determines whether a referral can be recorded.
-- Suspension disables only that division's link; pending/referral-only/rejected
-- referrals remain attributable but commissions are held until approval.
create or replace function public.sync_bmc_division_referral_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  update public.bmc_division_referral_codes
  set is_active = (new.application_status not in ('suspended','rejected','withdrawn')),
      updated_at = now()
  where application_id = new.id;
  return new;
end;
$function$;

revoke all on function public.sync_bmc_division_referral_code() from public, anon, authenticated;
drop trigger if exists bmc_sync_division_referral_code on public.bmc_partner_divisions;
create trigger bmc_sync_division_referral_code
  after insert or update of application_status on public.bmc_partner_divisions
  for each row execute function public.sync_bmc_division_referral_code();

-- The user sees one canonical code, returned once for each business link.
create or replace function public.get_my_bmc_division_referral_codes()
returns table (division text, referral_code text, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  return query
  select d.division, c.referral_code, c.created_at
  from public.bmc_division_referral_codes c
  join public.bmc_partner_divisions d on d.id = c.application_id
  join public.bmc_identity_referral_codes identity_code
    on identity_code.user_id = c.user_id
   and identity_code.referral_code = c.referral_code
   and identity_code.is_active is true
  where c.user_id = auth.uid()
    and c.is_active is true
    and d.application_status not in ('suspended','rejected','withdrawn')
  order by d.division;
end;
$function$;

revoke all on function public.get_my_bmc_division_referral_codes() from public, anon;
grant execute on function public.get_my_bmc_division_referral_codes() to authenticated;

-- Homes signup, Travels bookings and Homes/Agrovest orders accept the shared
-- code before the corresponding division is approved. Old codes remain valid.
create or replace function public.record_bmc_homes_signup_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  referral public.bmc_division_referral_codes;
  submitted_code text;
begin
  submitted_code := upper(trim(coalesce(new.raw_user_meta_data ->> 'bmc_referral_code','')));
  if submitted_code = '' then return new; end if;

  select c.* into referral
  from public.bmc_division_referral_codes c
  where c.referral_code = submitted_code
    and c.division = 'homes'
    and c.is_active is true
  order by (c.referral_code = (
    select identity_code.referral_code from public.bmc_identity_referral_codes identity_code
    where identity_code.user_id = c.user_id
  )) desc
  limit 1
  for share;

  if found and referral.user_id <> new.id then
    insert into public.bmc_division_referral_attributions
      (referral_code_id, division, referrer_user_id, referred_user_id, source_type, source_record_id)
    values (referral.id, 'homes', referral.user_id, new.id, 'signup', new.id)
    on conflict (source_type, source_record_id) do nothing;
  end if;
  return new;
end;
$function$;

create or replace function public.record_bmc_travel_booking_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  referral public.bmc_division_referral_codes;
begin
  if new.bmc_referral_code_id is null then return new; end if;
  select c.* into referral
  from public.bmc_division_referral_codes c
  where c.id = new.bmc_referral_code_id
    and c.division = 'travels'
    and c.is_active is true
  for share of c;
  if not found then raise exception 'Invalid or inactive Bridgefort Travels referral code'; end if;

  if new.customer_id is null or referral.user_id <> new.customer_id then
    insert into public.bmc_division_referral_attributions
      (referral_code_id, division, referrer_user_id, referred_user_id, source_type, source_record_id)
    values (referral.id, 'travels', referral.user_id, new.customer_id, 'travel_booking', new.id)
    on conflict (source_type, source_record_id) do nothing;
  end if;
  return new;
end;
$function$;

create or replace function public.record_bmc_division_order_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  referral public.bmc_division_referral_codes;
begin
  if new.bmc_referral_code_id is null then return new; end if;
  select c.* into referral
  from public.bmc_division_referral_codes c
  where c.id = new.bmc_referral_code_id
    and c.division in ('homes','agrovest')
    and c.is_active is true
  for share of c;
  if not found then raise exception 'Invalid or inactive Bridgefort division referral code'; end if;

  if jsonb_typeof(coalesce(new.items,'[]'::jsonb)) <> 'array'
     or jsonb_array_length(coalesce(new.items,'[]'::jsonb)) = 0 then
    raise exception 'Referral code cannot be used with this order';
  end if;
  if referral.division = 'agrovest' and exists (
    select 1 from jsonb_array_elements(coalesce(new.items,'[]'::jsonb)) as entries(item)
    where coalesce(entries.item ->> 'property_type','') <> 'Agrovest'
  ) then raise exception 'Agrovest referral codes can only be used for Agrovest-only orders'; end if;
  if referral.division = 'homes' and exists (
    select 1 from jsonb_array_elements(coalesce(new.items,'[]'::jsonb)) as entries(item)
    where coalesce(entries.item ->> 'property_type','') = 'Agrovest'
  ) then raise exception 'Homes referral codes cannot be used for Agrovest items'; end if;

  if referral.user_id <> new.user_id then
    insert into public.bmc_division_referral_attributions
      (referral_code_id, division, referrer_user_id, referred_user_id, source_type, source_record_id)
    values (referral.id, referral.division, referral.user_id, new.user_id, 'order', new.id)
    on conflict (source_type, source_record_id) do nothing;
  end if;
  return new;
end;
$function$;

revoke all on function public.record_bmc_homes_signup_referral() from public, anon, authenticated;
revoke all on function public.record_bmc_travel_booking_referral() from public, anon, authenticated;
revoke all on function public.record_bmc_division_order_referral() from public, anon, authenticated;

-- Commission rows are created as held unless the referrer's relevant division
-- is formally approved. Approval releases held rows; suspension/rejection holds
-- unpaid earned rows again. Payment RPCs continue to accept only 'earned'.
alter table public.bmc_division_commissions
  drop constraint if exists bmc_division_commissions_status_check;
alter table public.bmc_division_commissions
  add constraint bmc_division_commissions_status_check
  check (status in ('held','earned','paid','reversed'));
alter table public.bmc_division_commissions
  drop constraint if exists bmc_division_commissions_division_check;
alter table public.bmc_division_commissions
  add constraint bmc_division_commissions_division_check
  check (division in ('homes','agrovest','travels'));
alter table public.bmc_division_commissions
  drop constraint if exists bmc_division_commissions_source_type_check;
alter table public.bmc_division_commissions
  add constraint bmc_division_commissions_source_type_check
  check (source_type in ('homes_payment','agrovest_payment','travel_payment'));
alter table public.bmc_division_commissions
  drop constraint if exists bmc_division_commissions_commission_rate_check;
alter table public.bmc_division_commissions
  add constraint bmc_division_commissions_commission_rate_check
  check (commission_rate > 0 and commission_rate <= 100);

create or replace function public.hold_unapproved_bmc_division_commission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.status in ('earned','held') and not exists (
    select 1 from public.bmc_partner_divisions d
    where d.user_id = new.referrer_user_id
      and d.division = new.division
      and (d.application_status = 'approved' or (new.division = 'homes' and d.application_status = 'legacy_existing'))
      and exists (select 1 from public.bmc_identity_kyc k where k.user_id = new.referrer_user_id and k.status = 'VERIFIED')
  ) then
    new.status := 'held';
  end if;
  return new;
end;
$function$;

revoke all on function public.hold_unapproved_bmc_division_commission() from public, anon, authenticated;
drop trigger if exists bmc_hold_unapproved_commission on public.bmc_division_commissions;
create trigger bmc_hold_unapproved_commission
  before insert or update of status on public.bmc_division_commissions
  for each row execute function public.hold_unapproved_bmc_division_commission();

-- Reclassify any previously earned BMC commissions that do not yet meet both
-- central identity and division-approval requirements.
update public.bmc_division_commissions c
set status = 'held'
where c.status = 'earned'
  and (
    not exists (select 1 from public.bmc_identity_kyc k where k.user_id = c.referrer_user_id and k.status = 'VERIFIED')
    or not exists (
      select 1 from public.bmc_partner_divisions d
      where d.user_id = c.referrer_user_id
        and d.division = c.division
        and (d.application_status = 'approved' or (c.division = 'homes' and d.application_status = 'legacy_existing'))
    )
  );

create or replace function public.release_or_hold_bmc_division_commissions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.application_status = 'approved' or (new.division = 'homes' and new.application_status = 'legacy_existing') then
    update public.bmc_division_commissions
    set status = 'earned'
    where referrer_user_id = new.user_id
      and division = new.division
      and status = 'held'
      and exists (select 1 from public.bmc_identity_kyc k where k.user_id = new.user_id and k.status = 'VERIFIED');
  elsif new.application_status in ('suspended','rejected','withdrawn','pending_review','referral_only') then
    update public.bmc_division_commissions
    set status = 'held'
    where referrer_user_id = new.user_id
      and division = new.division
      and status = 'earned';
  end if;
  return new;
end;
$function$;

revoke all on function public.release_or_hold_bmc_division_commissions() from public, anon, authenticated;
drop trigger if exists bmc_release_or_hold_division_commissions on public.bmc_partner_divisions;
create trigger bmc_release_or_hold_division_commissions
  after update of application_status on public.bmc_partner_divisions
  for each row execute function public.release_or_hold_bmc_division_commissions();


-- Homes BMC referral commissions use the central BMC ledger. Legacy BH-Realtors
-- referral codes continue through the existing MLM commission function.
create or replace function public.award_bmc_homes_order_commission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  attribution public.bmc_division_referral_attributions;
  item jsonb;
  property_type text;
  unit_price numeric;
  quantity numeric;
  gross_total numeric := 0;
  commission_total numeric := 0;
  item_rate numeric;
  effective_rate numeric;
begin
  if new.payment_status is distinct from 'paid'
     or old.payment_status is not distinct from 'paid' then
    return new;
  end if;

  select a.* into attribution
  from public.bmc_division_referral_attributions a
  where a.source_type = 'order'
    and a.source_record_id = new.id
    and a.division = 'homes'
  for share;

  if not found or attribution.referrer_user_id = new.user_id then
    return new;
  end if;

  for item in
    select value from jsonb_array_elements(coalesce(new.items, '[]'::jsonb))
  loop
    property_type := lower(trim(coalesce(
      nullif(item ->> 'property_type',''),
      nullif(item ->> 'type',''),
      nullif(item ->> 'category',''),
      ''
    )));
    if property_type = 'agrovest'
       or property_type ilike 'documentation%'
       or property_type ilike '%subscription%'
       or property_type ilike '%promo%' then
      continue;
    end if;

    if property_type like '%land%' or property_type like '%plot%' then
      item_rate := 15;
    elsif property_type like '%house%'
       or property_type like '%home%'
       or property_type like '%apartment%'
       or property_type like '%flat%'
       or property_type like '%duplex%'
       or property_type like '%bungalow%'
       or property_type like '%terrace%'
       or property_type like '%residential%' then
      item_rate := 5;
    else
      continue;
    end if;

    unit_price := coalesce(nullif(item ->> 'price','')::numeric, 0);
    quantity := greatest(1, coalesce(nullif(item ->> 'quantity','')::numeric, 1));
    if unit_price <= 0 then continue; end if;

    gross_total := gross_total + (unit_price * quantity);
    commission_total := commission_total + round(unit_price * quantity * item_rate / 100, 2);
  end loop;

  if gross_total <= 0 or commission_total <= 0 then
    return new;
  end if;

  effective_rate := round((commission_total / gross_total) * 100, 2);
  insert into public.bmc_division_commissions (
    division, referral_attribution_id, referrer_user_id,
    source_type, source_record_id, gross_customer_payment,
    commission_rate, commission_amount, status, payment_reference
  ) values (
    'homes', attribution.id, attribution.referrer_user_id,
    'homes_payment', new.id, round(gross_total, 2),
    effective_rate, round(commission_total, 2), 'earned',
    nullif(trim(coalesce(new.payment_reference,'')), '')
  )
  on conflict (source_type, source_record_id) do nothing;

  return new;
end;
$function$;

revoke all on function public.award_bmc_homes_order_commission() from public, anon, authenticated;
drop trigger if exists bmc_award_homes_order_commission on public.orders;
create trigger bmc_award_homes_order_commission
  after update of payment_status on public.orders
  for each row execute function public.award_bmc_homes_order_commission();

-- When a central identity is approved after a division was already approved,
-- release only that BMC's held commissions for divisions already eligible.
create or replace function public.release_bmc_commissions_after_kyc_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if old.status is distinct from 'VERIFIED' and new.status = 'VERIFIED' then
    update public.bmc_division_commissions c
    set status = 'earned'
    where c.referrer_user_id = new.user_id
      and c.status = 'held'
      and exists (
        select 1 from public.bmc_partner_divisions d
        where d.user_id = new.user_id
          and d.division = c.division
          and (d.application_status = 'approved' or (c.division = 'homes' and d.application_status = 'legacy_existing'))
      );
  end if;
  return new;
end;
$function$;

revoke all on function public.release_bmc_commissions_after_kyc_verification() from public, anon, authenticated;
drop trigger if exists bmc_release_commissions_after_kyc_verification on public.bmc_identity_kyc;
create trigger bmc_release_commissions_after_kyc_verification
  after update of status on public.bmc_identity_kyc
  for each row execute function public.release_bmc_commissions_after_kyc_verification();


-- Extend the existing management RPC to include BMC Homes commissions.
create or replace function public.admin_list_bmc_division_commissions(_division text default null)
returns table (
  commission_id uuid,
  division text,
  referrer_user_id uuid,
  referrer_name text,
  source_type text,
  gross_customer_payment numeric,
  commission_rate numeric,
  commission_amount numeric,
  status text,
  payment_reference text,
  created_at timestamptz,
  paid_at timestamptz,
  payout_reference text
)
language plpgsql
security definer
set search_path = ''
as $admin_list_bmc_division_commissions$
declare
  actor uuid := auth.uid();
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if not (
    public.user_has_permission(actor, 'admin:manage_bmc_partners')
    or public.user_has_permission(actor, 'admin:all')
  ) then
    raise exception 'BMC commission management permission required';
  end if;
  if _division is not null and _division not in ('homes','agrovest','travels') then
    raise exception 'Invalid BMC commission division';
  end if;

  return query
  select c.id, c.division, c.referrer_user_id,
         nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
         c.source_type, c.gross_customer_payment, c.commission_rate,
         c.commission_amount, c.status, c.payment_reference,
         c.created_at, c.paid_at, c.payout_reference
  from public.bmc_division_commissions c
  left join public.profiles p on p.id = c.referrer_user_id
  where _division is null or c.division = _division
  order by c.created_at desc;
end;
$admin_list_bmc_division_commissions$;

revoke all on function public.admin_list_bmc_division_commissions(text) from public, anon;
grant execute on function public.admin_list_bmc_division_commissions(text) to authenticated;

-- BH-Realtors withdrawal remains on its existing wallet engine, but now also
-- requires central BMC KYC and Homes approval (legacy_existing is grandfathered).
create or replace function private.submit_withdrawal_request(
  p_user_id uuid,
  p_amount numeric,
  p_bank_name text,
  p_account_number text,
  p_account_name text
)
returns public.withdrawal_requests
language plpgsql
security definer
set search_path = 'public'
as $function$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'You can only submit a withdrawal for your own account';
  end if;
  if not exists (
    select 1 from public.bmc_identity_kyc k
    where k.user_id = p_user_id and k.status = 'VERIFIED'
  ) then
    raise exception 'Complete central BMC identity verification before requesting a withdrawal';
  end if;
  if not exists (
    select 1 from public.bmc_partner_divisions d
    where d.user_id = p_user_id
      and d.division = 'homes'
      and d.application_status in ('approved','legacy_existing')
  ) then
    raise exception 'Your Bridgefort Homes partner division is not approved for withdrawals';
  end if;
  return private.submit_withdrawal_request_pre_bmc_kyc(
    p_user_id, p_amount, p_bank_name, p_account_number, p_account_name
  );
end;
$function$;

revoke all on function private.submit_withdrawal_request(uuid,numeric,text,text,text) from public, anon;
grant execute on function private.submit_withdrawal_request(uuid,numeric,text,text,text) to authenticated;
