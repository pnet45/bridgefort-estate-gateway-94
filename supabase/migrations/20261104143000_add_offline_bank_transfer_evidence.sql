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
