# Phase 1 Security Implementation Notes

## Completed in this branch

- Added a shared Edge Function CORS origin allowlist.
- Hardened Gmail mailbox list/start/disconnect endpoints to return CORS only for approved application origins.
- Hardened the administrative email endpoint CORS policy.
- Hardened Paystack initialization and verification CORS policy.
- Changed Paystack callback URL construction to use the configured application URL instead of the request `Origin`, preventing an arbitrary-origin callback redirect.
- Hardened admin-user creation authorization and account confirmation behavior.
- Added a high-severity dependency audit to the GitHub quality gate.
- Added security operations and privileged-RPC review documentation.

## Items intentionally not changed blindly

- SECURITY DEFINER execution grants were not bulk-revoked because several are legitimate authenticated self-service or admin operations and database-level authorization is already enforced in many functions.
- Payment webhook JWT verification was not enabled because provider webhooks require an alternative signature-authentication model.
- Gmail OAuth token schema was not changed yet because encrypting existing refresh/access tokens requires a key-management design and a controlled migration; plaintext token storage remains a Phase 1 release blocker.

## Production release gate

This branch must not be merged until the remaining high-risk items are reviewed, tested, and explicitly closed or scheduled. Production deployment remains governed by the phase-level single-push policy.
