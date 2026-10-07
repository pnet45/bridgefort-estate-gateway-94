create table if not exists public.leo_conversations (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  actor_type text not null check (actor_type in ('customer', 'realtor', 'admin')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leo_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.leo_conversations(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (length(content) <= 6000),
  created_at timestamptz not null default now()
);

create index if not exists leo_conversations_owner_updated_idx
  on public.leo_conversations (owner_id, updated_at desc);
create index if not exists leo_messages_conversation_created_idx
  on public.leo_messages (conversation_id, created_at);

alter table public.leo_conversations enable row level security;
alter table public.leo_messages enable row level security;

revoke all on public.leo_conversations, public.leo_messages from anon, authenticated;
grant all on public.leo_conversations, public.leo_messages to service_role;
