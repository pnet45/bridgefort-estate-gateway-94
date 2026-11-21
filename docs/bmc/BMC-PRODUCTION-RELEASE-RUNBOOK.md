# BMC Partner Programme — Production Release Runbook

**Company:** Bridgefort Homes Development Ltd  
**Programme:** Bridgefort Multi-Business Consultants (BMC)  
**Status:** Prepared for controlled release; not an authorization to deploy  
**Prepared:** 20 November 2026  
**Current production migration head verified read-only:** `20261116050025`

## Release prerequisites

Do not start the production release until all items below have recorded approval:

- Nigerian legal counsel approves BMC Partner Agreement version 1.0.
- The Data Protection Officer / privacy counsel approves BMC Privacy Notice version 1.0 and confirms lawful bases, retention, processor and international-transfer arrangements.
- Homes, Travels and Agrovest division heads approve their separate operating and commission schedules.
- Finance approves commission calculation, reconciliation, payout, tax, refund and reversal rules.
- Management confirms delegated BMC decision-makers and the programme owner.
- Technology/Security approves the migration review, backup/restore point, UAT evidence and release plan.
- The product owner authorizes the production migration and release in writing.

A green CI result or successful disposable-database test is not production authorization.

## 1. Pre-deployment checks

1. Confirm the production project and repository are the intended Bridgefort Homes systems.
2. Re-read the production migration head. The expected pre-release head for this change set is `20261116050025`. If it differs, stop and reconcile migration history before proceeding.
3. Confirm the migration files exist and are ordered:
   - `20261120120000_bmc_agreement_acceptance_audit.sql`
   - `20261120130000_bmc_division_applications.sql`
   - `20261120140000_secure_bmc_division_review.sql`
   - `20261120150000_bmc_division_referral_attribution.sql`
   - `20261120160000_bmc_reviewer_permission.sql`
4. Confirm the latest GitHub Actions runs pass: quality gate, documentation release checks, and disposable PostgreSQL migration validation.
5. Confirm the actual production prerequisites still match the reviewed schema: `profiles`, `admin_roles`, `role_permissions`, `permissions`, `travel_bookings`, `orders`, `handle_new_user()`, `protect_profile_financial_fields()`, `is_global_admin(uuid)`, `user_has_permission(uuid,text)`, `has_role(uuid,text)`, and `pgcrypto` in the `extensions` schema.
6. Take and verify an approved recoverable database backup / restore point using the Company's established Supabase process. Record the backup reference and operator.
7. Confirm no other migration or release is being applied concurrently. Schedule an approved release window and notify the programme owner, Finance, Legal/Privacy and division heads.

## 2. Apply the database migrations

1. Use the approved Supabase migration deployment process; do not paste migration SQL piecemeal into the SQL editor.
2. Apply the five migrations in the exact order above.
3. Stop immediately if any migration fails. Preserve the full error and migration history; do not mark a failed migration as applied and do not skip ahead.
4. Do not run ad hoc destructive rollback SQL. If a migration fails or causes an issue, follow the verified restore procedure or prepare a reviewed forward-fix. Preserve any records already created.
5. Record the migration versions, operator, timestamp, deployment reference and outcome.

## 3. Post-migration verification

Run read-only checks to confirm:

- All five migration versions are recorded.
- BMC agreement acceptance and privacy acknowledgement records are protected from direct client reads/writes.
- New BMC registrations create independent pending division applications only when the required consent metadata is present.
- Existing BH-Realtors profiles, paid membership, sponsor relationships, referral codes and historical attribution remain unchanged.
- BMC Homes approval does not self-grant legacy paid BH-Realtors membership.
- The dedicated `admin:manage_bmc_partners` permission is present only for approved management roles; view-only approval access cannot make decisions.
- Direct table and column updates cannot bypass `admin_review_bmc_division_application()`.
- Approval requires verified agreement and privacy evidence; rejection/suspension requires a reason; audit events retain reviewer and decision history.
- Referral codes are generated only for approved divisions and are disabled when a division is not approved.
- Homes signup, Travels booking and Agrovest-only order attribution work as designed; self-referrals and mixed-division orders are rejected or excluded as appropriate.
- Agrovest and Travels commissions are written only to the separate BMC commission ledger at 10% of verified cleared customer payments; no upliner/downline rows are created.
- Homes transactions continue to use the existing BH-Realtors commission engine and do not write to the BMC commission ledger.
- BMC commission history is visible only to the owning partner through the authenticated RPC; management listing, payout and reversal actions enforce dedicated permissions and audit references.
- Travel enquiries alone do not earn commission; an authorized travel manager must confirm the booking and record a verified cleared payment.
- Commission payouts are not automatic; management records a verified payout reference. Full refund/cancellation reversals must retain a reason, and already-paid commissions require Finance recovery reconciliation.

Do not create production test accounts, submit test enquiries, or place test orders unless the product owner has explicitly approved a controlled production UAT plan and the tests cannot settle real payments.

## 4. Application and Edge Function release

1. Merge the reviewed PR only after all code, legal, privacy, division, Finance, database and security gates are satisfied.
2. Confirm the Vercel deployment result. A Vercel build-rate-limit failure is an infrastructure/deployment blocker; do not bypass it by upgrading the plan or changing billing without approval.
3. Deploy the updated Supabase Edge Functions through the approved deployment process and verify their deployed versions.
4. Confirm the application is using the intended production Supabase project and that no preview/test secrets or endpoints are present.

## 5. Leo knowledge publication

Publish only after legal/privacy and departmental approvals:

- Public BMC overview: public audience only.
- Staff BMC operations: staff audience with server-side role enforcement only.

Verify the current approved Agreement, Privacy Notice and division schedules are the sources used by Leo. Do not publish draft commission terms, internal review notes, KYC documents, bank details or other restricted records. Confirm that the public audience cannot retrieve staff-only content.

## 6. Controlled UAT and sign-off

Execute `docs/bmc/BMC-USER-ACCEPTANCE-TEST-PLAN.md` in an approved test environment first. Capture tester, date, environment, result and evidence for every test. Any failed consent, access-control, referral, privacy, audit or legacy-compatibility test blocks release.

Record final sign-off from Product Owner, Technology/Security, Legal, DPO/Privacy, Finance, Management and each division head in the Company's controlled document process.

## Commission policy approval and current known state

- Management has approved the division commission schedule: Homes retains the existing BH-Realtors rules; Agrovest pays 10% direct-referral commission; Travels & Tours pays 10% direct-referral commission; neither Agrovest nor Travels pays upliner/downline commission.
- Agrovest and Travels commission is calculated at 10% on each individual gross customer payment/instalment, before third-party cost deductions, after the payment is verified as cleared.
- The Agrovest/Travels commission engine is being prepared in a reviewable feature branch. It uses a separate BMC ledger and does not modify Homes commission records. The existing BH-Realtors Homes property-sale trigger still awards on full-order payment; progressive Homes calculation requires a separate compatibility refactor and remains unchanged in this release.
- The commission migration and behavioural tests must pass in the disposable PostgreSQL workflow before production release.
- Production migration history, backup/restore readiness, legal/privacy approval and Finance reconciliation sign-off remain separate release gates. No production migration is authorized by this runbook alone.
- Vercel preview deployment has previously been blocked by the account's build-rate limit; no paid upgrade has been made.
