# Security hardening review — 5 November 2026

## Scope and release status

This document tracks the security hardening release. The public-content Realtime publication migration is applied in production. Paystack and Resend inbound webhook hardening is deployed. The public-table privilege migration is split: existing table ACLs and postgres defaults are ready for application; the supabase_admin default ACL remains blocked by the current migration executor's role authority.

## CAPTCHA

The existing reCAPTCHA integration remains disabled as requested. This work must not re-enable it or make sign-up depend on it.

## Database privilege change

Migration `20261106190000_harden_public_table_privileges.sql` removes only `TRUNCATE`, `REFERENCES`, and `TRIGGER` privileges from `anon` and `authenticated` on existing public tables, and prevents those privileges from being granted by the `postgres` default table privileges. A separate migration, `20261106190100_harden_supabase_admin_default_privileges.sql`, handles the `supabase_admin` default ACL under an executor with that role membership.

It intentionally preserves ordinary DML grants because the application's workflows still depend on table-specific RLS policies. RLS remains the row-level authorization boundary. The migration does not modify service_role privileges, table data, policies, or production state.

## RLS review findings

- All public base tables observed in the connected production project had RLS enabled.
- Twelve RLS-enabled tables had no policies: `welcome_email_deliveries`, `email_delivery_webhook_events`, `leo_knowledge_source_sync`, `automation_secrets`, `inactive_account_reminders`, `leo_conversations`, `leo_messages`, `leo_public_rate_limits`, `leo_knowledge_documents`, `leo_knowledge_versions`, `leo_knowledge_chunks`, and `transaction_document_auto_send_claims`. These are consistent with server-managed/internal data by name and remain fail-closed to API roles; no permissive policy should be added without a demonstrated client use case.
- Existing broad SELECT policies were confirmed on catalogue/reference tables. However, `estate_other_payments` and `review_reactions` also expose payment configuration fields or user identifiers under broad authenticated/public SELECT policies; these are higher-priority candidates for column minimization or narrower policy design. Do not remove access until the UI/API callers are traced.
- The live database has 95 SECURITY DEFINER functions in `public`; the read-only ACL inspection found zero with EXECUTE granted to `PUBLIC` or `anon`. Many are explicitly granted to `authenticated` and/or `service_role`; trigger-only functions are separately identifiable. This is more precise than the Security Advisor's count of notices and still requires review of authenticated RPC authorization, search_path, argument validation and business logic. Do not mass-revoke EXECUTE.
- Current public-schema default table ACLs were confirmed for both `postgres` and `supabase_admin`, and both grant broad table privileges to API roles. The two `ALTER DEFAULT PRIVILEGES` owner targets were confirmed to match the live public-schema defaults observed. The `postgres` owner change is executable by the current role; the `supabase_admin` owner change is not. Existing public tables inspected are owned by `postgres`.
- `pg_trgm` is installed in the `public` schema; moving an extension is a separate compatibility change and is not included in this migration.
- Do not add broad `USING (true)` write policies as a generic fix.

## Expanded read-only database review

- The twelve no-policy tables are listed above; no RLS policy was added because the current posture is fail-closed.
- Broad SELECT policies need targeted review, particularly `estate_other_payments` (payment configuration) and `review_reactions` (contains user identifiers). Public catalogue reads should use minimal views or selected columns where practical.
- The live inventory found 95 public-schema SECURITY DEFINER functions, with zero EXECUTE grants to PUBLIC or anon at inspection time. Authenticated-executable RPCs still require authorization and argument-validation review.
- The migration's default-privilege targets were checked against live `pg_default_acl`: both `postgres` and `supabase_admin` have public-schema default table grants to anon/authenticated, so both are necessary targets for this project.
## Production transaction validation — 5 November 2026

A controlled transaction was run against the connected production database and explicitly rolled back. It did not leave persistent changes. A later `apply_migration` attempt of the combined migration failed at its preflight before any ACL changes, confirming the same role limitation.

- The executor was `postgres`. It is a member of `postgres` but not `supabase_admin`.
- Within the transaction, revoking `TRUNCATE`, `REFERENCES` and `TRIGGER` from `anon` and `authenticated` across all 116 public base/partitioned tables, plus revoking those privileges from the `postgres` public-schema default table ACL, passed an effective-privilege assertion.
- After rollback, the live database again showed 99 public tables with one or more of those effective privileges for API roles. This is the expected confirmation that the test was rolled back, not a persistent fix.
- The `supabase_admin` default-privilege change could not be executed by this database role. The migration has been split so the existing-table revokes and postgres default ACL can be applied independently; the separate supabase_admin migration remains blocked until the deployment execution role is confirmed to have the required membership/authority, or an approved owner-controlled remediation is prepared.
- No production data, policies, or persistent privileges were changed by this test.

## Webhook code review

- Paystack: the handler verifies the raw request body with HMAC-SHA512 and `x-paystack-signature`. This branch adds a 1 MiB request-body ceiling and preserves signature verification before JSON parsing.
- Resend inbound: the handler already validates the Svix signature and a five-minute timestamp window. This branch additionally requires POST, limits the body to 1 MiB, accepts only the documented `v1` signature version, and compares signatures in constant time.
- Resend delivery events: the separate delivery webhook already verifies Svix v1 signatures, enforces the five-minute timestamp window, and records provider event IDs against a unique key for replay/idempotency protection.
- Paystack event idempotency is supported by the unique `(gateway, reference)` payment event key and payment-request reference lookup. Verify this behavior with provider retry tests before release.
- No provider secrets were read, rotated, or changed.
- Production Edge Function deployments completed: `paystack-webhook` version 98 and `resend-inbound-webhook` version 122, both retaining `verify_jwt=false` as required for provider-signed webhooks. Deno helper tests passed; real provider event/idempotency tests remain outstanding.

## Sign-up rate limiting

- reCAPTCHA remains disabled exactly as requested.
- The web and mobile clients call Supabase Auth `signUp` directly. A browser-only IP counter cannot protect this path, and a new proxy would require carefully preserving both registration flows and the PBO/referral metadata.
- Supabase's current Auth rate-limit documentation does **not** provide a general per-IP quota for ordinary email/phone `/auth/v1/signup`; email confirmation sends are project-wide, while IP-based limits apply to specific endpoints such as anonymous sign-ins, verification, token refresh and MFA. Therefore the requested per-IP restriction for normal Bridgefort registrations needs a trusted server-side registration gateway or upstream WAF/proxy, not just the standard Auth dashboard quota. The connected project tools cannot configure that gateway. Do not claim ordinary sign-ups are IP-limited until it is implemented and tested.
- Do not trust `X-Forwarded-For` supplied directly by the browser. Any custom limiter must use the trusted proxy's client-IP metadata at the edge.

## Remaining security work

1. Build an inventory of all public tables, RLS policies, storage policies, views and exposed RPCs, with an explicit owner/role/access rationale.
2. Audit all SECURITY DEFINER functions, including exact grants to PUBLIC, anon and authenticated; restrict only after tracing frontend and Edge Function callers.
3. Review payment and email webhook handlers for provider signature verification, replay windows, idempotency and duplicate-event handling.
4. Implement IP-based signup throttling at a trusted server/Auth boundary. Keep CAPTCHA disabled. Do not rely on browser counters or spoofable client-supplied IP headers.
5. Design a trusted per-IP registration gateway that preserves both web and mobile sign-up flows, email/phone confirmation, and existing PBO/referral metadata. Use only platform-verified client-IP metadata; do not accept browser-supplied forwarding headers. Keep CAPTCHA disabled.
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
- No destructive production data change or Auth configuration change.
- No provider secret or domain change.
- No feature PR merged as part of this security branch.
