-- Leo knowledge reconciliation after production migration 20261008041836.
-- Idempotent: preserves existing data/objects and aligns the controlled knowledge
-- schema, role-filtered search, version history, and source-monitor tables.
-- This migration intentionally does not repair or rewrite Supabase migration history.

alter table public.leo_knowledge_documents
  add column if not exists version integer not null default 1;

create table if not exists public.leo_knowledge_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.leo_knowledge_documents(id) on delete cascade,
  version integer not null,
  title text not null,
  content text not null,
  audience text not null,
  allowed_roles text[] not null default '{}',
  source_url text,
  topics text[] not null default '{}',
  status text not null,
  change_type text not null default 'update',
  change_summary text,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(document_id, version)
);

alter table public.leo_knowledge_versions enable row level security;
revoke all on public.leo_knowledge_versions from anon, authenticated;
grant all on public.leo_knowledge_versions to service_role;

create index if not exists leo_knowledge_versions_document_idx
  on public.leo_knowledge_versions(document_id, version desc);

create or replace function public.increment_leo_knowledge_version()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  if row(new.content,new.title,new.audience,new.allowed_roles,new.source_url,new.topics) is distinct from
     row(old.content,old.title,old.audience,old.allowed_roles,old.source_url,old.topics)
  then
    new.version=old.version+1;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_leo_knowledge_increment_version on public.leo_knowledge_documents;
create trigger trg_leo_knowledge_increment_version
before update on public.leo_knowledge_documents
for each row execute function public.increment_leo_knowledge_version();

create or replace function public.snapshot_leo_knowledge_version()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into public.leo_knowledge_versions(
    document_id,version,title,content,audience,allowed_roles,source_url,topics,
    status,change_type,change_summary,changed_by
  )
  values(
    new.id,new.version,new.title,new.content,new.audience,new.allowed_roles,new.source_url,new.topics,
    new.status,
    case when tg_op='INSERT' then 'create'
         when new.status<>old.status then 'status_change'
         else 'update' end,
    case when tg_op='INSERT' then 'Initial knowledge version'
         else 'Knowledge updated; previous version retained for audit/history' end,
    coalesce(new.updated_by,new.created_by)
  );
  return new;
end;
$$;

drop trigger if exists trg_leo_knowledge_version_snapshot on public.leo_knowledge_documents;
create trigger trg_leo_knowledge_version_snapshot
after insert or update on public.leo_knowledge_documents
for each row execute function public.snapshot_leo_knowledge_version();

insert into public.leo_knowledge_versions(
  document_id,version,title,content,audience,allowed_roles,source_url,topics,
  status,change_type,change_summary,changed_by
)
select d.id,d.version,d.title,d.content,d.audience,d.allowed_roles,d.source_url,d.topics,
       d.status,'baseline','Version history initialized',d.updated_by
from public.leo_knowledge_documents d
where not exists (
  select 1 from public.leo_knowledge_versions v
  where v.document_id=d.id and v.version=d.version
);

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

insert into public.leo_knowledge_source_sync(document_id,source_url)
select id,source_url
from public.leo_knowledge_documents
where source_url in (
  'https://www.bridgeforthomes.com/privacy-policy',
  'https://www.bridgeforthomes.com/NDPP',
  'https://www.bridgeforthomes.com/terms-of-service',
  'https://www.bridgeforthomes.com/sitemap'
)
on conflict (document_id) do nothing;

create or replace function public.search_leo_knowledge_v2(
  p_query text,
  p_allowed_audiences text[] default array['public']::text[],
  p_roles text[] default array['customer']::text[],
  p_limit integer default 6
)
returns table(
  id uuid,
  document_id uuid,
  title text,
  source_url text,
  audience text,
  topics text[],
  heading text,
  content text,
  rank real
)
language sql
security definer
set search_path=public
as $$
  with q as (
    select websearch_to_tsquery(
      'simple',
      regexp_replace(trim(coalesce(p_query,'')), '\\s+', ' OR ', 'g')
    ) as query
  )
  select
    c.id,c.document_id,d.title,d.source_url,d.audience,d.topics,c.heading,c.content,
    ts_rank_cd(c.search_vector,q.query) as rank
  from public.leo_knowledge_chunks c
  join public.leo_knowledge_documents d on d.id=c.document_id
  cross join q
  where d.status='published'
    and d.audience = any(p_allowed_audiences)
    and (
      d.audience='public'
      or (d.audience='staff' and 'admin' = any(coalesce(p_roles,'{}'::text[])))
      or (
        d.audience='restricted'
        and exists (
          select 1
          from unnest(coalesce(d.allowed_roles,'{}'::text[])) allowed_role
          where allowed_role = any(coalesce(p_roles,'{}'::text[]))
        )
      )
    )
    and (
      d.metadata->>'expires_at' is null
      or (d.metadata->>'expires_at')::timestamptz >= now()
    )
    and (
      d.metadata->>'review_date' is null
      or (d.metadata->>'review_date')::date <= current_date
    )
    and q.query is not null
    and c.search_vector @@ q.query
  order by rank desc,d.updated_at desc,c.chunk_index
  limit greatest(1,least(coalesce(p_limit,6),12));
$$;

revoke all on function public.search_leo_knowledge_v2(text,text[],text[],integer) from public,anon,authenticated;
grant execute on function public.search_leo_knowledge_v2(text,text[],text[],integer) to service_role;

revoke execute on function public.snapshot_leo_knowledge_version() from public,anon,authenticated;
grant execute on function public.snapshot_leo_knowledge_version() to service_role;
