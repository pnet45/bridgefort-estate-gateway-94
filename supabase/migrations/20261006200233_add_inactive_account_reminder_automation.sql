create table if not exists public.inactive_account_reminders (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  last_login_at timestamptz,
  last_sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  resend_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.inactive_account_reminders enable row level security;