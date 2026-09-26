# Bridgefort Privileged RPC Review

Phase 1 requires every `SECURITY DEFINER` function to be classified before production hardening.

## Classification

### User-callable

Allowed only when the function is explicitly designed for an authenticated user's own data or an approved self-service operation. The function must enforce `auth.uid()` ownership or an equivalent permission boundary inside the database function.

### Admin-callable

Allowed only when the function performs an explicit canonical permission check. Legacy role-name checks may remain temporarily for compatibility but must not be the only authorization boundary for sensitive operations.

### Internal-only

Used by triggers, maintenance, synchronization, or other trusted server paths. These should not be directly executable by `anon` or `authenticated` unless a documented exception exists.

## Review requirements

For each function record:

1. Why `SECURITY DEFINER` is required.
2. Who may execute it.
3. Whether the function validates caller identity.
4. Whether it validates resource ownership/scope.
5. Whether it performs writes to financial, identity, or permission data.
6. Whether `search_path` is pinned.
7. Whether `anon` or `authenticated` has EXECUTE.
8. Whether a direct table/RPC alternative can replace elevated execution.

## Do not bulk revoke

A blanket revoke is prohibited during Phase 1 because it can break legitimate financial, authorization, or trigger workflows. Changes must be function-specific and tested against the affected business flow.
