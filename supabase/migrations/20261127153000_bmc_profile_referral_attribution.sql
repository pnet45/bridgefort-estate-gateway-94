-- Support explicit BMC referral attribution from the general user profile.
-- This remains separate from legacy BH-Realtors referral fields and codes.
alter table public.profiles
  add column if not exists bmc_referred_by_code text;

comment on column public.profiles.bmc_referred_by_code is
  'Canonical BMC referral code captured through signup or the dedicated BMC profile referral section. Separate from legacy BH-Realtors referral fields.';

create or replace function public.attach_bmc_profile_referral(_code text)
returns table(referrer_user_id uuid, referrer_name text)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor_id uuid := auth.uid();
  normalized_code text := upper(trim(coalesce(_code, '')));
  canonical_referrer_id uuid;
  homes_code_id uuid;
  existing_referrer_id uuid;
  display_name text;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;
  if normalized_code = '' then
    raise exception 'Enter a BMC referral code';
  end if;

  select identity_code.user_id
    into canonical_referrer_id
  from public.bmc_identity_referral_codes identity_code
  where identity_code.referral_code = normalized_code
    and identity_code.is_active is true;

  if canonical_referrer_id is null then
    raise exception 'BMC referral code is invalid or inactive';
  end if;
  if canonical_referrer_id = actor_id then
    raise exception 'You cannot use your own BMC referral code';
  end if;

  select division_code.id
    into homes_code_id
  from public.bmc_division_referral_codes division_code
  join public.bmc_partner_divisions application
    on application.id = division_code.application_id
  where division_code.user_id = canonical_referrer_id
    and division_code.referral_code = normalized_code
    and division_code.division = 'homes'
    and division_code.is_active is true
    and application.application_status not in ('suspended','rejected','withdrawn')
  limit 1;

  if homes_code_id is null then
    raise exception 'This BMC referral identity is not active for Homes referrals';
  end if;

  select attribution.referrer_user_id
    into existing_referrer_id
  from public.bmc_division_referral_attributions attribution
  where attribution.source_type = 'signup'
    and attribution.referred_user_id = actor_id
  order by attribution.created_at
  limit 1;

  if existing_referrer_id is not null and existing_referrer_id <> canonical_referrer_id then
    raise exception 'A BMC referral is already linked to this account and cannot be changed';
  end if;

  insert into public.bmc_division_referral_attributions
    (referral_code_id, division, referrer_user_id, referred_user_id, source_type, source_record_id)
  values
    (homes_code_id, 'homes', canonical_referrer_id, actor_id, 'signup', actor_id)
  on conflict (source_type, source_record_id) do nothing;

  update public.profiles
  set bmc_referred_by_code = normalized_code,
      updated_at = now()
  where id = actor_id
    and (bmc_referred_by_code is null or bmc_referred_by_code = normalized_code);

  if not found then
    raise exception 'A different BMC referral code is already saved on this profile';
  end if;

  select nullif(trim(concat_ws(' ', profile.first_name, profile.last_name)), '')
    into display_name
  from public.profiles profile
  where profile.id = canonical_referrer_id;

  return query select canonical_referrer_id, coalesce(display_name, 'Verified BMC Partner');
end;
$function$;

revoke all on function public.attach_bmc_profile_referral(text) from public, anon, authenticated;
grant execute on function public.attach_bmc_profile_referral(text) to authenticated;
