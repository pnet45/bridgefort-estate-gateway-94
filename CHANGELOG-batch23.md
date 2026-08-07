# Batch 23 — Department Admin Roles + Password Reset + RBAC Migration Fix

## ⚠️ Likely root cause of "Edge Function returned a non-2xx status code"

`20260805000000_admin_rbac_and_mailbox_access.sql` uses `create policy if not
exists ...` about 15 times. **That syntax doesn't exist in any released
Postgres version** — it's still an unmerged proposal as of Oct 2025. If that
migration ran as a single transaction (Supabase's default), the very first
occurrence would throw and roll back the *entire file* — meaning
`admin_roles`, `admin_mailboxes`, `has_role()`, `user_has_permission()`, etc.
may not actually exist in your database, even though the migration file
itself looks complete and "done."

Any edge function that touches those tables/functions — `gmail-sync`,
`approve-admin-request`, `create-admin-signup`'s admin check, and others —
would then fail with exactly the generic "non-2xx" error. **This is my
leading hypothesis; I still don't have your actual function logs**, so if
applying the fix below doesn't resolve it, send me the specific action +
function name and I'll dig further.

**Fix included:** `20260806005000_fix_admin_rbac_policy_syntax.sql` —
re-creates the same tables (safe no-op if they already exist via
`if not exists`) and re-applies every policy using valid
`drop policy if exists` + `create policy` syntax. Safe to run whether or not
the original migration actually succeeded.

## New files

1. **`supabase/migrations/20260806005000_fix_admin_rbac_policy_syntax.sql`**
   Corrective re-run of the RBAC/mailbox foundation with valid syntax (see above).

2. **`supabase/migrations/20260806010000_department_admin_roles.sql`**
   - Adds the 7 department roles to `roles`: `admin_dir`, `admin_adm`,
     `admin_acct`, `admin_sales`, `admin_cs`, `admin_legal`, `admin_it`.
   - `admin_dir` inherits every `super_admin` permission (unrestricted, per spec).
   - The other six get dashboard + email center + relevant view permissions.
   - New `role_default_mailboxes` table seeded with your exact matrix
     (e.g. `admin_legal` → `legal@`, `info@`; `admin_cs` → `sales@`, `info@`,
     `support@`, `noreply@`, `training@`; etc.) — this is what
     `approve-admin-request` reads from to auto-grant mailboxes on approval.
   - Adds `requested_role` to `pending_admin_requests` with a `CHECK`
     constraint limited to exactly those 7 role names — enforced at the
     database level, not just in application code.

## Modified files

3. **`supabase/functions/create-admin-signup/index.ts`**
   Accepts `requestedRole`, validates it server-side against the 7 allowed
   values (rejects anything else — the check exists here independently of
   the frontend dropdown), and stores it on the pending request. The
   bootstrap path (very first admin, no admins exist yet) now inserts into
   *both* `user_roles` (legacy `admin`, for backward compatibility with
   existing `has_role(uid,'admin')` checks elsewhere) **and** `admin_roles`
   with `role_name = 'admin_dir'` — the first admin is always unrestricted.

4. **`supabase/functions/approve-admin-request/index.ts`**
   Takes an optional `approvedRole` (the approver's decision — doesn't have
   to match what was requested), re-validates it against the same 7-value
   allow-list, assigns it to `admin_roles`, keeps the legacy `user_roles`
   admin insert for compatibility, and — the actual enforcement — looks up
   `role_default_mailboxes` for that role and seeds `admin_mailboxes`
   automatically. Admin-Dir is skipped (it doesn't need explicit mailbox
   rows; `admin:all` already grants every mailbox via
   `user_mailbox_access()`).

5. **`src/pages/AdminAuth.tsx`**
   - Signup tab: new required "Department Role" `<select>` listing the
     7 roles (`DEPARTMENT_ROLES` — client-side list matches the backend
     allow-list, but the backend is the actual boundary). Submit button
     disabled until one is chosen.
   - Login tab: new "Forgot password?" link opens a third "Reset Password"
     tab, embedded inline (no redirect to the public site). Reuses the
     *existing* `request-password-reset` / `verify-otp-reset-password`
     edge functions already used at `/auth/otp-reset` — no new backend
     needed for this part. 3 steps: email → 6-digit OTP → new password,
     with account-not-found and OTP-mismatch handling matching the existing
     page's behavior.

---

Verified: `tsc --noEmit` clean across the whole project.

## Still open from your spec (flagging, not started)

The big remaining piece is the **Email Center overhaul**: right now it's a
single shared inbox (`admin_emails` table) with one hardcoded Gmail mailbox.
Your spec wants per-department multi-account login/switching, backend-enforced
mailbox filtering for both Gmail and Resend, and the full modern-client UI
(sidebar, compose, attachments, etc.). That's a substantially larger effort
than this batch — happy to scope it into its own batch(es) when you're ready,
starting with the Email Login screen + backend filtering (the security-critical
half) before the UI polish.
