-- Keep the Documentation workspace manageable through the per-admin menu visibility controls.
-- Documentation is permission-gated in the UI and RLS; adding the key here does not grant access.
alter table public.admin_menu_visibility
  drop constraint if exists admin_menu_visibility_tab_key_check;

alter table public.admin_menu_visibility
  add constraint admin_menu_visibility_tab_key_check
  check (tab_key = any (array[
    'overview','properties','allocations','documentation','crm','users','approvals',
    'subscribers','emails','analytics','mlm-funnel','activity','content','promotions',
    'leo-knowledge','training','cms','gallery','other-payments','permissions',
    'departments','travels'
  ]));
