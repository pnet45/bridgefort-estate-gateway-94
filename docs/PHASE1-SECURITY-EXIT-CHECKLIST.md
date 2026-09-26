# Phase 1 Security Exit Checklist

Before Phase 1 is merged to `main`:

- [ ] All SECURITY DEFINER functions classified as user/admin/internal.
- [ ] No internal-only privileged RPC is callable by `anon` or `authenticated` without a documented exception.
- [ ] Admin account creation uses explicit authorization and does not auto-confirm accounts.
- [ ] Public Edge Functions have an explicit authentication, signature, CAPTCHA, or rate-limit reason.
- [ ] Payment webhook signatures and idempotency are verified.
- [ ] OAuth state is short-lived and single-use.
- [ ] OAuth refresh/access tokens are protected at rest.
- [ ] Critical deployed Edge Functions match source-controlled implementations.
- [ ] OTP expiry and password-compromise protection are hardened in Supabase.
- [ ] PostgreSQL security patch status is resolved or formally scheduled by the platform provider.
- [ ] TypeScript, lint, build, tests, and dependency/security checks pass.
- [ ] No service-role key or provider secret is present in source control.
- [ ] Backup and restore procedures are documented and a restore test is scheduled/completed.
- [ ] Production smoke tests cover login, admin access, property flow, customer flow, payment flow, and travel booking.

Do not merge Phase 1 if a high-risk item is untested or if a security change can strand an administrator, corrupt financial state, or bypass existing authorization.
