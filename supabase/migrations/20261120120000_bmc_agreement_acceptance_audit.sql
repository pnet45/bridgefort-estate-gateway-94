-- BMC partner agreement acceptance audit. This is intentionally separate from
-- profiles.terms_accepted, which is used by the general profile completion flow.
-- Acceptance is captured from signup metadata by a trusted auth.users trigger;
-- authenticated clients cannot insert, update, or delete these records.

create table if not exists public.bmc_agreement_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agreement_version text not null,
  agreement_name text not null,
  accepted_at timestamptz not null default now(),
  acceptance_source text not null default 'web_signup',
  marketing_consent boolean not null default false,
  privacy_notice_version text not null default '1.0',
  privacy_notice_acknowledged boolean not null default false,
  created_at timestamptz not null default now(),
  constraint bmc_agreement_acceptances_version_nonempty check (length(trim(agreement_version)) > 0)
);

create index if not exists bmc_agreement_acceptances_user_accepted_idx
  on public.bmc_agreement_acceptances(user_id, accepted_at desc);

alter table public.bmc_agreement_acceptances enable row level security;
revoke all on public.bmc_agreement_acceptances from anon, authenticated;
grant select on public.bmc_agreement_acceptances to authenticated;

drop policy if exists "BMCs can read their own agreement acceptance" on public.bmc_agreement_acceptances;
create policy "BMCs can read their own agreement acceptance"
  on public.bmc_agreement_acceptances
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "BMC approvers can verify agreement acceptance" on public.bmc_agreement_acceptances;
create policy "BMC approvers can verify agreement acceptance"
  on public.bmc_agreement_acceptances
  for select
  to authenticated
  using (
    public.user_has_permission((select auth.uid()), 'admin:view_approvals'::text)
    or public.user_has_permission((select auth.uid()), 'admin:all'::text)
  );

create or replace function public.capture_bmc_agreement_acceptance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  metadata jsonb;
begin
  metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  if metadata ->> 'bmc_agreement_accepted' = 'true'
     and metadata ->> 'bmc_privacy_acknowledged' = 'true' then
    insert into public.bmc_agreement_acceptances (
      user_id, agreement_version, agreement_name, accepted_at, acceptance_source, marketing_consent, privacy_notice_version, privacy_notice_acknowledged
    )
    values (
      new.id,
      coalesce(nullif(metadata ->> 'bmc_agreement_version', ''), '1.0'),
      coalesce(nullif(metadata ->> 'bmc_agreement_name', ''), 'BMC Partner Agreement'),
      now(),
      'web_signup',
      coalesce((metadata ->> 'bmc_marketing_consent')::boolean, false),
      coalesce(nullif(metadata ->> 'bmc_privacy_notice_version', ''), '1.0'),
      coalesce((metadata ->> 'bmc_privacy_acknowledged')::boolean, false)
    )
    on conflict do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.capture_bmc_agreement_acceptance() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_capture_bmc_agreement on auth.users;
create trigger on_auth_user_created_capture_bmc_agreement
  after insert on auth.users
  for each row execute function public.capture_bmc_agreement_acceptance();
