# Bridgefort Homes Upgrade — Phase 3 Implementation

Status: COMPLETE

Date: 25 September 2026

## Implemented

### CRM / Service Journey
- Added service_journeys as the common operational record across property, inspection, travel, Agrovest, training, wealth consultation and general enquiries.
- Added crm_activities for traceable staff/customer journey actions.
- Existing crm_leads remains the lead record; service journeys can link to a lead and customer without replacing existing CRM data.
- Added RLS for service journeys and CRM activities.

### Travel → CRM
- travel_bookings now supports customer, CRM lead, service journey and assigned-staff links.
- Added a database trigger that creates/links a CRM lead and service journey when a travel booking is created and keeps the journey status synchronized.
- Existing travel booking status values are mapped into the Phase 2 service-journey lifecycle.
- A rollback test was executed successfully with a temporary travel booking; no test data was retained.

### Profile workflow
- Added authoritative profile_status and kyc_status.
- Added server-side calculate_profile_completion(uuid).
- Added a profile trigger so completion percentage and completion state are calculated from required fields rather than trusting the browser.
- Existing profiles were backfilled: 2 COMPLETE, 85 IN_PROGRESS, 12 DRAFT at the time of verification.
- Removed the unused legacy src/components/profile/ProfileForm.tsx; Profile.tsx continues to use NewProfileForm.tsx.
- Updated NewProfileForm.tsx so it no longer writes profile_completed=true / profile_completion_percentage=100.

### RBAC / approvals
- Added canonical permission aliases while retaining existing permission keys for compatibility.
- Approval centre visibility no longer uses hard-coded role-name allowlists; it is now permission-driven.
- Added canonical mappings for payment, withdrawal and listing approval permissions.

### Audit
- Added business_audit_log.
- Added state-change auditing for service journeys, travel bookings and profile/KYC state.
- Audit records are append-oriented and read-protected by permission.

## Verification

- Supabase migration application succeeded for the foundation, travel CRM sync, fixes and function search-path hardening.
- Travel CRM trigger was tested in a transaction and rolled back successfully.
- Profile completion was recalculated for existing profiles.
- Supabase security advisors were rerun after implementation.
- The new profile functions no longer appear in the mutable-search-path findings.
- Existing project security warnings remain: 42 pre-existing authenticated-callable SECURITY DEFINER functions, OTP expiry configuration, leaked-password protection disabled, and an available Postgres security patch. These are recorded for the security-hardening workstream rather than changed blindly in this phase.
- Current local Vite build was not claimed as verified because this implementation session did not have a working local repository build environment.

## Repository changes

- supabase/migrations/20260925223900_phase_3_business_data_foundation.sql
- src/lib/rbac.ts
- src/components/admin/AdminApprovalsHub.tsx
- src/components/profile/NewProfileForm.tsx
- Removed src/components/profile/ProfileForm.tsx

The live Supabase database contains the Phase 3 changes. The migration file records the consolidated foundation for source control/future environments.

## Phase gate

Phase 3 is complete. Do not start Phase 4 UI/UX work until this phase is accepted as the stable business/data foundation.
