create table if not exists public.email_delivery_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'resend',
  provider_event_id text not null,
  event_type text not null,
  provider_message_id text,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz not null default now(),
  constraint uq_email_delivery_webhook_provider_event unique (provider, provider_event_id)
);

create index if not exists idx_email_delivery_webhook_message
  on public.email_delivery_webhook_events(provider_message_id);
create index if not exists idx_email_delivery_webhook_type
  on public.email_delivery_webhook_events(event_type);
create index if not exists idx_email_delivery_webhook_received
  on public.email_delivery_webhook_events(received_at desc);

alter table public.email_delivery_webhook_events enable row level security;
revoke all on public.email_delivery_webhook_events from anon;
revoke all on public.email_delivery_webhook_events from authenticated;
grant all on public.email_delivery_webhook_events to service_role;

alter table public.email_delivery_events
  add column if not exists last_provider_event_type text,
  add column if not exists delivered_at timestamptz,
  add column if not exists delayed_at timestamptz,
  add column if not exists bounced_at timestamptz,
  add column if not exists complained_at timestamptz,
  add column if not exists opened_at timestamptz,
  add column if not exists clicked_at timestamptz;

create index if not exists idx_email_delivery_events_provider_message
  on public.email_delivery_events(provider_message_id)
  where provider_message_id is not null;
