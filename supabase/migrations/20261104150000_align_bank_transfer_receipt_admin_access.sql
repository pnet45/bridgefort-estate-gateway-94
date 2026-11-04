-- Align bank-transfer receipt access and admin detail lookup with the
-- canonical financial-approval RBAC helper and the deployed order schema.

drop policy if exists "Customers and payment admins read bank transfer receipts"
  on storage.objects;

create policy "Customers and payment admins read bank transfer receipts"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'bank-transfer-receipts'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.can_approve_financial_requests(auth.uid())
  )
);

create or replace function public.get_admin_payment_request_details(_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r jsonb;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if not public.can_approve_financial_requests(uid) then
    raise exception using errcode = '42501',
      message = 'Not authorized to view payment approval details';
  end if;

  select jsonb_build_object(
    'payment_request', to_jsonb(pr),
    'payment', case when p.id is null then null else to_jsonb(p) end,
    'order', case when o.id is null then null else to_jsonb(o) end,
    'customer', case when prof.id is null and o.id is null then null else
      jsonb_build_object(
        'id', coalesce(prof.id, o.user_id),
        'name', coalesce(
          nullif(concat_ws(' ', prof.first_name, prof.last_name), ''),
          o.customer_name
        ),
        'email', o.customer_email,
        'phone', prof.phone_number
      )
    end,
    'items', coalesce(o.items, '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', pt.id,
          'amount', pt.amount,
          'status', null,
          'reference', null,
          'gateway', pt.channel,
          'payment_date', pt.payment_date,
          'notes', pt.notes
        )
        order by pt.payment_date desc
      )
      from public.payment_transactions pt
      where pt.payment_id = p.id
    ), '[]'::jsonb)
  )
  into r
  from public.payment_requests pr
  left join public.payments p
    on p.id = pr.related_payment_id
  left join public.orders o
    on o.id = coalesce(
      pr.order_id,
      (
        select ord.id
        from public.orders ord
        where ord.payment_reference = pr.reference
        order by ord.created_at desc
        limit 1
      )
    )
  left join public.profiles prof
    on prof.id = coalesce(pr.user_id, p.user_id, o.user_id)
  where pr.id = _request_id;

  if r is null then
    raise exception using errcode = 'P0002', message = 'Payment request not found';
  end if;

  return r;
end;
$$;

revoke all on function public.get_admin_payment_request_details(uuid) from public;
grant execute on function public.get_admin_payment_request_details(uuid) to authenticated;
