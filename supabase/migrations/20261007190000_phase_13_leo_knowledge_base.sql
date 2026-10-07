-- Leo controlled business knowledge base
-- Phase 13: curated documents, audience/role metadata, review/expiry controls and server-side FTS.

create extension if not exists pg_trgm;

create table if not exists public.leo_knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  audience text not null default 'public'
    check (audience in ('public','staff','role_restricted')),
  allowed_roles text[] not null default '{}'::text[],
  content text not null,
  source_name text,
  source_url text,
  version integer not null default 1,
  status text not null default 'draft'
    check (status in ('draft','published','archived')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  review_date date,
  expiry_date date,
  last_reviewed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leo_knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.leo_knowledge_documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(content, ''))
  ) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(document_id, chunk_index)
);

create index if not exists leo_knowledge_documents_status_idx
  on public.leo_knowledge_documents(status, audience, expiry_date);
create index if not exists leo_knowledge_documents_review_idx
  on public.leo_knowledge_documents(review_date);
create index if not exists leo_knowledge_documents_allowed_roles_idx
  on public.leo_knowledge_documents using gin(allowed_roles);
create index if not exists leo_knowledge_chunks_search_idx
  on public.leo_knowledge_chunks using gin(search_vector);
create index if not exists leo_knowledge_chunks_document_idx
  on public.leo_knowledge_chunks(document_id);

alter table public.leo_knowledge_documents enable row level security;
alter table public.leo_knowledge_chunks enable row level security;

drop policy if exists "Leo knowledge is server managed" on public.leo_knowledge_documents;
drop policy if exists "Leo knowledge chunks are server managed" on public.leo_knowledge_chunks;

-- No anon/authenticated direct reads. The Edge Functions use service_role
-- and perform authorization before retrieval.
create policy "Leo knowledge is server managed"
  on public.leo_knowledge_documents for all
  to authenticated
  using (false)
  with check (false);

create policy "Leo knowledge chunks are server managed"
  on public.leo_knowledge_chunks for all
  to authenticated
  using (false)
  with check (false);

grant all on public.leo_knowledge_documents to service_role;
grant all on public.leo_knowledge_chunks to service_role;

create or replace function public.touch_leo_knowledge_document()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_leo_knowledge_document on public.leo_knowledge_documents;
create trigger trg_touch_leo_knowledge_document
before update on public.leo_knowledge_documents
for each row execute function public.touch_leo_knowledge_document();

-- Server-only search primitive. Callers must pass the already-verified role set.
-- The function itself still enforces audience/status/expiry, so retrieval cannot
-- accidentally return draft, archived or expired material.
create or replace function public.search_leo_knowledge(
  _query text,
  _audience text,
  _roles text[] default '{}'::text[],
  _limit integer default 8
)
returns table (
  chunk_id uuid,
  document_id uuid,
  title text,
  category text,
  audience text,
  source_name text,
  source_url text,
  version integer,
  review_date date,
  content text,
  rank real
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    d.id,
    d.title,
    d.category,
    d.audience,
    d.source_name,
    d.source_url,
    d.version,
    d.review_date,
    c.content,
    ts_rank_cd(c.search_vector, plainto_tsquery('english', coalesce(_query, ''))) as rank
  from public.leo_knowledge_chunks c
  join public.leo_knowledge_documents d on d.id = c.document_id
  where d.status = 'published'
    and (d.expiry_date is null or d.expiry_date >= current_date)
    and (d.audience = 'public'
      or (d.audience = 'staff' and _audience in ('staff','admin'))
      or (d.audience = 'role_restricted' and exists (
        select 1
        from unnest(coalesce(d.allowed_roles, '{}'::text[])) ar
        where ar = any(coalesce(_roles, '{}'::text[]))
      )))
    and (
      c.search_vector @@ plainto_tsquery('english', coalesce(_query, ''))
      or lower(c.content) like '%' || lower(trim(coalesce(_query, ''))) || '%'
      or lower(d.title) like '%' || lower(trim(coalesce(_query, ''))) || '%'
    )
  order by
    case when c.search_vector @@ plainto_tsquery('english', coalesce(_query, ''))
      then ts_rank_cd(c.search_vector, plainto_tsquery('english', coalesce(_query, '')))
      else 0 end desc,
    d.updated_at desc,
    c.chunk_index asc
  limit greatest(1, least(coalesce(_limit, 8), 20));
$$;

revoke all on function public.search_leo_knowledge(text,text,text[],integer) from public, anon, authenticated;
grant execute on function public.search_leo_knowledge(text,text,text[],integer) to service_role;

-- Initial approved public company guidance. Dynamic prices, availability,
-- private client records and secrets intentionally do not belong here.
insert into public.leo_knowledge_documents
  (slug,title,category,audience,content,source_name,status,review_date,approved_at,metadata)
values
(
  'bridgefort-company-profile',
  'Bridgefort Homes Development Ltd — Company Profile',
  'company',
  'public',
  'Bridgefort Homes Development Ltd is a real estate and property development company. Leo should identify the current company name as Bridgefort Homes Development Ltd and should not present the former PWAN Bridgefort company name as the current corporate identity. Bridgefort Homes values integrity, transparency, accountability, responsibility, ownership and service. Clients should be treated as part of the Bridgefort family. Leo should be helpful, conversational and professional, using simple English and avoiding aggressive sales language. Current public website: www.bridgeforthomes.com. Public contact emails include info@bridgeforthomes.com and sales@bridgeforthomes.com. Data protection enquiries may be directed to dpo@bridgeforthomes.com. Office: Plot 117 W.O. Seriki Street, Eleganza Gardens Estate, VGC Bus Stop / Opp. VGC Estate, Lekki-Ajah, Lagos. Public phone contacts: +234 807 071 0688 and +234 803 062 4059. Leo must not expose credentials, secrets, private client records or internal-only procedures.',
  'Bridgefort Homes approved business information',
  'published',
  current_date,
  now(),
  '{"approved_scope":"public_identity_and_contact","seed":true}'::jsonb
),
(
  'leo-response-and-safety-guide',
  'Leo Public Response and Safety Guide',
  'ai-guidance',
  'public',
  'Leo is Bridgefort Homes Development Ltd AI Agent. Leo must be accurate, calm, respectful and conversational. Leo must not invent property prices, plot availability, titles, allocation status, development status, payment status, investment returns, discounts, approvals or other changing facts. If current information is not available in the approved context, Leo should say it cannot verify the detail and offer the appropriate Bridgefort contact or service workflow. Leo must not provide legal advice, financial guarantees or visa guarantees. Leo must not reveal another person''s personal, financial, account, CRM or private information. Leo should never claim that an action was completed unless the system confirms it. When a matter requires human review, Leo should clearly explain that it will be escalated or that the user should contact the appropriate team.',
  'Bridgefort Homes Leo operating guidance',
  'published',
  current_date,
  now(),
  '{"approved_scope":"public_ai_safety","seed":true}'::jsonb
),
(
  'bridgefort-services-overview',
  'Bridgefort Homes Services Overview',
  'services',
  'public',
  'Bridgefort Homes services and enquiry areas include property and estate land, site inspections, Agrovest, Travels and Tours, Wealth Seminars and consultations, and training programmes. Leo can help a visitor understand an approved service, collect an enquiry through the authorized workflow, direct the visitor to the appropriate page or team, and explain the next step. Leo should distinguish current programmes from past events and should not present historical training events or promotions as current unless the approved content says they are currently active.',
  'Bridgefort Homes public service information',
  'published',
  current_date,
  now(),
  '{"approved_scope":"service_overview","seed":true}'::jsonb
),
(
  'leo-escalation-guide',
  'Leo Escalation Guide',
  'support',
  'public',
  'Leo should recommend human assistance when information is unavailable or cannot be reliably verified; a client disputes an account or payment; payment reconciliation is required; a legal interpretation is requested; a confidential or restricted record is requested; another person''s information is requested; a title or documentation issue needs verification; a client reports an incorrect automated message; a refund or payment dispute requires review; management approval is required; or Leo is otherwise uncertain. A safe response is to explain what Leo can verify, state what it cannot verify, and direct the user to the appropriate Bridgefort Homes team.',
  'Bridgefort Homes customer-service safety guidance',
  'published',
  current_date,
  now(),
  '{"approved_scope":"public_escalation","seed":true}'::jsonb
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  audience = excluded.audience,
  content = excluded.content,
  source_name = excluded.source_name,
  status = excluded.status,
  review_date = excluded.review_date,
  approved_at = excluded.approved_at,
  metadata = excluded.metadata,
  version = public.leo_knowledge_documents.version + 1,
  updated_at = now();

-- Rebuild deterministic chunks for seeded documents.
delete from public.leo_knowledge_chunks
where document_id in (
  select id from public.leo_knowledge_documents where metadata->>'seed' = 'true'
);

insert into public.leo_knowledge_chunks(document_id,chunk_index,content,metadata)
select id, 0, content, jsonb_build_object('source','seed','chunking','single')
from public.leo_knowledge_documents
where metadata->>'seed' = 'true';
