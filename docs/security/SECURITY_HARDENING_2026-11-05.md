# Security hardening review — 5 November 2026

## Scope and release status

This branch contains a reviewed proposal only. It has not been applied to any Supabase project and does not change production.

## CAPTCHA

The existing reCAPTCHA integration remains disabled as requested. This work must not re-enable it or make sign-up depend on it.

## Database privilege change

Migration `20261105010000_harden_public_table_privileges.sql` removes only `TRUNCATE`, `REFERENCES`, and `TRIGGER` privileges from `anon` and `authenticated` on existing public tables, and prevents those privileges from being granted by the current postgres and supabase_admin default table privileges.

It intentionally preserves ordinary DML grants because the application's workflows still depend on table-specific RLS policies. RLS remains the row-level authorization boundary. The migration does not modify service_role privileges, table data, policies, or production state.

## RLS review findings

- All public base tables observed in the connected production project had RLS enabled.
- Twelve RLS-enabled tables had no policies. This is fail-closed for API roles, but each table must be classified as server-only or given a narrowly scoped policy only after its callers are traced.
- Existing unrestricted SELECT policies were observed on reference/public catalogue tables (for example estates, property reviews, training events and travel blackout dates). These should remain public only if the frontend genuinely needs them.
- Do not add broad `USING (true)` write policies as a generic fix.
- The 36 SECURITY DEFINER functions flagged by the Supabase Security Advisor require per-function review. Do not mass-revoke EXECUTE: some are legitimate RPCs and others are trigger-only functions. Review each function's caller authorization, fixed search_path, argument validation, and EXECUTE grants before altering it.

## Remaining security work

1. Build an inventory of all public tables, RLS policies, storage policies, views and exposed RPCs, with an explicit owner/role/access rationale.
2. Audit all SECURITY DEFINER functions, including exact grants to PUBLIC, anon and authenticated; restrict only after tracing frontend and Edge Function callers.
3. Review payment and email webhook handlers for provider signature verification, replay windows, idempotency and duplicate-event handling.
4. Implement IP-based signup throttling at a trusted server/Auth boundary. Keep CAPTCHA disabled. Do not rely on browser counters or spoofable client-supplied IP headers.
5. Confirm Supabase Auth's built-in per-IP limits and project settings without changing them in this branch.
6. Validate the migration against an approved non-production database, then run RLS role-matrix tests before seeking production approval.

## Validation queries

Use these read-only checks after applying the migration in a disposable/approved development database:

```sql
-- No dangerous table privileges for API roles.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
  and privilege_type in ('TRUNCATE', 'REFERENCES', 'TRIGGER')
order by table_name, grantee, privilege_type;

-- Identify public base tables without RLS.
select n.nspname, c.relname
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
  and not c.relrowsecurity
order by c.relname;

-- Identify RLS-enabled tables with no policies (review individually).
select n.nspname, c.relname
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
  and c.relrowsecurity
  and not exists (
    select 1 from pg_policies p
    where p.schemaname = n.nspname and p.tablename = c.relname
  )
order by c.relname;
```

## Explicit exclusions

- reCAPTCHA remains disabled.
- No production database migration or SQL write.
- No production Auth configuration, secret, Edge Function or domain change.
- No feature PR merged as part of this security branch.
