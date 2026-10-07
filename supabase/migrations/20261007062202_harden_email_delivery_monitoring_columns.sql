alter table public.email_delivery_events
  add column if not exists retryable boolean not null default true,
  add column if not exists payload jsonb not null default '{}'::jsonb;

create index if not exists idx_email_delivery_events_retry
  on public.email_delivery_events(status, updated_at)
  where status in ('queued', 'failed') and retryable = true;
