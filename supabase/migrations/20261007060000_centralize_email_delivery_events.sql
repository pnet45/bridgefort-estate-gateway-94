-- Central email delivery ledger.
-- Applied directly to production on 2026-10-07 after the migration tool was blocked.
-- This migration is intentionally idempotent so local/CI reconciliation is safe.

create table if not exists public.email_delivery_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null,
  recipient_email text not null,
  recipient_user_id uuid,
  recipient_name text,
  subject text,
  provider text not null default 'resend',
  sender_email text,
  sender_name text,
  template_key text,
  source_function text,
  source_reference text,
  status text not null default 'queued',
  attempt_count integer not null default 0,
  provider_message_id text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  queued_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_email_delivery_events_recipient
  on public.email_delivery_events(recipient_email);
create index if not exists idx_email_delivery_events_event_key
  on public.email_delivery_events(event_key);
create index if not exists idx_email_delivery_events_status
  on public.email_delivery_events(status);

alter table public.email_delivery_events enable row level security;
