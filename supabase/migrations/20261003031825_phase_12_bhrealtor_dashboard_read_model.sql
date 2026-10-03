create or replace function public.get_my_bhrealtor_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r jsonb;
  uid uuid := auth.uid();
  v_profile jsonb;
  v_wallet numeric := 0;
  v_total_commissions numeric := 0;
  v_locked_commissions numeric := 0;
  v_direct integer := 0;
  v_active_direct integer := 0;
  v_withdrawn numeric := 0;
  v_pending_withdrawal numeric := 0;
begin
  if uid is null then
    raise exception using errcode='42501', message='Authentication required';
  end if;

  select jsonb_build_object(
    'is_pbo', p.is_pbo,
    'is_active', p.is_active,
    'package', p.current_package,
    'rank', p.current_rank,
    'referral_code', p.pbo_referral_code,
    'wallet_balance', coalesce(p.wallet_balance,0),
    'total_commissions', coalesce(p.total_commissions,0)
  ), coalesce(p.wallet_balance,0)
  into v_profile, v_wallet
  from profiles p
  where p.id = uid;

  select count(*)::integer into v_direct from profiles p where p.referred_by_id = uid;

  select count(*)::integer into v_active_direct
  from profiles p
  where p.referred_by_id = uid and p.is_pbo = true and p.is_active = true;

  select coalesce(sum(commission_amount),0),
         coalesce(sum(commission_amount) filter (where status = 'locked'),0)
  into v_total_commissions, v_locked_commissions
  from mlm_commissions
  where beneficiary_id = uid;

  select coalesce(sum(amount) filter (where status = 'paid'),0),
         coalesce(sum(amount) filter (where status = 'pending'),0)
  into v_withdrawn, v_pending_withdrawal
  from withdrawal_requests
  where user_id = uid;

  select jsonb_build_object(
    'profile', coalesce(v_profile, '{}'::jsonb),
    'direct_referrals', v_direct,
    'active_direct_referrals', v_active_direct,
    'total_commissions_earned', v_total_commissions,
    'locked_commissions', v_locked_commissions,
    'withdrawn_total', v_withdrawn,
    'pending_withdrawal_total', v_pending_withdrawal,
    'available_balance', v_wallet,
    'can_withdraw', public.bhrealtor_package_can_withdraw(coalesce(v_profile->>'package','associate')),
    'commissions', coalesce((
      select jsonb_agg(x order by x.created_at desc)
      from (
        select id, commission_amount, status, commission_type, referral_level, created_at,
               source_order_id, source_purchase_id, source_property_sale_id
        from mlm_commissions where beneficiary_id = uid order by created_at desc limit 100
      ) x
    ), '[]'::jsonb),
    'withdrawals', coalesce((
      select jsonb_agg(x order by x.created_at desc)
      from (
        select id, amount, status, created_at
        from withdrawal_requests where user_id = uid order by created_at desc limit 20
      ) x
    ), '[]'::jsonb),
    'network', coalesce((
      select jsonb_agg(x)
      from (
        select p.id, p.full_name, p.current_package, p.current_rank, p.is_active, p.created_at
        from profiles p where p.referred_by_id = uid order by p.created_at desc limit 100
      ) x
    ), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;

revoke all on function public.get_my_bhrealtor_dashboard() from public;
grant execute on function public.get_my_bhrealtor_dashboard() to authenticated;