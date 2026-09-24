create or replace function public.create_authoritative_property_order_snapshot(_order_id uuid, _listing_id uuid, _payment_plan text default 'outright', _quantity integer default 1)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.listings%rowtype;
  v_order public.orders%rowtype;
  v_total numeric;
begin
  if auth.uid() is null then raise exception using errcode='42501', message='Authentication required'; end if;
  if _quantity < 1 then raise exception 'Quantity must be at least 1'; end if;
  select * into v_listing from public.listings where id=_listing_id and is_published=true and moderation_status='approved';
  if not found then raise exception 'Property is not available for purchase'; end if;
  v_total := coalesce(v_listing.price_amount,0) * _quantity;
  if v_total <= 0 then raise exception 'Property price is invalid'; end if;
  insert into public.orders(user_id, customer_email, customer_name, total_amount, payment_status, items)
  values (
    auth.uid(),
    (select email from auth.users where id=auth.uid()),
    (select coalesce(full_name, first_name || ' ' || last_name) from public.profiles where id=auth.uid()),
    v_total,
    'pending',
    jsonb_build_array(jsonb_build_object(
      'listing_id', v_listing.id,
      'estate', v_listing.estate,
      'property_title', v_listing.title,
      'property_type', v_listing.property_type,
      'region', v_listing.region,
      'city', v_listing.city,
      'address', v_listing.address,
      'quantity', _quantity,
      'unit_price', v_listing.price_amount,
      'currency', v_listing.price_currency,
      'payment_plan', _payment_plan,
      'price_source', 'admin_listing_price',
      'price_snapshot_at', now()
    ))
  ) returning * into v_order;
  return v_order;
end;
$$;

revoke all on function public.create_authoritative_property_order_snapshot(uuid,uuid,text,integer) from public;
grant execute on function public.create_authoritative_property_order_snapshot(uuid,uuid,text,integer) to authenticated;

create index if not exists idx_orders_payment_reference on public.orders(payment_reference);
create index if not exists idx_payment_gateway_events_order_id on public.payment_gateway_events(order_id);
create index if not exists idx_payment_transactions_user_date on public.payment_transactions(user_id,payment_date desc);
