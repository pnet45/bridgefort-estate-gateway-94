# Bridgefort Homes Upgrade — Phase 7 Admin Permissions & Security

Status: COMPLETE

## Objective

Verify and harden administrative authorization across role permissions, RLS, RPC authorization boundaries, privilege-escalation paths, role manipulation, and high-risk administrative data access.

## Findings and actions

### 1. Canonical RBAC boundary

The live database already had the canonical authorization model:

`business role -> department/scope -> permission -> action`

The following core authorization functions were reviewed:

- `user_has_permission`
- `admin_has_permission`
- `has_role`
- `is_admin`
- `is_global_admin`
- `is_super_admin`
- `can_approve_admin_request`
- `can_manage_admin_module`
- `can_manage_admin_structure`
- `can_manage_departments`
- `can_manage_mailboxes`

The current implementations already prevent ordinary authenticated callers from supplying another user's ID to these authorization checks unless the caller is a permitted global administrator.

### 2. Privilege-escalation path found and closed

`role_permissions` still had a legacy policy that allowed the broad `admin` role to manage the role-permission matrix.

That was inconsistent with the live canonical permission matrix: only `admin_dir` and `super_admin` currently carry `admin:manage_permissions`.

The legacy write policy was replaced with a canonical permission check:

- `admin:manage_permissions` required for role-permission writes.
- `WITH CHECK` is enforced as well as `USING`.
- Existing read access was preserved.

This removes the route by which a broad legacy administrator could directly change the permission matrix.

### 3. Admin approval requests

Legacy `has_role(..., 'admin')` policies on `pending_admin_requests` were removed.

Administrative request access now uses:

- `can_approve_admin_request()` for approval reads/updates.
- `is_global_admin()` for deletion.
- Existing user-created pending-request insertion remains intact.

### 4. Travel administration

Legacy `admin` role checks on `travel_bookings` were removed for administrative read/update/delete operations.

The new boundary uses:

- `booking.view` for reads.
- `booking.manage` for updates.
- Global administrator authorization for deletes.

The existing public/customer booking submission path was preserved.

### 5. Financial data boundaries

The legacy broad `admin` write policy on `payments` was replaced with the existing payment-approval permission boundary.

Documentation pricing and other-payment management were also moved from the broad legacy `admin` check to `payment.approve` / global-admin authorization.

This keeps financial mutation access aligned with the existing approval model.

## Live verification

After applying the hardening:

- `role_permissions` row count: 145
- `pending_admin_requests` row count: 13
- `travel_bookings` row count: 2
- `payments` row count: 93

No application records were created, deleted, or modified as test data.

The resulting RLS policies were queried directly from `pg_policies` and confirmed.

## Security-advisor result

The security advisor still reports 33 authenticated-callable SECURITY DEFINER functions.

These are not being blindly removed because many are deliberate application RPC boundaries used by customer dashboards, administrative workflows, RLS policies, or Edge Functions. The reviewed authorization functions already contain caller/target checks where required.

Remaining platform-level findings:

- OTP expiry is above the recommended threshold.
- Leaked-password protection is disabled.
- The current Supabase PostgreSQL version has security patches available.

These require platform/auth configuration changes rather than another broad RLS rewrite and remain explicitly tracked.

## Route/API protection review

The application currently uses:

- protected `PrivateRoute` wrappers for authenticated areas;
- an admin console access gate;
- permission-driven admin tabs;
- canonical frontend permission aliases in `src/lib/rbac.ts`;
- backend/RLS enforcement that does not rely on frontend visibility alone.

The frontend legacy admin compatibility path remains for existing accounts, but database mutation boundaries now enforce the canonical permissions for the high-risk areas covered by this phase.

## Service-role exposure

Repository review found service-role usage confined to server-side Supabase Edge Function code paths and server-side database operations. No service-role key was added to frontend source or public environment variables during this phase.

## Migration

Added:

`supabase/migrations/20260928230000_phase_7_admin_permissions_security.sql`

The same SQL was applied and verified against the live Supabase project before being committed to the repository.

## Phase 7 acceptance

- [x] Canonical RBAC functions reviewed
- [x] Role-permission privilege escalation path closed
- [x] Admin approval RLS hardened
- [x] Travel booking administration aligned to canonical permissions
- [x] Financial mutation boundaries aligned to approval permissions
- [x] UPDATE policies include `USING` and `WITH CHECK`
- [x] Live RLS policies verified
- [x] Live row counts verified
- [x] No test data created
- [x] Security advisors rerun
- [x] Migration committed to repository

Phase 7 is complete. Do not begin Phase 8 until explicitly instructed.
