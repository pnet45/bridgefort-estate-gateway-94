create or replace function public.get_my_bhrealtor_network_tree(_limit integer default 200)
returns jsonb language sql security definer set search_path=public as $$
 select coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',trim(concat_ws(' ',p.first_name,p.last_name)),'package',p.current_package,'rank',p.current_rank,'is_active',p.is_active,'joined_at',p.created_at) order by p.created_at desc) from public.profiles p where p.referred_by_id=auth.uid() limit least(greatest(coalesce(_limit,200),1),500)),'[]'::jsonb);
$$;
revoke all on function public.get_my_bhrealtor_network_tree(integer) from public; grant execute on function public.get_my_bhrealtor_network_tree(integer) to authenticated;
create or replace function public.get_my_bhrealtor_commission_history(_limit integer default 100)
returns jsonb language sql security definer set search_path=public as $$
 select coalesce((select jsonb_agg(x order by x.created_at desc) from (select id,commission_amount,status,commission_source,sponsor_level,commission_rate,created_at,source_order_id,source_purchase_id,source_property_sale_id from public.mlm_commissions where beneficiary_id=auth.uid() order by created_at desc limit least(greatest(coalesce(_limit,100),1),500)) x),'[]'::jsonb);
$$;
revoke all on function public.get_my_bhrealtor_commission_history(integer) from public; grant execute on function public.get_my_bhrealtor_commission_history(integer) to authenticated;
create or replace function public.get_my_bhrealtor_withdrawals(_limit integer default 50)
returns jsonb language sql security definer set search_path=public as $$
 select coalesce((select jsonb_agg(x order by x.created_at desc) from (select id,amount,status,created_at from public.withdrawal_requests where user_id=auth.uid() order by created_at desc limit least(greatest(coalesce(_limit,50),1),200)) x),'[]'::jsonb);
$$;
revoke all on function public.get_my_bhrealtor_withdrawals(integer) from public; grant execute on function public.get_my_bhrealtor_withdrawals(integer) to authenticated;
