-- Phase 12: complete Admin Subscribers directory data contract.
-- Adds contact, referral and payment-reference fields required by the admin directory UI.

drop function if exists public.admin_get_estate_subscribers(text,text);
drop function if exists private.admin_get_estate_subscribers(text,text);

create function private.admin_get_estate_subscribers(
  _search text default null,
  _estate_code text default null
)
returns table(
  subscription_number text, subscriber_name text, estate_name text, estate_code text,
  client_id uuid, order_id uuid, subscription_status text, payment_plan text,
  subscription_amount numeric, subscribed_at timestamptz, client_email text,
  phone_number text, plot_count integer, order_total numeric, amount_paid numeric,
  outstanding_balance numeric, pbo_referral_code text, order_payment_status text,
  payment_reference text
)
language plpgsql security definer set search_path=public
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not (public.user_has_permission(auth.uid(),'admin:view_subscribers')
      or public.user_has_permission(auth.uid(),'admin:all')) then
    raise exception 'Admin access required';
  end if;

  return query
  select es.subscription_number,
    coalesce(nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),p.full_name,o.customer_name,'Unnamed Subscriber')::text,
    es.estate_name, es.estate_code, es.user_id, es.order_id, es.subscription_status,
    es.payment_plan, es.amount, es.subscribed_at,
    coalesce(nullif(p.email,''),nullif(o.customer_email,''),u.email)::text,
    nullif(p.phone_number,'')::text,
    greatest(1,coalesce((select sum(case when jsonb_typeof(x->'quantity')='number'
      then greatest(coalesce((x->>'quantity')::integer,1),1) else 1 end)
      from jsonb_array_elements(coalesce(o.items,'[]'::jsonb)) x),1))::integer,
    coalesce(o.total_amount,es.amount,0), coalesce(o.amount_paid,0),
    greatest(coalesce(o.balance,coalesce(o.total_amount,es.amount,0)-coalesce(o.amount_paid,0)),0),
    nullif(p.pbo_referral_code,''), o.payment_status, o.payment_reference
  from public.estate_subscriptions es
  left join public.orders o on o.id=es.order_id
  left join public.profiles p on p.id=es.user_id
  left join auth.users u on u.id=es.user_id
  where (_search is null or trim(_search)='' or
    es.subscription_number ilike '%'||trim(_search)||'%' or
    es.estate_name ilike '%'||trim(_search)||'%' or
    coalesce(p.email,o.customer_email,u.email) ilike '%'||trim(_search)||'%' or
    coalesce(p.phone_number,'') ilike '%'||trim(_search)||'%' or
    coalesce(p.pbo_referral_code,'') ilike '%'||trim(_search)||'%' or
    coalesce(p.full_name,trim(concat_ws(' ',p.first_name,p.last_name)),o.customer_name)
      ilike '%'||trim(_search)||'%')
    and (_estate_code is null or trim(_estate_code)='' or upper(es.estate_code)=upper(trim(_estate_code)))
  order by es.created_at desc;
end;
$$;

create function public.admin_get_estate_subscribers(
  _search text default null, _estate_code text default null
)
returns table(
  subscription_number text, subscriber_name text, estate_name text, estate_code text,
  client_id uuid, order_id uuid, subscription_status text, payment_plan text,
  subscription_amount numeric, subscribed_at timestamptz, client_email text,
  phone_number text, plot_count integer, order_total numeric, amount_paid numeric,
  outstanding_balance numeric, pbo_referral_code text, order_payment_status text,
  payment_reference text
)
language sql stable set search_path=public
as $$ select * from private.admin_get_estate_subscribers($1,$2); $$;

revoke all on function public.admin_get_estate_subscribers(text,text) from public,anon;
grant execute on function public.admin_get_estate_subscribers(text,text) to authenticated,service_role;
revoke all on function private.admin_get_estate_subscribers(text,text) from public,anon;
grant execute on function private.admin_get_estate_subscribers(text,text) to authenticated,service_role;