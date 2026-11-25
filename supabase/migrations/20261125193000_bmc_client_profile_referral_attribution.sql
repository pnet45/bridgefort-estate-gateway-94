-- Allow clients to attach one direct BMC referrer from their profile.
-- The relationship is immutable for ordinary users and reused across all divisions.
alter table public.bmc_division_referral_attributions
  drop constraint if exists bmc_division_referral_attributions_source_type_check;
alter table public.bmc_division_referral_attributions
  add constraint bmc_division_referral_attributions_source_type_check
  check (source_type in ('signup','profile','travel_booking','order'));

create or replace function public.get_my_bmc_client_referral()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor uuid := auth.uid();
  referrer_count integer;
  result jsonb;
begin
  if actor is null then raise exception 'Authentication required'; end if;

  select count(distinct a.referrer_user_id)
    into referrer_count
  from public.bmc_division_referral_attributions a
  where a.referred_user_id = actor;

  if referrer_count > 1 then
    return jsonb_build_object('status','review_required');
  end if;

  select jsonb_build_object(
    'status','linked',
    'referrer_user_id', a.referrer_user_id,
    'referrer_name', nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
    'referral_code', c.referral_code,
    'linked_at', a.created_at
  )
  into result
  from public.bmc_division_referral_attributions a
  left join public.bmc_division_referral_codes c on c.id = a.referral_code_id
  left join public.profiles p on p.id = a.referrer_user_id
  where a.referred_user_id = actor
  order by case a.source_type when 'profile' then 0 when 'signup' then 1 else 2 end,
           a.created_at asc
  limit 1;

  return coalesce(result, jsonb_build_object('status','not_linked'));
end;
$function$;

create or replace function public.attach_my_bmc_referral_code(_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor uuid := auth.uid();
  normalized_code text := upper(trim(coalesce(_code,'')));
  referral public.bmc_division_referral_codes;
  existing_referrers uuid[];
  existing_referrer uuid;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if normalized_code = '' or length(normalized_code) > 64 then
    raise exception 'Enter a valid BMC referral code';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(actor::text, 0));

  select c.* into referral
  from public.bmc_division_referral_codes c
  where c.referral_code = normalized_code
    and c.is_active is true
  order by (c.division = 'homes') desc, c.created_at asc
  limit 1
  for share;

  if not found then raise exception 'This BMC referral code is invalid or inactive'; end if;
  if referral.user_id = actor then raise exception 'You cannot use your own BMC referral code'; end if;

  select array_agg(distinct a.referrer_user_id)
    into existing_referrers
  from public.bmc_division_referral_attributions a
  where a.referred_user_id = actor;

  if coalesce(cardinality(existing_referrers),0) > 1 then
    raise exception 'Your existing referral history needs support review before it can be linked';
  end if;

  if coalesce(cardinality(existing_referrers),0) = 1 then
    existing_referrer := existing_referrers[1];
    if existing_referrer <> referral.user_id then
      raise exception 'A different BMC referral source is already linked to your account. Contact support if you believe this is incorrect.';
    end if;
  end if;

  insert into public.bmc_division_referral_attributions
    (referral_code_id, division, referrer_user_id, referred_user_id, source_type, source_record_id)
  values
    (referral.id, referral.division, referral.user_id, actor, 'profile', actor)
  on conflict (source_type, source_record_id) do nothing;

  return public.get_my_bmc_client_referral();
end;
$function$;

revoke all on function public.get_my_bmc_client_referral() from public, anon;
revoke all on function public.attach_my_bmc_referral_code(text) from public, anon;
grant execute on function public.get_my_bmc_client_referral() to authenticated;
grant execute on function public.attach_my_bmc_referral_code(text) to authenticated;
