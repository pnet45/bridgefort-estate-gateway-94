# Bridgefort Security Operations Baseline

## Phase 1 scope

This document defines the security baseline for the Bridgefort application and Supabase backend.

### Deployment discipline

- Complete a phase before merging or pushing it to `main`.
- Batch phase changes into one reviewed commit/push where practical.
- Do not use repeated production pushes for incremental experimentation.
- Run typecheck, lint, build, tests, migration validation, and security checks before the phase push.
- After a production deployment, verify authentication, critical business flows, payments, and database health before starting the next phase.

### Privilege boundaries

- `SECURITY DEFINER` functions must have a documented reason for elevated execution.
- User-callable privileged functions must validate the caller's identity and resource ownership.
- Administrative functions must enforce canonical permissions rather than relying only on legacy role names.
- Internal trigger/maintenance functions should not be executable by `anon` or `authenticated` unless there is a documented requirement.

### Public Edge Functions

Functions with `verify_jwt = false` must use an appropriate alternative control:

- Payment webhooks: provider signature verification and idempotency.
- OAuth callbacks: short-lived, single-use state validation and account binding.
- Public forms: CAPTCHA/risk checks, schema validation, and rate limiting.
- Password recovery/OTP endpoints: strict expiry, attempt limits, and abuse controls.
- Admin endpoints: application authentication plus explicit authorization.

### Secrets and credentials

- Never commit service-role keys, provider secrets, OAuth client secrets, refresh tokens, or private credentials.
- OAuth refresh/access tokens must be encrypted at rest and never returned to browsers.
- Production secrets must be stored in deployment/runtime secret storage.
- Rotate credentials after suspected exposure.

### Financial integrity

Payment state must be derived from trusted server-side records and verified provider events. Browser-supplied amounts, status flags, and ownership claims are not authoritative. Payment webhook processing must be idempotent.

### Data recovery

The production database must have tested backups and a documented recovery procedure with explicit RPO/RTO targets. Restoration must be tested periodically rather than assumed to work.

### Phase 1 exit criteria

- Privileged RPC inventory reviewed.
- Public Edge Function inventory reviewed.
- Authentication hardening completed or explicitly tracked.
- OAuth credential storage hardened.
- Payment endpoints reviewed.
- Repository/deployed-function parity checked for critical functions.
- CI passes typecheck, lint, build, and security checks.
- No destructive database changes are made without a tested migration and rollback/restore plan.
