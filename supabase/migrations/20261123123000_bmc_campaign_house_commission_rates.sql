-- BMC campaign commission schedule: land 15%, house sales 5%, Agrovest/Travels 10%.
-- This replaces only the BH-Realtors property-sale award function. Existing commission rows
-- and wallet balances are not recalculated. The trigger continues to award only on paid orders.

create or replace function public.award_bhrealtor_property_sale_commission()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_buyer_id uuid;
  v_seller_id uuid;
  v_level1_id uuid;
  v_seller_package text;
  v_level1_package text;
  v_seller_is_pbo boolean;
  v_seller_is_active boolean;
  v_level1_is_pbo boolean;
  v_level1_is_active boolean;
  v_seller_rate numeric;
  v_level1_rate numeric;
  v_item jsonb;
  v_property_type text;
  v_property_price numeric;
  v_quantity numeric;
  v_property_id text;
  v_plot_id text;
  v_sale_id uuid;
  v_commission numeric;
  v_status text;
begin
  if new.payment_status <> 'paid' or old.payment_status = 'paid' then
    return new;
  end if;

  v_buyer_id := new.user_id;

  select p.referred_by_id
  into v_seller_id
  from public.profiles p
  where p.id = v_buyer_id;

  if v_seller_id is null then
    return new;
  end if;

  select p.current_package, p.is_pbo, p.is_active, p.referred_by_id
  into v_seller_package, v_seller_is_pbo, v_seller_is_active, v_level1_id
  from public.profiles p
  where p.id = v_seller_id;

  if not coalesce(v_seller_is_pbo, false) or not coalesce(v_seller_is_active, false) then
    return new;
  end if;

  select p.current_package, p.is_pbo, p.is_active
  into v_level1_package, v_level1_is_pbo, v_level1_is_active
  from public.profiles p
  where p.id = v_level1_id;

  for v_item in
    select value from jsonb_array_elements(coalesce(new.items, '[]'::jsonb))
  loop
    v_property_type := lower(trim(coalesce(
      nullif(v_item->>'property_type', ''),
      nullif(v_item->>'type', ''),
      nullif(v_item->>'category', ''),
      ''
    )));

    if v_property_type = 'agrovest'
       or v_property_type ilike 'documentation%'
       or v_property_type ilike '%subscription%'
       or v_property_type ilike '%promo%' then
      continue;
    end if;

    -- Apply a fixed business rate by asset class, never by BH-Realtors package tier.
    if v_property_type like '%land%' or v_property_type like '%plot%' then
      v_seller_rate := 15;
      v_level1_rate := case
        when coalesce(v_level1_is_pbo, false)
         and coalesce(v_level1_is_active, false)
         and public.bhrealtor_package_rank(v_level1_package) >= 2
        then 5 else 0 end;
    elsif v_property_type like '%house%'
       or v_property_type like '%home%'
       or v_property_type like '%apartment%'
       or v_property_type like '%flat%'
       or v_property_type like '%duplex%'
       or v_property_type like '%bungalow%'
       or v_property_type like '%terrace%'
       or v_property_type like '%residential%' then
      v_seller_rate := 5;
      -- House sales pay the stated 5% direct commission only; no additional
      -- second-level property-sale commission is created for this asset class.
      v_level1_rate := 0;
    else
      -- Unknown property classes must not silently inherit the land rate.
      continue;
    end if;

    v_property_id := nullif(v_item->>'property_id', '');
    v_plot_id := nullif(v_item->>'plot_id', '');
    v_quantity := greatest(1, coalesce((v_item->>'quantity')::numeric, 1));
    v_property_price := coalesce((v_item->>'price')::numeric, 0) * v_quantity;

    if v_property_id is null or v_property_price <= 0 then
      continue;
    end if;

    v_sale_id := null;
    if v_plot_id is not null then
      insert into public.bh_property_sales(buyer_id, order_id, property_id, plot_id, property_price)
      values (v_buyer_id, new.id, v_property_id, v_plot_id, v_property_price)
      on conflict (buyer_id, property_id, plot_id) do nothing
      returning id into v_sale_id;
    else
      insert into public.bh_property_sales(buyer_id, order_id, property_id, property_price)
      values (v_buyer_id, new.id, v_property_id, v_property_price)
      on conflict (buyer_id, property_id) where plot_id is null do nothing
      returning id into v_sale_id;
    end if;

    if v_sale_id is null then
      continue;
    end if;

    v_commission := round(v_property_price * v_seller_rate / 100, 2);
    v_status := case
      when v_seller_package = 'associate' then 'locked'
      else 'available'
    end;

    insert into public.mlm_commissions (
      source_purchase_id, source_order_id, source_property_sale_id,
      commission_source, beneficiary_id, sponsor_level, commission_rate,
      commission_amount, status, description
    ) values (
      null, new.id, v_sale_id,
      'property_sale', v_seller_id, 1, v_seller_rate, v_commission,
      v_status,
      case when v_seller_rate = 15
        then '15% land sales commission'
        else '5% house sales commission' end
    )
    on conflict (source_property_sale_id, beneficiary_id, sponsor_level) do nothing;

    if found then
      update public.profiles
      set total_commissions = coalesce(total_commissions, 0) + v_commission,
          total_personal_volume = coalesce(total_personal_volume, 0) + v_property_price,
          wallet_balance = case when v_status = 'available'
            then coalesce(wallet_balance, 0) + v_commission
            else coalesce(wallet_balance, 0) end,
          updated_at = now()
      where id = v_seller_id;
    end if;

    if v_level1_rate > 0 then
      v_commission := round(v_property_price * v_level1_rate / 100, 2);

      insert into public.mlm_commissions (
        source_purchase_id, source_order_id, source_property_sale_id,
        commission_source, beneficiary_id, sponsor_level, commission_rate,
        commission_amount, status, description
      ) values (
        null, new.id, v_sale_id,
        'property_sale', v_level1_id, 2, v_level1_rate,
        v_commission, 'available',
        '5% first-level referrer commission on an estate-land sale'
      )
      on conflict (source_property_sale_id, beneficiary_id, sponsor_level) do nothing;

      if found then
        update public.profiles
        set wallet_balance = coalesce(wallet_balance, 0) + v_commission,
            total_commissions = coalesce(total_commissions, 0) + v_commission,
            updated_at = now()
        where id = v_level1_id;
      end if;
    end if;
  end loop;

  return new;
end;
$function$;

comment on function public.award_bhrealtor_property_sale_commission() is
'BH-Realtors property sales: fixed 15% direct commission for land and fixed 5% direct commission for houses. House sales do not generate a second-level property-sale commission. Only newly paid orders are processed; historical commissions are not recalculated.';
