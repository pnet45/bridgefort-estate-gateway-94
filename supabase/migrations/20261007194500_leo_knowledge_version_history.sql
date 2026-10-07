-- Leo knowledge versioning and audit history
alter table public.leo_knowledge_documents add column if not exists version integer not null default 1;

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
 unique(document_id,version)
);
alter table public.leo_knowledge_versions enable row level security;
revoke all on public.leo_knowledge_versions from anon,authenticated;
grant all on public.leo_knowledge_versions to service_role;
create index if not exists leo_knowledge_versions_document_idx on public.leo_knowledge_versions(document_id,version desc);

create or replace function public.increment_leo_knowledge_version()
returns trigger language plpgsql set search_path=public as $$
begin
 if row(new.content,new.title,new.audience,new.allowed_roles,new.source_url,new.topics) is distinct from
    row(old.content,old.title,old.audience,old.allowed_roles,old.source_url,old.topics)
 then new.version=old.version+1; end if; return new;
end; $$;
drop trigger if exists trg_leo_knowledge_increment_version on public.leo_knowledge_documents;
create trigger trg_leo_knowledge_increment_version before update on public.leo_knowledge_documents for each row execute function public.increment_leo_knowledge_version();

create or replace function public.snapshot_leo_knowledge_version()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.leo_knowledge_versions(document_id,version,title,content,audience,allowed_roles,source_url,topics,status,change_type,change_summary,changed_by)
 values(new.id,new.version,new.title,new.content,new.audience,new.allowed_roles,new.source_url,new.topics,new.status,
   case when tg_op='INSERT' then 'create' when new.status<>old.status then 'status_change' else 'update' end,
   case when tg_op='INSERT' then 'Initial knowledge version' else 'Knowledge updated; previous version retained for audit/history' end,
   coalesce(new.updated_by,new.created_by));
 return new;
end; $$;
drop trigger if exists trg_leo_knowledge_version_snapshot on public.leo_knowledge_documents;
create trigger trg_leo_knowledge_version_snapshot after insert or update on public.leo_knowledge_documents for each row execute function public.snapshot_leo_knowledge_version();

insert into public.leo_knowledge_versions(document_id,version,title,content,audience,allowed_roles,source_url,topics,status,change_type,change_summary,changed_by)
select d.id,d.version,d.title,d.content,d.audience,d.allowed_roles,d.source_url,d.topics,d.status,'baseline','Version history initialized',d.updated_by
from public.leo_knowledge_documents d
where not exists(select 1 from public.leo_knowledge_versions v where v.document_id=d.id);

insert into public.leo_knowledge_chunks(document_id,chunk_index,heading,content)
select d.id,0,d.title,d.content
from public.leo_knowledge_documents d
where d.title in ('Bridgefort Homes Privacy Policy','Bridgefort Homes Data Protection Policy Statement','Bridgefort Homes Terms of Service','Bridgefort Homes Sitemap & Navigation')
and not exists(select 1 from public.leo_knowledge_chunks c where c.document_id=d.id);