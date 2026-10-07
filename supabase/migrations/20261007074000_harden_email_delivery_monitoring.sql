alter table public.email_delivery_events
  add column if not exists retryable boolean not null default true,
  add column if not exists payload jsonb not null default '{}'::jsonb;

create index if not exists idx_email_delivery_events_retry
  on public.email_delivery_events(status, updated_at)
  where status in ('queued', 'failed') and retryable = true;

alter table public.email_delivery_events enable row level security;

revoke all on public.email_delivery_events from anon;
grant select on public.email_delivery_events to authenticated;
grant all on public.email_delivery_events to service_role;

drop policy if exists "Admins can view email delivery events" on public.email_delivery_events;
create policy "Admins can view email delivery events"
  on public.email_delivery_events
  for select
  to authenticated
  using ((select public.admin_has_permission('admin:view_email_center')));
