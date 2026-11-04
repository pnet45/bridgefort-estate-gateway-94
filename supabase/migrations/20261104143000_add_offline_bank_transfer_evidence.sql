-- Offline bank transfer evidence: additive schema only.
alter table public.payment_requests
  add column if not exists order_id uuid references public.orders(id),
  add column if not exists receipt_path text,
  add column if not exists transfer_date date,
  add column if not exists transfer_reference text;

create index if not exists payment_requests_order_status_idx
  on public.payment_requests(order_id, status);

create unique index if not exists payment_requests_transfer_reference_uidx
  on public.payment_requests(transfer_reference)
  where transfer_reference is not null and transfer_reference <> '';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bank-transfer-receipts', 'bank-transfer-receipts', false, 5242880,
        array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf'];

drop policy if exists "Customers upload own bank transfer receipts" on storage.objects;
create policy "Customers upload own bank transfer receipts"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'bank-transfer-receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Customers and payment admins read bank transfer receipts" on storage.objects;
create policy "Customers and payment admins read bank transfer receipts"
on storage.objects for select to authenticated
using (
  bucket_id = 'bank-transfer-receipts'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.user_has_permission(auth.uid(), 'admin:approve_payments')
    or public.user_has_permission(auth.uid(), 'admin:all')
  )
);

create or replace function public.get_admin_payment_request_details(_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  r jsonb;
  uid uuid := auth.uid();
  pr public.payment_requests;
  resolved_order public.orders;
begin
  if uid is null then
    raise exception using errcode='42501', message='Authentication required';
  end if;
  if not (
    public.user_has_permission(uid, 'admin:approve_payments')
    or public.user_has_permission(uid, 'admin:all')
  ) then
    raise exception using errcode='42501', message='Not authorized to view payment approval details';
  end if;

  select * into pr from public.payment_requests where id = _request_id;
  if pr.id is null then
    raise exception using errcode='P0002', message='Payment request not found';
  end if;

  select (public.resolve_payment_order(_request_id)).* into resolved_order;

  select jsonb_build_object(
    'payment_request', to_jsonb(pr),
    'payment', case when p.id is null then null else to_jsonb(p) end,
    'order', case when resolved_order.id is null then null else to_jsonb(resolved_order) end,
    'customer', case when prof.id is null then null else
      jsonb_build_object('id',prof.id,'name',concat_ws(' ',prof.first_name,prof.last_name),
                         'email',prof.email,'phone',prof.phone) end,
    'items', coalesce(resolved_order.items,'[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(jsonb_build_object('id',pt.id,'amount',pt.amount,'status',pt.status,
        'reference',pt.reference,'gateway',pt.gateway,'payment_date',pt.payment_date)
        order by pt.payment_date desc)
      from public.payment_transactions pt where pt.payment_request_id=pr.id
    ),'[]'::jsonb)
  ) into r
  from (select 1) seed
  left join public.payments p on p.id=pr.related_payment_id
  left join public.profiles prof on prof.id=coalesce(pr.user_id,p.user_id,resolved_order.user_id);

  return r;
end;
$$;

revoke all on function public.get_admin_payment_request_details(uuid) from public;
grant execute on function public.get_admin_payment_request_details(uuid) to authenticated;

-- Atomic, service-role-only submission prevents concurrent requests from
-- exceeding an order's outstanding balance.
create or replace function public.submit_bank_transfer_request(
  _user_id uuid,
  _order_id uuid,
  _amount numeric,
  _transfer_date date,
  _transfer_reference text,
  _receipt_path text
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  o public.orders;
  payment_plan_id uuid;
  outstanding numeric;
  already_pending numeric;
  request_row public.payment_requests;
begin
  if coalesce(auth.role(),'') <> 'service_role' then
    raise exception using errcode='42501', message='Service role required';
  end if;
  if _user_id is null or _order_id is null or _amount is null or _amount <= 0 then
    raise exception using errcode='22023', message='Invalid payment submission';
  end if;
  if length(trim(coalesce(_transfer_reference,''))) < 3 then
    raise exception using errcode='22023', message='Transfer reference is required';
  end if;
  if _receipt_path not like _user_id::text || '/' || _order_id::text || '/%' then
    raise exception using errcode='22023', message='Invalid receipt path';
  end if;

  select * into o from public.orders
  where id=_order_id and user_id=_user_id
  for update;
  if o.id is null then
    raise exception using errcode='P0002', message='Order not found for this customer';
  end if;
  if lower(coalesce(o.payment_status,'')) in ('paid','cancelled','rejected') then
    raise exception using errcode='55000', message='Order is not accepting payments';
  end if;

  select id into payment_plan_id from public.payments
  where reference=o.payment_reference limit 1;
  if payment_plan_id is null then
    raise exception using errcode='55000', message='Order payment plan could not be resolved';
  end if;

  outstanding := greatest(0,coalesce(o.total_amount,0)-coalesce(o.amount_paid,0));
  select coalesce(sum(amount),0) into already_pending
  from public.payment_requests
  where related_payment_id=payment_plan_id and status='pending';
  if _amount > greatest(0,outstanding-already_pending)+0.01 then
    raise exception using errcode='22023', message='Transfer amount exceeds the available order balance';
  end if;

  insert into public.payment_requests(
    user_id,type,amount,reference,transfer_reference,transfer_date,
    receipt_path,order_id,related_payment_id,description,status
  ) values (
    _user_id,'property',_amount,_transfer_reference,_transfer_reference,_transfer_date,
    _receipt_path,_order_id,payment_plan_id,
    'Property payment via Bank Transfer — Order ' || _order_id::text,'pending'
  )
  returning * into request_row;

  return jsonb_build_object(
    'request_id',request_row.id,
    'status',request_row.status,
    'amount',request_row.amount,
    'created_at',request_row.created_at
  );
end;
$$;

revoke all on function public.submit_bank_transfer_request(uuid,uuid,numeric,date,text,text) from public, anon, authenticated;
grant execute on function public.submit_bank_transfer_request(uuid,uuid,numeric,date,text,text) to service_role;
