create table if not exists public.payment_gateway_events (
  id uuid primary key default gen_random_uuid(),
  gateway text not null check (gateway in ('Paystack','Stripe','Manual')),
  reference text not null,
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete restrict,
  amount numeric not null check (amount > 0),
  currency text not null default 'NGN',
  status text not null check (status in ('success','failed','amount_mismatch','pending')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (gateway, reference)
);

create index if not exists payment_gateway_events_user_idx on public.payment_gateway_events(user_id, created_at desc);
create index if not exists payment_gateway_events_order_idx on public.payment_gateway_events(order_id, created_at desc);

alter table public.payment_gateway_events enable row level security;

create policy "Users can view their own gateway payment history"
on public.payment_gateway_events for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can view gateway payment history"
on public.payment_gateway_events for select
to authenticated
using (public.is_global_admin(auth.uid()) or public.has_role(auth.uid(), 'admin_dir') or public.has_role(auth.uid(), 'admin_acct'));

revoke insert, update, delete on public.payment_gateway_events from authenticated, anon;
