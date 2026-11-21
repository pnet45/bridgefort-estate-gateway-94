-- Independent 10% direct-referral commission ledgers for Agrovest and Travels.
-- Homes/BH-Realtors commissions remain on the existing MLM commission engine.
-- Only confirmed/approved customer payments generate commission entries.

create table if not exists public.bmc_division_commissions (
  id uuid primary key default gen_random_uuid(),
  division text not null check (division in ('agrovest', 'travels')),
  bmc_user_id uuid not null references auth.users(id) on delete restrict,
  referral_code_id uuid not null references public.bmc_division_referral_codes(id) on delete restrict,
  source_type text not null check (source_type in ('agrovest_payment', 'travel_payment')),
  source_record_id uuid not null,
  source_order_id uuid references public.orders(id) on delete restrict,
  source_booking_id uuid references public.travel_bookings(id) on delete restrict,
  gross_payment_amount numeric(20,2) not null check (gross_payment_amount > 0),
  commission_rate numeric(6,5) not null default 0.10 check (commission_rate = 0.10),
  commission_amount numeric(20,2) not null check (commission_amount >= 0),
  refunded_payment_amount numeric(20,2) not null default 0 check (refunded_payment_amount >= 0),
  reversed_commission_amount numeric(20,2) not null default 0 check (reversed_commission_amount >= 0),
  status text not null default 'earned' check (status in ('earned', 'partially_reversed', 'reversed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bmc_division_commission_source_unique unique (source_type, source_record_id),
  constraint bmc_division_commission_refund_bounds check (
    refunded_payment_amount <= gross_payment_amount
    and reversed_commission_amount <= commission_amount
  ),
  constraint bmc_division_commission_source_division_check check (
    (division = 'agrovest' and source_type = 'agrovest_payment' and source_order_id is not null and source_booking_id is null)
    or (division = 'travels' and source_type = 'travel_payment' and source_booking_id is not null and source_order_id is null)
  )
);

create index if not exists bmc_division_commissions_owner_idx
  on public.bmc_division_commissions (bmc_user_id, division, created_at desc);

alter table public.bmc_division_commissions enable row level security;
revoke all on public.bmc_division_commissions from anon, authenticated;

-- Travel enquiries are not paid transactions. This separate, restricted ledger
-- records payment receipts only after an authorized travel manager confirms
-- that the customer's funds have cleared.
create table if not exists public.bmc_travel_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.travel_bookings(id) on delete restrict,
  payment_reference text not null unique,
  amount numeric(20,2) not null check (amount > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  payment_status text not null default 'confirmed' check (payment_status in ('confirmed', 'reversed')),
  confirmed_by uuid not null references auth.users(id) on delete restrict,
  confirmed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists bmc_travel_payments_booking_idx
  on public.bmc_travel_payments (booking_id, confirmed_at desc);

alter table public.bmc_travel_payments enable row level security;
revoke all on public.bmc_travel_payments from anon, authenticated;
grant all on public.bmc_travel_payments to service_role;

create or replace function public.create_bmc_agrovest_commission_from_payment_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  linked_order public.orders;
  referral public.bmc_division_referral_codes;
  qualifying_items boolean;
begin
  if new.status <> 'approved' or old.status is distinct from 'pending' then
    return new;
  end if;

  if coalesce(new.amount, 0) <= 0 then
    return new;
  end if;

  select o.* into linked_order
  from public.orders o
  where (new.order_id is not null and o.id = new.order_id)
     or (new.reference is not null and o.payment_reference = new.reference)
  order by case when o.id = new.order_id then 0 else 1 end
  limit 1
  for update;

  if not found or linked_order.bmc_referral_code_id is null then
    return new;
  end if;

  select c.* into referral
  from public.bmc_division_referral_codes c
  join public.bmc_partner_divisions d on d.id = c.application_id
  where c.id = linked_order.bmc_referral_code_id
    and c.division = 'agrovest'
    and c.is_active is true
    and d.application_status = 'approved';

  if not found then
    return new;
  end if;

  select jsonb_typeof(coalesce(linked_order.items, '[]'::jsonb)) = 'array'
     and jsonb_array_length(coalesce(linked_order.items, '[]'::jsonb)) > 0
     and not exists (
       select 1
       from jsonb_array_elements(coalesce(linked_order.items, '[]'::jsonb)) as entries(item)
       where coalesce(entries.item ->> 'property_type', '') <> 'Agrovest'
     )
  into qualifying_items;

  if not coalesce(qualifying_items, false) then
    raise exception 'Agrovest commission cannot be calculated for a non-Agrovest order';
  end if;

  insert into public.bmc_division_commissions (
    division, bmc_user_id, referral_code_id, source_type, source_record_id,
    source_order_id, gross_payment_amount, commission_rate, commission_amount
  ) values (
    'agrovest', referral.user_id, referral.id, 'agrovest_payment', new.id,
    linked_order.id, round(new.amount::numeric, 2), 0.10,
    round(new.amount::numeric * 0.10, 2)
  )
  on conflict (source_type, source_record_id) do nothing;

  return new;
end;
$function$;

revoke all on function public.create_bmc_agrovest_commission_from_payment_request() from public, anon, authenticated;

drop trigger if exists bmc_agrovest_commission_after_payment_approval on public.payment_requests;
create trigger bmc_agrovest_commission_after_payment_approval
  after update of status on public.payment_requests
  for each row
  when (new.status = 'approved' and old.status = 'pending')
  execute function public.create_bmc_agrovest_commission_from_payment_request();

create or replace function public.create_bmc_travel_commission_from_confirmed_payment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  booking public.travel_bookings;
  referral public.bmc_division_referral_codes;
begin
  if new.payment_status <> 'confirmed' then
    return new;
  end if;

  select b.* into booking
  from public.travel_bookings b
  where b.id = new.booking_id
  for share;

  if not found or booking.bmc_referral_code_id is null then
    return new;
  end if;

  select c.* into referral
  from public.bmc_division_referral_codes c
  join public.bmc_partner_divisions d on d.id = c.application_id
  where c.id = booking.bmc_referral_code_id
    and c.division = 'travels'
    and c.is_active is true
    and d.application_status = 'approved';

  if not found then
    return new;
  end if;

  insert into public.bmc_division_commissions (
    division, bmc_user_id, referral_code_id, source_type, source_record_id,
    source_booking_id, gross_payment_amount, commission_rate, commission_amount
  ) values (
    'travels', referral.user_id, referral.id, 'travel_payment', new.id,
    booking.id, round(new.amount::numeric, 2), 0.10,
    round(new.amount::numeric * 0.10, 2)
  )
  on conflict (source_type, source_record_id) do nothing;

  return new;
end;
$function$;

revoke all on function public.create_bmc_travel_commission_from_confirmed_payment() from public, anon, authenticated;

drop trigger if exists bmc_travel_commission_after_payment_confirmation on public.bmc_travel_payments;
create trigger bmc_travel_commission_after_payment_confirmation
  after insert on public.bmc_travel_payments
  for each row
  when (new.payment_status = 'confirmed')
  execute function public.create_bmc_travel_commission_from_confirmed_payment();

create or replace function public.get_my_bmc_division_commissions(_limit integer default 100)
returns table (
  id uuid,
  division text,
  source_type text,
  gross_payment_amount numeric,
  commission_rate numeric,
  commission_amount numeric,
  refunded_payment_amount numeric,
  reversed_commission_amount numeric,
  net_commission_amount numeric,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  return query
  select c.id, c.division, c.source_type, c.gross_payment_amount,
         c.commission_rate, c.commission_amount, c.refunded_payment_amount,
         c.reversed_commission_amount,
         greatest(c.commission_amount - c.reversed_commission_amount, 0),
         c.status, c.created_at
  from public.bmc_division_commissions c
  where c.bmc_user_id = auth.uid()
  order by c.created_at desc
  limit least(greatest(coalesce(_limit, 100), 1), 500);
end;
$function$;

revoke all on function public.get_my_bmc_division_commissions(integer) from public, anon;
grant execute on function public.get_my_bmc_division_commissions(integer) to authenticated;

create or replace function public.admin_reverse_bmc_division_commission(
  _commission_id uuid,
  _refund_amount numeric,
  _reason text
)
returns public.bmc_division_commissions
language plpgsql
security definer
set search_path = ''
as $function$
declare
  caller uuid := auth.uid();
  current_commission public.bmc_division_commissions;
  updated_commission public.bmc_division_commissions;
  commission_reversal numeric;
begin
  if caller is null or not (
    public.user_has_permission(caller, 'admin:manage_bmc_partners'::text)
    or public.user_has_permission(caller, 'admin:approve_payments'::text)
    or public.user_has_permission(caller, 'admin:manage_travels'::text)
    or public.user_has_permission(caller, 'admin:all'::text)
  ) then
    raise exception 'Commission adjustment permission required';
  end if;

  if _refund_amount is null or _refund_amount <= 0
     or nullif(trim(coalesce(_reason, '')), '') is null then
    raise exception 'A positive refund amount and reason are required';
  end if;

  select * into current_commission
  from public.bmc_division_commissions
  where id = _commission_id
  for update;

  if not found then
    raise exception 'BMC commission record not found';
  end if;

  if _refund_amount > current_commission.gross_payment_amount - current_commission.refunded_payment_amount then
    raise exception 'Refund amount exceeds the remaining commissionable payment';
  end if;

  commission_reversal := least(
    current_commission.commission_amount - current_commission.reversed_commission_amount,
    round(_refund_amount * current_commission.commission_rate, 2)
  );

  update public.bmc_division_commissions
  set refunded_payment_amount = refunded_payment_amount + _refund_amount,
      reversed_commission_amount = reversed_commission_amount + commission_reversal,
      status = case
        when refunded_payment_amount + _refund_amount >= gross_payment_amount then 'reversed'
        else 'partially_reversed'
      end,
      updated_at = now()
  where id = _commission_id
  returning * into updated_commission;

  return updated_commission;
end;
$function$;

revoke all on function public.admin_reverse_bmc_division_commission(uuid, numeric, text) from public, anon;
grant execute on function public.admin_reverse_bmc_division_commission(uuid, numeric, text) to authenticated;
