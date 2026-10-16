-- Idempotency ledger for automatic Contract of Sale delivery after final payment approval.
create table if not exists public.transaction_document_auto_send_claims (
  order_id uuid primary key references public.orders(id) on delete restrict,
  status text not null default 'processing' check (status in ('processing','sent','failed')),
  attempts integer not null default 1,
  last_error text null,
  updated_at timestamptz not null default now(),
  sent_at timestamptz null
);
alter table public.transaction_document_auto_send_claims enable row level security;
revoke all on public.transaction_document_auto_send_claims from anon, authenticated;
