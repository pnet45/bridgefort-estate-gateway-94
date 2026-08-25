-- The signup fix below creates the real auth.users account (with the
-- password the person actually typed) at signup time, before approval.
-- This column links the pending request to that account so approval can
-- grant roles to the existing user instead of creating a second one.
alter table public.pending_admin_requests
  add column if not exists user_id uuid references auth.users(id) on delete cascade;
