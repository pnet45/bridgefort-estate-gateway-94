-- Preserve BMC signup-link attribution when the referred customer makes a
-- later Homes or Agrovest order without manually re-entering the referral code.
-- Explicit checkout referral codes continue to take precedence.
create or replace function public.record_bmc_division_order_referral()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  referral public.bmc_division_referral_codes;
  target_division text;
  has_agrovest boolean := false;
  has_non_agrovest boolean := false;
begin
  if new.bmc_referral_code_id is not null then
    select c.* into referral
    from public.bmc_division_referral_codes c
    where c.id = new.bmc_referral_code_id
      and c.division in ('homes','agrovest')
      and c.is_active is true
    for share of c;

    if not found then
      raise exception 'Invalid or inactive Bridgefort division referral code';
    end if;

    if jsonb_typeof(coalesce(new.items,'[]'::jsonb)) <> 'array'
       or jsonb_array_length(coalesce(new.items,'[]'::jsonb)) = 0 then
      raise exception 'Referral code cannot be used with this order';
    end if;

    if referral.division = 'agrovest' and exists (
      select 1 from jsonb_array_elements(coalesce(new.items,'[]'::jsonb)) as entries(item)
      where coalesce(entries.item ->> 'property_type','') <> 'Agrovest'
    ) then
      raise exception 'Agrovest referral codes can only be used for Agrovest-only orders';
    end if;

    if referral.division = 'homes' and exists (
      select 1 from jsonb_array_elements(coalesce(new.items,'[]'::jsonb)) as entries(item)
      where coalesce(entries.item ->> 'property_type','') = 'Agrovest'
    ) then
      raise exception 'Homes referral codes cannot be used for Agrovest items';
    end if;
  else
    -- A signup referral is the customer's durable referral identity. Resolve
    -- its matching division-specific code for this order, even when the cart
    -- was created in a later browser session and has no URL referral parameter.
    if jsonb_typeof(coalesce(new.items,'[]'::jsonb)) <> 'array'
       or jsonb_array_length(coalesce(new.items,'[]'::jsonb)) = 0 then
      return new;
    end if;

    has_agrovest := exists (
      select 1 from jsonb_array_elements(coalesce(new.items,'[]'::jsonb)) as entries(item)
      where coalesce(entries.item ->> 'property_type','') = 'Agrovest'
    );
    has_non_agrovest := exists (
      select 1 from jsonb_array_elements(coalesce(new.items,'[]'::jsonb)) as entries(item)
      where coalesce(entries.item ->> 'property_type','') <> 'Agrovest'
    );

    -- A single order attribution belongs to one division. Mixed carts must
    -- not silently credit the wrong division.
    if has_agrovest and has_non_agrovest then
      return new;
    end if;

    target_division := case when has_agrovest then 'agrovest' else 'homes' end;

    select target_code.* into referral
    from public.bmc_division_referral_attributions signup_attribution
    join public.bmc_division_referral_codes signup_code
      on signup_code.id = signup_attribution.referral_code_id
     and signup_code.user_id = signup_attribution.referrer_user_id
    join public.bmc_identity_referral_codes identity_code
      on identity_code.user_id = signup_attribution.referrer_user_id
     and identity_code.referral_code = signup_code.referral_code
     and identity_code.is_active is true
    join public.bmc_division_referral_codes target_code
      on target_code.user_id = identity_code.user_id
     and target_code.referral_code = identity_code.referral_code
     and target_code.division = target_division
     and target_code.is_active is true
    where signup_attribution.source_type = 'signup'
      and signup_attribution.division = 'homes'
      and signup_attribution.referred_user_id = new.user_id
    order by signup_attribution.created_at desc
    limit 1
    for share of target_code;

    if not found then
      return new;
    end if;
  end if;

  if referral.user_id <> new.user_id then
    insert into public.bmc_division_referral_attributions
      (referral_code_id, division, referrer_user_id, referred_user_id, source_type, source_record_id)
    values (referral.id, referral.division, referral.user_id, new.user_id, 'order', new.id)
    on conflict (source_type, source_record_id) do nothing;
  end if;

  return new;
end;
$function$;

revoke all on function public.record_bmc_division_order_referral() from public, anon, authenticated;
