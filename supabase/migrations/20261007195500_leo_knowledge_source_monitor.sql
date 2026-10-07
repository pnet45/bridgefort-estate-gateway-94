-- Leo official-source monitoring metadata and review state
create table if not exists public.leo_knowledge_source_sync (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null unique references public.leo_knowledge_documents(id) on delete cascade,
  source_url text not null unique,
  last_checked_at timestamptz,
  source_hash text,
  pending_hash text,
  pending_content text,
  pending_title text,
  pending_detected_at timestamptz,
  status text not null default 'never_checked'
    check (status in ('never_checked','clean','pending_review','error')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leo_knowledge_source_sync enable row level security;
revoke all on public.leo_knowledge_source_sync from anon, authenticated;
grant all on public.leo_knowledge_source_sync to service_role;

create index if not exists idx_leo_source_sync_status
  on public.leo_knowledge_source_sync(status);

insert into public.leo_knowledge_source_sync (document_id, source_url)
select id, source_url
from public.leo_knowledge_documents
where source_url in (
  'https://www.bridgeforthomes.com/privacy-policy',
  'https://www.bridgeforthomes.com/NDPP',
  'https://www.bridgeforthomes.com/terms-of-service',
  'https://www.bridgeforthomes.com/sitemap'
)
on conflict (document_id) do nothing;
