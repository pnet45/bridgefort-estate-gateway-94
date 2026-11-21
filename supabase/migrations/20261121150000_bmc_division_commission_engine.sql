-- Independent BMC commission ledger for Agrovest and Travels.
-- Homes remains exclusively on the existing BH-Realtors commission engine.
-- This migration does not credit legacy MLM wallets or generate upliner commissions.

create table if not exists public.bmc_travel_commission_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.travel_bookings(id) on delete restrict,
  gross_customer_payment numeric(14,2) not null check (gross_customer_payment > 0),
  payment_reference text not null unique,
  payment_status text not null default 'cleared' check (payment_status in ('cleared', 'reversed')),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  reversed_at timestamptz,
  reversal_reason text,
  constraint bmc_travel_payment_reference_nonblank check (length(trim(payment_reference)) > 0)
);

create index if not exists bmc_travel_commission_payments_booking_idx
  on public.bmc_travel_commission_payments(booking_id, recorded_at desc);

create table if not exists public.bmc_division_commissions (
  id uuid primary key default gen_random_uuid(),
  division text not null check (division in ('agrovest', 'travels')),
  referral_attribution_id uuid not null references public.bmc_division_referral_attributions(id) on delete restrict,
  referrer_user_id uuid not null references auth.users(id) on delete restrict,
  source_type text not null check (source_type in ('agrovest_payment', 'travel_payment')),
  source_record_id uuid not null,
  gross_customer_payment numeric(14,2) not null check (gross_customer_payment > 0),
  commission_rate numeric(5,2) not null check (commission_rate = 10.00),
  commission_amount numeric(14,2) not null check (commission_amount > 0),
  status text not null default 'earned' check (status in ('earned', 'paid', 'reversed')),
  payment_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  paid_by uuid references auth.users(id) on delete restrict,
  payout_reference text,
  reversed_at timestamptz,
  reversal_reason text,
  constraint bmc_division_commission_source_unique unique (source_type, source_record_id)
);

create index if not exists bmc_division_commissions_owner_idx
  on public.bmc_division_commissions(referrer_user_id, division, created_at desc);
create index if not exists bmc_division_commissions_status_idx
  on public.bmc_division_commissions(division, status, created_at desc);

alter table public.bmc_travel_commission_payments enable row level security;
alter table public.bmc_division_commissions enable row level security;
revoke all on public.bmc_travel_commission_payments from anon, authenticated;
revoke all on public.bmc_division_commissions from anon, authenticated;

-- Award 10% for every individually approved and cleared Agrovest customer payment.
-- Payment requests are the authoritative approval event; gateway references map
-- each unique instalment to its original order. Homes remains on the legacy engine.
create or replace function public.award_bmc_agrovest_installment_commission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $bmc_agrovest_installment_commission$
declare
  order_row public.orders;
  attribution public.bmc_division_referral_attributions;
begin
  if new.status is distinct from 'approved'
     or old.status is not distinct from 'approved' then
    return new;
  end if;

  -- Bank-transfer requests are labelled 'property' regardless of division;
  -- identify the qualifying division from the immutable order snapshot below.
  -- Documentation-fee requests must never earn property commission.
  if lower(coalesce(new.type, '')) like '%document%'
     or coalesce(new.amount, 0) <= 0 then
    return new;
  end if;

  -- Prefer the direct order link when present, then use the gateway event
  -- reference for flexible Paystack instalments, then the legacy resolver.
  if new.order_id is not null then
    select * into order_row from public.orders where id = new.order_id;
  end if;

  if order_row.id is null then
    select o.* into order_row
    from public.payment_gateway_events e
    join public.orders o on o.id = e.order_id
    where e.reference = new.reference
      and e.status = 'success'
    order by e.created_at desc
    limit 1;
  end if;

  if order_row.id is null then
    select public.resolve_payment_order(new.id) into order_row;
  end if;

  if order_row.id is null then
    return new;
  end if;

  -- Only a pure Agrovest order qualifies; mixed-division baskets are excluded.
  if jsonb_typeof(order_row.items) is distinct from 'array'
     or jsonb_array_length(coalesce(order_row.items, '[]'::jsonb)) = 0
     or exists (
       select 1
       from jsonb_array_elements(coalesce(order_row.items, '[]'::jsonb)) as item_row(item)
       where coalesce(item_row.item->>'property_type', '') <> 'Agrovest'
     ) then
    return new;
  end if;

  select a.* into attribution
  from public.bmc_division_referral_attributions a
  where a.source_type = 'order'
    and a.source_record_id = order_row.id
    and a.division = 'agrovest'
  for share;

  if not found then
    return new;
  end if;

  insert into public.bmc_division_commissions (
    division, referral_attribution_id, referrer_user_id,
    source_type, source_record_id, gross_customer_payment,
    commission_rate, commission_amount, status, payment_reference
  ) values (
    'agrovest', attribution.id, attribution.referrer_user_id,
    'agrovest_payment', new.id, round(new.amount, 2),
    10.00, round(new.amount * 0.10, 2), 'earned', new.reference
  )
  on conflict (source_type, source_record_id) do nothing;

  return new;
end;
$bmc_agrovest_installment_commission$;

revoke all on function public.award_bmc_agrovest_installment_commission() from public, anon, authenticated;
drop trigger if exists bmc_award_agrovest_order_commission on public.orders;
drop trigger if exists bmc_award_agrovest_installment_commission on public.payment_requests;
create trigger bmc_award_agrovest_installment_commission
  after update of status on public.payment_requests
  for each row execute function public.award_bmc_agrovest_installment_commission();

create or replace function public.award_bmc_travel_commission_from_payment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $bmc_travel_commission$
declare
  attribution public.bmc_division_referral_attributions;
begin
  if new.payment_status <> 'cleared' then
    return new;
  end if;

  select a.* into attribution
  from public.bmc_division_referral_attributions a
  where a.source_type = 'travel_booking'
    and a.source_record_id = new.booking_id
    and a.division = 'travels'
  for share;

  if not found then
    raise exception 'No verified BMC Travels referral attribution exists for this booking';
  end if;

  insert into public.bmc_division_commissions (
    division, referral_attribution_id, referrer_user_id,
    source_type, source_record_id, gross_customer_payment,
    commission_rate, commission_amount, status, payment_reference
  ) values (
    'travels', attribution.id, attribution.referrer_user_id,
    'travel_payment', new.id, new.gross_customer_payment,
    10.00, round(new.gross_customer_payment * 0.10, 2), 'earned', new.payment_reference
  )
  on conflict (source_type, source_record_id) do nothing;

  return new;
end;
$bmc_travel_commission$;

revoke all on function public.award_bmc_travel_commission_from_payment() from public, anon, authenticated;
drop trigger if exists bmc_award_travel_commission_from_payment on public.bmc_travel_commission_payments;
create trigger bmc_award_travel_commission_from_payment
  after insert on public.bmc_travel_commission_payments
  for each row execute function public.award_bmc_travel_commission_from_payment();

create or replace function public.reverse_bmc_travel_commission_on_payment_reversal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $bmc_travel_reversal$
begin
  if old.payment_status = 'cleared' and new.payment_status = 'reversed' then
    update public.bmc_division_commissions
    set status = 'reversed',
        reversed_at = now(),
        reversal_reason = coalesce(new.reversal_reason, 'Underlying customer payment reversed')
    where source_type = 'travel_payment'
      and source_record_id = new.id
      and status = 'earned';
  end if;
  return new;
end;
$bmc_travel_reversal$;

revoke all on function public.reverse_bmc_travel_commission_on_payment_reversal() from public, anon, authenticated;
drop trigger if exists bmc_reverse_travel_commission_on_payment_reversal on public.bmc_travel_commission_payments;
create trigger bmc_reverse_travel_commission_on_payment_reversal
  after update of payment_status on public.bmc_travel_commission_payments
  for each row execute function public.reverse_bmc_travel_commission_on_payment_reversal();

create or replace function public.admin_record_bmc_travel_payment(
  _booking_id uuid,
  _gross_customer_payment numeric,
  _payment_reference text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $admin_record_bmc_travel_payment$
declare
  actor uuid := auth.uid();
  payment_id uuid;
begin
  if actor is null then
    raise exception 'Authentication required';
  end if;
  if not (
    public.user_has_permission(actor, 'admin:manage_travels')
    or public.user_has_permission(actor, 'admin:manage_bmc_partners')
    or public.user_has_permission(actor, 'admin:all')
  ) then
    raise exception 'Travel payment recording permission required';
  end if;
  if _booking_id is null or _gross_customer_payment is null or _gross_customer_payment <= 0 then
    raise exception 'A valid booking and positive customer payment are required';
  end if;
  if coalesce(length(trim(_payment_reference)), 0) < 3 then
    raise exception 'A valid payment reference is required';
  end if;
  if not exists (
    select 1 from public.travel_bookings b
    where b.id = _booking_id and b.status = 'confirmed'
  ) then
    raise exception 'Only confirmed travel bookings can receive commission payments';
  end if;
  if not exists (
    select 1 from public.bmc_division_referral_attributions a
    where a.source_type = 'travel_booking'
      and a.source_record_id = _booking_id
      and a.division = 'travels'
  ) then
    raise exception 'This booking has no verified BMC Travels referral';
  end if;

  insert into public.bmc_travel_commission_payments (
    booking_id, gross_customer_payment, payment_reference, payment_status, recorded_by
  ) values (
    _booking_id, round(_gross_customer_payment, 2), trim(_payment_reference), 'cleared', actor
  ) returning id into payment_id;

  return payment_id;
end;
$admin_record_bmc_travel_payment$;

revoke all on function public.admin_record_bmc_travel_payment(uuid, numeric, text) from public, anon;
grant execute on function public.admin_record_bmc_travel_payment(uuid, numeric, text) to authenticated;

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
  if _division is not null and _division not in ('agrovest', 'travels') then
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

create or replace function public.get_my_bmc_division_commissions()
returns table (
  commission_id uuid,
  division text,
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
as $get_my_bmc_division_commissions$
declare
  actor uuid := auth.uid();
begin
  if actor is null then raise exception 'Authentication required'; end if;

  return query
  select c.id, c.division, c.source_type, c.gross_customer_payment,
         c.commission_rate, c.commission_amount, c.status,
         c.payment_reference, c.created_at, c.paid_at, c.payout_reference
  from public.bmc_division_commissions c
  where c.referrer_user_id = actor
  order by c.created_at desc;
end;
$get_my_bmc_division_commissions$;

revoke all on function public.get_my_bmc_division_commissions() from public, anon;
grant execute on function public.get_my_bmc_division_commissions() to authenticated;

create or replace function public.admin_mark_bmc_commission_paid(
  _commission_id uuid,
  _payout_reference text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $admin_mark_bmc_commission_paid$
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
  if coalesce(length(trim(_payout_reference)), 0) < 3 then
    raise exception 'A payout reference is required';
  end if;

  update public.bmc_division_commissions
  set status = 'paid', paid_at = now(), paid_by = actor,
      payout_reference = trim(_payout_reference)
  where id = _commission_id and status = 'earned';

  if not found then
    raise exception 'Commission is not available for payout or has already been processed';
  end if;
  return true;
end;
$admin_mark_bmc_commission_paid$;

revoke all on function public.admin_mark_bmc_commission_paid(uuid, text) from public, anon;
grant execute on function public.admin_mark_bmc_commission_paid(uuid, text) to authenticated;

create or replace function public.admin_reverse_bmc_travel_payment(
  _payment_id uuid,
  _reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $admin_reverse_bmc_travel_payment$
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
  if coalesce(length(trim(_reason)), 0) < 5 then
    raise exception 'A reversal reason is required';
  end if;

  update public.bmc_travel_commission_payments
  set payment_status = 'reversed', reversed_at = now(), reversal_reason = trim(_reason)
  where id = _payment_id and payment_status = 'cleared';

  if not found then
    raise exception 'Travel payment is not in a reversible state';
  end if;
  return true;
end;
$admin_reverse_bmc_travel_payment$;

revoke all on function public.admin_reverse_bmc_travel_payment(uuid, text) from public, anon;
grant execute on function public.admin_reverse_bmc_travel_payment(uuid, text) to authenticated;


-- Management reversal for verified full refunds/cancellations.
-- Paid commissions are not silently erased; Finance must reconcile any recovery separately.
create or replace function public.admin_reverse_bmc_division_commission(
  _commission_id uuid,
  _reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $admin_reverse_bmc_division_commission$
declare
  actor uuid := auth.uid();
  commission public.bmc_division_commissions;
begin
  if actor is null then
    raise exception 'Authentication required';
  end if;
  if not (
    public.user_has_permission(actor, 'admin:manage_bmc_partners')
    or public.user_has_permission(actor, 'admin:all')
  ) then
    raise exception 'BMC commission management permission required';
  end if;
  if coalesce(length(trim(_reason)), 0) < 5 then
    raise exception 'A reversal reason is required';
  end if;

  select * into commission
  from public.bmc_division_commissions
  where id = _commission_id
  for update;

  if not found then
    raise exception 'BMC commission record not found';
  end if;
  if commission.status <> 'earned' then
    raise exception 'Only earned, unpaid commissions can be reversed here; paid commissions require Finance recovery reconciliation';
  end if;

  if commission.division = 'travels' then
    update public.bmc_travel_commission_payments
    set payment_status = 'reversed',
        reversed_at = now(),
        reversal_reason = trim(_reason)
    where id = commission.source_record_id
      and payment_status = 'cleared';

    if not found then
      raise exception 'Underlying Travels payment is not in a reversible state';
    end if;
  else
    update public.bmc_division_commissions
    set status = 'reversed',
        reversed_at = now(),
        reversal_reason = trim(_reason)
    where id = _commission_id
      and status = 'earned';
  end if;

  return true;
end;
$admin_reverse_bmc_division_commission$;

revoke all on function public.admin_reverse_bmc_division_commission(uuid, text) from public, anon;
grant execute on function public.admin_reverse_bmc_division_commission(uuid, text) to authenticated;
