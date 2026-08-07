# Batch 23 — Revision (fixes `column rp.role_name does not exist`)

## Root cause

`public.role_permissions` already existed **before** any of this — created
back in `20260312022116_...sql` as a generic toggle table:
`(role text, permission_key text, is_enabled boolean)`, originally for
client/pbo feature flags. It has nothing to do with the admin RBAC system,
but the name collided.

Both `20260806005000_fix_admin_rbac_policy_syntax.sql` and
`20260806010000_department_admin_roles.sql` wrongly assumed a fresh table
with a `role_name` column. Since `create table if not exists` correctly
no-op'd (the table already existed), every later statement referencing
`role_name` on that table failed — that's the exact error you hit.

## Fix

Replaced every `role_permissions.role_name` reference with the table's real
column, `role`, in both files:
- Removed the (now unnecessary) `CREATE TABLE IF NOT EXISTS public.role_permissions` block entirely — it's reused as-is.
- `user_has_permission()`'s join: `rp.role = ar.role_name` (joining the *new* `admin_roles.role_name` against the *existing* `role_permissions.role` — different tables, so both column names are correct as written).
- All `INSERT INTO role_permissions` statements and their `ON CONFLICT` targets now use `(role, permission_key)`, matching the table's actual `UNIQUE(role, permission_key)` constraint.
- Dropped the redundant policy creation at the end of `005000` — `role_permissions` already has a correct authenticated-only SELECT policy from `20260801092738`.

No other table in either migration had a pre-existing collision — I checked
`roles`, `permissions`, `admin_permissions`, `admin_roles`, `admin_mailboxes`,
`email_sessions`, `email_accounts`, `mail_sync_status`, `mail_tokens`,
`mail_settings` against the full migration history; only `role_permissions`
pre-existed.

Also verified `has_role()` — my `CREATE OR REPLACE` keeps the exact original
signature `(_user_id uuid, _role text)` and body behavior (the
`user_roles.role = _role` comparison against the `app_role` enum, which
was already the established, working pattern across the codebase) and only
adds a new `OR EXISTS (... admin_roles ...)` branch — purely additive, no
existing caller is affected.

**Replace both files from Batch 23 with the versions in this zip, then
re-run them in order** (`005000` before `010000`).
