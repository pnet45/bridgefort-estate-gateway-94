# BRIDGEFORT UPGRADE — PHASE 12
## Security-Definer & Authentication Hardening

**Status: IN PROGRESS**

### Phase 12A — Canonical authorization helper hardening

The security advisor reported 33 SECURITY DEFINER functions callable by authenticated users. Review showed these functions are not equivalent: several are intentionally used by RLS or server-side authorization and must remain callable, while some still contained legacy authorization fallbacks.

### Finding
Phase 11 disabled all enabled `role_permissions` entries for the legacy `admin` role, but four callable authorization helpers still consulted legacy `user_roles` or the legacy `admin` role directly:

- `has_role(uuid,text)`
- `can_approve_financial_requests(uuid)`
- `can_manage_bhrealtor_financials(uuid)`
- `can_manage_bhrealtor_funnel(uuid)`

That created a potential mismatch between the canonical RBAC model and older helper logic.

### Changes applied
Migration:
`supabase/migrations/20261003000000_phase_12_canonical_admin_helper_hardening.sql`

1. `has_role`
   - Privileged/admin roles now resolve from `admin_roles`.
   - Business roles continue to resolve from `user_roles`.
   - The legacy `admin` role no longer grants privileged access by itself.
2. `can_approve_financial_requests`
   - Removed direct legacy-role checks.
   - Uses global-admin authority or the canonical `admin:approve_payments` permission.
3. `can_manage_bhrealtor_financials`
   - Removed legacy `user_roles` fallback.
   - Uses global authority or the canonical `admin_acct` role.
4. `can_manage_bhrealtor_funnel`
   - Removed legacy `user_roles` fallback.
   - Uses global authority or the canonical `admin_acct` role.
5. Anonymous execution was explicitly revoked for all four helpers; authenticated/service-role execution remains because these helpers are used by application/RLS authorization paths.

### Verification
- Migration applied successfully to Supabase.
- All four functions retain `SECURITY DEFINER` with `search_path=public`.
- `anon` execution is false for all four.
- `authenticated` execution remains true where required.
- No customer, payment, booking, inventory, or account rows were modified.
- Global `admin_dir` / `super_admin` authority remains intact.

### Additional authorization fix

The `approve-admin-request` Edge Function was also reconciled. Its Admin-Dir grant check previously accepted a legacy `user_roles.super_admin` row. It now checks the canonical `admin_roles` table for either `admin_dir` or `super_admin`.

- GitHub commit: `d4992cfcdfb74a88f46e38a54ed730690b5576c8`
- Supabase deployment: ACTIVE, version 117
- JWT verification remains enabled.

### Remaining Phase 12 work
The remaining SECURITY DEFINER findings will be reviewed by category rather than mass-revoked. Functions used by RLS or required authenticated customer workflows will be preserved with their authorization checks; genuinely privileged Data API functions will be restricted to the minimum required callers.

### Release note
Current Vercel status is blocked by the platform's build-rate limit. No application build failure was reported by the status checks reviewed during this phase.
