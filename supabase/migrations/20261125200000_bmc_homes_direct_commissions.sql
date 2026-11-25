-- BMC Homes commissions are now independent of the legacy BH-Realtors MLM
-- relationship. Old BH-Realtors referral codes continue through the legacy
-- commission engine; canonical BMC codes earn direct-only BMC Homes commissions.

alter table public.bmc_division_commissions
  drop constraint if exists bmc_division_commissions_division_check;
alter table public.bmc_division_commissions
  add constraint bmc_division_commissions_division_check
  check (division in ('homes','agrovest','travels'));

alter table public.bmc_division_commissions
  drop constraint if exists bmc_division_commissions_source_type_check;
alter table public.bmc_division_commissions
  add constraint bmc_division_commissions_source_type_check
  check (source_type in ('homes_sale','agrovest_payment','travel_payment'));

alter table public.bmc_division_commissions
  drop constraint if exists bmc_division_commissions_commission_rate_check;
alter table public.bmc_division_commissions
  add constraint bmc_division_commissions_commission_rate_check
  check (commission_rate in (5.00,10.00,15.00));

create or replace function public.award_bmc_homes_commission_from_paid_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  attribution public.bmc_division_referral_attributions;
  item_row jsonb;
  asset_type text;
  property_id text;
  plot_id text;
  quantity numeric;
  gross_amount numeric;
  rate numeric;
  sale_id uuid;
begin
  if new.payment_status <> 'paid' or old.payment_status = 'paid' then
    return new;
  end if;
  if new.bmc_referral_code_id is null then return new; end if;

  select a.* into attribution
  from public.bmc_division_referral_attributions a
  where a.source_type = 'order'
    and a.source_record_id = new.id
    and a.division = 'homes'
  for share;
  if not found then return new; end if;

  if jsonb_typeof(coalesce(new.items,'[]'::jsonb)) <> 'array' then return new; end if;

  for item_row in
    select value from jsonb_array_elements(coalesce(new.items,'[]'::jsonb))
  loop
    asset_type := lower(trim(coalesce(
      nullif(item_row->>'property_type',''),
      nullif(item_row->>'type',''),
      nullif(item_row->>'category',''),
      ''
    )));
    if asset_type = 'agrovest'
       or asset_type ilike 'documentation%'
       or asset_type ilike '%subscription%'
       or asset_type ilike '%promo%' then
      continue;
    end if;

    if asset_type like '%land%' or asset_type like '%plot%' then
      rate := 15.00;
    elsif asset_type like '%house%'
       or asset_type like '%home%'
       or asset_type like '%apartment%'
       or asset_type like '%flat%'
       or asset_type like '%duplex%'
       or asset_type like '%bungalow%'
       or asset_type like '%terrace%'
       or asset_type like '%residential%' then
      rate := 5.00;
    else
      continue;
    end if;

    property_id := nullif(item_row->>'property_id','');
    plot_id := nullif(item_row->>'plot_id','');
    quantity := greatest(1, coalesce((item_row->>'quantity')::numeric,1));
    gross_amount := coalesce((item_row->>'price')::numeric,0) * quantity;
    if property_id is null or gross_amount <= 0 then continue; end if;

    sale_id := null;
    if plot_id is not null then
      insert into public.bh_property_sales(buyer_id, order_id, property_id, plot_id, property_price)
      values (new.user_id, new.id, property_id, plot_id, gross_amount)
      on conflict (buyer_id, property_id, plot_id) do nothing
      returning id into sale_id;
      if sale_id is null then
        select s.id into sale_id from public.bh_property_sales s
        where s.buyer_id = new.user_id and s.order_id = new.id
          and s.property_id = property_id and s.plot_id = plot_id
        limit 1;
      end if;
    else
      insert into public.bh_property_sales(buyer_id, order_id, property_id, property_price)
      values (new.user_id, new.id, property_id, gross_amount)
      on conflict (buyer_id, property_id) where plot_id is null do nothing
      returning id into sale_id;
      if sale_id is null then
        select s.id into sale_id from public.bh_property_sales s
        where s.buyer_id = new.user_id and s.order_id = new.id
          and s.property_id = property_id and s.plot_id is null
        limit 1;
      end if;
    end if;

    if sale_id is null then continue; end if;

    insert into public.bmc_division_commissions (
      division, referral_attribution_id, referrer_user_id,
      source_type, source_record_id, gross_customer_payment,
      commission_rate, commission_amount, status, payment_reference
    ) values (
      'homes', attribution.id, attribution.referrer_user_id,
      'homes_sale', sale_id, gross_amount,
      rate, round(gross_amount * rate / 100, 2), 'earned', null
    )
    on conflict (source_type, source_record_id) do nothing;
  end loop;

  return new;
end;
$function$;

revoke all on function public.award_bmc_homes_commission_from_paid_order() from public, anon, authenticated;
drop trigger if exists bmc_award_homes_commission_from_paid_order on public.orders;
create trigger bmc_award_homes_commission_from_paid_order
  after update of payment_status on public.orders
  for each row execute function public.award_bmc_homes_commission_from_paid_order();

-- Existing unpaid BMC commission rows for divisions that are not approved
-- are moved to held before the new release/hold trigger becomes authoritative.
update public.bmc_division_commissions c
set status = 'held'
where c.status = 'earned'
  and not exists (
    select 1 from public.bmc_partner_divisions d
    where d.user_id = c.referrer_user_id
      and d.division = c.division
      and d.application_status = 'approved'
  );

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
as $function$
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
$function$;

revoke all on function public.admin_list_bmc_division_commissions(text) from public, anon;
grant execute on function public.admin_list_bmc_division_commissions(text) to authenticated;
