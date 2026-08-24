-- payment_requests does not have order_id; resolve the order by its payment reference.
create or replace function public.get_admin_payment_request_details(_request_id uuid)
returns jsonb
language plpgsql security definer set search_path=public
as $$
declare r jsonb; uid uuid:=auth.uid();
begin
  if uid is null then raise exception using errcode='42501',message='Authentication required'; end if;
  if not (public.has_permission(uid,'admin:approve_payments') or public.has_permission(uid,'admin:all')) then
    raise exception using errcode='42501',message='Not authorized to view payment approval details';
  end if;
  select jsonb_build_object(
    'payment_request',to_jsonb(pr),
    'payment',case when p.id is null then null else to_jsonb(p) end,
    'order',case when o.id is null then null else to_jsonb(o) end,
    'customer',case when prof.id is null then null else jsonb_build_object('id',prof.id,'name',concat_ws(' ',prof.first_name,prof.last_name),'email',prof.email,'phone',prof.phone) end,
    'items',coalesce(o.items,'[]'::jsonb),
    'history',coalesce((select jsonb_agg(jsonb_build_object('id',pt.id,'amount',pt.amount,'status',pt.status,'reference',pt.reference,'gateway',pt.gateway,'payment_date',pt.payment_date) order by pt.payment_date desc) from payment_transactions pt where pt.payment_request_id=pr.id),'[]'::jsonb)
  ) into r
  from payment_requests pr
  left join payments p on p.id=pr.related_payment_id
  left join orders o on o.payment_reference=pr.reference
  left join profiles prof on prof.id=coalesce(pr.user_id,p.user_id,o.user_id)
  where pr.id=_request_id;
  if r is null then raise exception using errcode='P0002',message='Payment request not found'; end if;
  return r;
end;
$$;
revoke all on function public.get_admin_payment_request_details(uuid) from public;
grant execute on function public.get_admin_payment_request_details(uuid) to authenticated;
