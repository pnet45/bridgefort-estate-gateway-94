create table if not exists public.admin_menu_visibility (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tab_key text not null,
  is_visible boolean not null default true,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  constraint admin_menu_visibility_user_tab_unique unique (user_id, tab_key),
  constraint admin_menu_visibility_tab_key_check check (tab_key in (
    'overview','properties','allocations','crm','users','approvals','subscribers','emails','analytics',
    'mlm-funnel','activity','content','promotions','leo-knowledge','training','cms','gallery',
    'other-payments','permissions','departments','travels'
  ))
);
alter table public.admin_menu_visibility enable row level security;
drop policy if exists admin_menu_visibility_select_self_or_super on public.admin_menu_visibility;
create policy admin_menu_visibility_select_self_or_super on public.admin_menu_visibility
for select to authenticated using (auth.uid() = user_id or public.is_super_admin());
drop policy if exists admin_menu_visibility_write_super on public.admin_menu_visibility;
create policy admin_menu_visibility_write_super on public.admin_menu_visibility
for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());
grant select, insert, update, delete on public.admin_menu_visibility to authenticated;
