# Batch 27 — Admin Login Fix: 4 Compounding Bugs

Your report: admins can't log in after being approved, and the OTP
password-reset doesn't work either. Traced the entire signup → approval →
login → reset chain and found four separate, compounding bugs — not one.

## Bug 1 — signup never created the account, and discarded the password

In `create-admin-signup`, the "an admin already exists" branch (i.e. every
signup after the very first) never called `auth.admin.createUser()` at
all. It only wrote a `pending_admin_requests` row. The password the person
typed was received by the function and then simply never used or stored
anywhere — the comment in the old code even said "do NOT store password."

## Bug 2 — approval created the account with a random password nobody ever saw

`approve-admin-request` then created the *actual* auth account at approval
time, with `crypto.randomUUID() + '!Aa1'` as the password — a value the
admin never sees. So when they tried to log in with the password they
originally typed at signup, it could never match: that password was never
saved (Bug 1), and the real password is a random string only the server
ever generated (Bug 2). This is the direct cause of "invalid password or
credential."

## Bug 3 — the "send a reset email" call never actually sent anything

The old code called `supabaseAdmin.auth.admin.generateLink({type:
'recovery', ...})` expecting it to email the user a reset link.
`generateLink()` doesn't send anything — it only generates and returns the
link object for the caller to deliver themselves. The result was discarded
entirely, so even the fallback path (if someone tried to reset) never
reached the person's inbox.

## Bug 4 — the OTP reset flow checked the wrong table

Separately, `request-password-reset` (the "Forgot password?" flow added in
Batch 23) checked the `profiles` table to confirm an account exists before
sending an OTP. `profiles` is the customer-facing table — admin accounts,
created via `auth.admin.createUser()`, have no row there at all. Every
admin got "account not found" regardless of whether their account existed,
so the OTP was never even sent.

## Fixed

1. **`create-admin-signup`** — the "admin already exists" branch now calls
   `createUser()` immediately, with the real password, `email_confirm:
   true`, no roles granted. No roles = `has_role()` fails everywhere =
   "pending approval" is enforced by having zero privileges, not by
   withholding the account. Handles resubmission (after rejection, or a
   duplicate call) by updating the existing account's password instead of
   failing on "already registered." Also fixed the **first admin**
   (bootstrap, no approval needed) path, which had the same bug shape:
   created with `email_confirm: false` and a message claiming a
   verification email was sent — nothing ever sent one. Now `email_confirm:
   true`, message corrected to not claim a step that doesn't happen.

2. **`approve-admin-request`** — when the request has a `user_id` (the
   normal case now that Fix 1 exists), it grants roles/mailboxes to that
   *existing* account and never touches its password. Sends a plain "you
   can log in now with your existing password" email — no reset needed,
   telling them to reset a password that already works would be actively
   wrong. Falls back to the old temp-password + recovery-link behavior
   *only* for legacy pending requests that predate this fix (no `user_id`
   on record) — and for that fallback, the recovery link is now actually
   emailed via Resend instead of generated and discarded.

3. **`request-password-reset`** — existence check changed from the
   `profiles` table to `auth.admin.listUsers()`, which covers every
   account type (admin or customer) since all of them live in `auth.users`
   regardless of how they were created. Noted an existing limitation
   carried over from `verify-otp-reset-password`'s existing precedent:
   `listUsers()` is unpaginated, so this only checks the first page of
   accounts — fine at current scale, but worth knowing if the user base
   grows.

4. **`supabase/migrations/20260807030000_pending_admin_requests_user_id.sql`**
   — new `user_id` column on `pending_admin_requests`, linking a request to
   the real account created for it at signup. This is what lets approval
   tell "normal" requests apart from legacy ones with no account yet.

## What this means for requests already sitting in the queue

Any `pending_admin_requests` row created *before* this batch has no
`user_id` — those will go through the legacy fallback path on approval
(temp password + emailed recovery link) rather than using a password that
was never actually saved for them. New signups from now on go through the
fixed path.

## Verified

`tsc --noEmit` clean (frontend untouched by this batch — the existing
`requiresEmailVerification`/`pendingApproval` branching in `AdminAuth.tsx`
already handles both cases correctly once the backend flags are accurate).
Grepped the rest of `supabase/functions/` for the same "check `profiles` for
account existence" pattern — only `paystack-verify` also touches `profiles`,
for an unrelated, legitimate purpose (payment-to-customer linkage, not an
account-existence gate).
