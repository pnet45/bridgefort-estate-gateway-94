create or replace function public.get_my_bhrealtor_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare r jsonb; uid uuid := auth.uid();
begin
 if uid is null then raise exception using errcode='42501', message='Authentication required'; end if;
 select jsonb_build_object(
  'profile', (select jsonb_build_object('is_pbo',p.is_pbo,'is_active',p.is_active,'package',p.current_package,'rank',p.current_rank,'referral_code',p.pbo_referral_code,'wallet_balance',coalesce(p.wallet_balance,0),'total_commissions',coalesce(p.total_commissions,0)) from profiles p where p.id=uid),
  'direct_referrals', (select count(*) from profiles p where p.referred_by_id=uid),
  'active_direct_referrals', (select count(*) from profiles p where p.referred_by_id=uid and p.is_pbo=true and p.is_active=true),
  'commissions', coalesce((select jsonb_agg(x order by x.created_at desc) from (select id,commission_amount,status,commission_type,referral_level,created_at,source_order_id,source_purchase_id,source_property_sale_id from mlm_commissions where beneficiary_id=uid order by created_at desc limit 100) x),'[]'::jsonb),
  'withdrawals', coalesce((select jsonb_agg(x order by x.created_at desc) from (select id,amount,status,created_at from withdrawal_requests where user_id=uid order by created_at desc limit 20) x),'[]'::jsonb),
  'network', coalesce((select jsonb_agg(x) from (select p.id,p.full_name,p.current_package,p.current_rank,p.is_active,p.created_at from profiles p where p.referred_by_id=uid order by p.created_at desc limit 100) x),'[]'::jsonb)
 ) into r; return r;
end; $$;
revoke all on function public.get_my_bhrealtor_dashboard() from public;
grant execute on function public.get_my_bhrealtor_dashboard() to authenticated;
