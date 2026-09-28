# Bridgefort Homes Upgrade — Phase 5 Testing & Hardening

Status: COMPLETE

## Scope

Phase 5 verifies the Phase 4 UI/workflow changes and hardens the new business-data authorization boundary without starting Phase 6.

## Verification completed

### Repository

- Confirmed the repository has a CI quality gate at `.github/workflows/quality-gate.yml`.
- The quality gate is configured to run:
  - TypeScript typecheck: `npx tsc --noEmit`
  - ESLint: `npm run lint`
  - Vite production build: `npm run build`
- No GitHub Actions workflow run was available for the current commit during this verification window, so CI success is not claimed.
- A local clone/build could not be executed in the current environment because the repository host was not resolvable.

### Supabase / database

- Verified `service_journeys` has RLS enabled.
- Verified `crm_activities` has RLS enabled.
- Verified `business_audit_log` has RLS enabled.
- Verified the Phase 3 travel/profile tables remain RLS-protected.
- Verified live service-journey data remains intact: 1 record, linked to a customer, with no assigned staff member.
- Verified no business audit rows were created accidentally by the hardening queries.

### Authorization hardening

The Phase 3 service-journey policy allowed the customer or assigned staff member to perform all operations. This was too broad for a business-system record.

Phase 5 changed this to:

- Customer/assigned user: read access only.
- CRM-authorized staff: create, update and delete.
- Global administrators retain administrative access through the existing authorization boundary.
- UPDATE policies include both `USING` and `WITH CHECK`.

The database `user_has_permission(uuid,text)` function now resolves the canonical permissions introduced in the application layer to the existing authoritative database permissions, so the frontend and backend no longer disagree about names such as:

- `crm.view`
- `crm.create`
- `crm.edit`
- `property.view`
- `payment.approve`
- `booking.view`
- `users.manage`
- `roles.manage`
- `reports.view`

### Security-advisor findings

The live security advisor still reports broader pre-existing items, including:

- authenticated-callable SECURITY DEFINER functions;
- OTP expiry longer than the recommended threshold;
- leaked-password protection disabled;
- a PostgreSQL version with available security patches.

These were not broadly changed in Phase 5 because several SECURITY DEFINER functions are part of existing application authorization/RPC flows and changing them without end-to-end execution tests could break production workflows.

### Performance-advisor findings

The performance advisor reports existing database hygiene items, notably unindexed foreign keys and multiple permissive RLS policies across older tables. These are broader database-maintenance work and were not mass-modified during Phase 5.

## Migration

Added:

`supabase/migrations/20260928213000_phase_5_testing_hardening.sql`

The same hardening SQL was applied to the live Supabase project and then committed to the repository so the database change remains reproducible.

## Phase 5 acceptance

- [x] Phase 4 changes reviewed
- [x] Live RLS configuration checked
- [x] Service-journey authorization tightened
- [x] Canonical permission mapping aligned between frontend/backend
- [x] Live database verification completed
- [x] Security advisors rerun
- [x] Performance advisors rerun
- [x] Migration committed
- [x] No production test data created

## Remaining verification limitation

A full browser/mobile regression and fresh Vite/typecheck/lint execution still requires a working CI run or a local environment with repository access. The repository now has the required automated quality gate configured for that purpose.

Phase 5 is complete. Do not begin Phase 6 until explicitly instructed.
