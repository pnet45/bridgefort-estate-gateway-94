-- BHRealtors referral integrity and private sales read model.
-- This SQL was applied to production during the BHRealtors/profile fix and is kept
-- here as the repeatable repository definition for future migration reconciliation.

create unique index if not exists profiles_pbo_referral_code_unique
  on public.profiles (lower(trim(pbo_referral_code)))
  where nullif(trim(pbo_referral_code),'') is not null;

create or replace function public.lookup_bhrealtor_referral(_code text)
returns table (realtor_id uuid, first_name text, last_initial text, package text)
language sql stable security definer set search_path=''
as $$
  select p.id, coalesce(p.first_name,''), case when nullif(trim(p.last_name),'') is null then '' else left(trim(p.last_name),1) end, coalesce(p.current_package,'associate')
  from public.profiles p
  where lower(trim(p.pbo_referral_code)) = lower(trim(_code))
    and coalesce(p.is_pbo,false)=true and coalesce(p.is_active,false)=true
  limit 1
$$;

revoke all on function public.lookup_bhrealtor_referral(text) from public, anon;
grant execute on function public.lookup_bhrealtor_referral(text) to authenticated;

create or replace function public.get_my_bhrealtor_sales()
returns table (sale_id uuid, client_first_name text, plot_id text, plots_bought integer, estate_name text, payment_status text, amount_paid numeric, balance numeric, sale_date timestamptz)
language sql stable security definer set search_path=''
as $$
  select mp.order_id, coalesce(client.first_name,split_part(coalesce(o.customer_name,''),' ',1)), mp.plot_id,
    greatest(coalesce(mp.quantity,1),1)::integer, coalesce(es.estate_name,mp.property_name,'Property'),
    coalesce(mp.payment_status,o.payment_status,es.subscription_status,'Pending'),
    coalesce(mp.amount_paid,o.amount_paid,0), greatest(coalesce(mp.balance,o.balance,0),0),
    coalesce(es.subscribed_at,mp.created_at,o.created_at)
  from public.profiles realtor
  join public.profiles client on client.referred_by_id=realtor.id
  join public.my_properties mp on mp.user_id=client.id
  left join public.orders o on o.id=mp.order_id
  left join public.estate_subscriptions es on es.order_id=mp.order_id and es.user_id=client.id
  where realtor.id=(select auth.uid()) and coalesce(realtor.is_pbo,false) and coalesce(realtor.is_active,false)
  order by coalesce(es.subscribed_at,mp.created_at,o.created_at) desc nulls last limit 200
$$;

revoke all on function public.get_my_bhrealtor_sales() from public, anon;
grant execute on function public.get_my_bhrealtor_sales() to authenticated;