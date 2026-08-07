# Batch 24 — Email Center Phase 1: Backend Enforcement

Scope: the security-critical half of the multi-account Email Center — no UI
yet (that's Phase 2). Everything here works with the *current* single-mailbox
UI unchanged, but closes the actual permission gaps your spec called out.

## The real bug this found

`_shared/gmail.ts`'s `getValidAccessToken()` took no mailbox parameter at
all — it just grabbed whichever Gmail token was **most recently created,
system-wide**, regardless of who was asking or which mailbox they meant.
Every Gmail API call in the app (`gmail-sync` and `gmail-sync-to-db`) went
through this. This is the actual reason true multi-account can't work yet,
and worth knowing about even before Phase 2's UI exists.

`gmail-sync` additionally had **no mailbox permission check of any kind** —
only `has_role(admin)`. Any admin could read, send, and delete through any
connected Gmail account, not just their department's.

## Fixed

1. **`supabase/functions/_shared/gmail.ts`** — `getValidAccessToken()` and
   `gmailFetch()` now require a `mailboxEmail` and filter the token lookup
   on it (`.eq("email", mailboxEmail)`) instead of grabbing "whatever's
   newest." No silent fallback — a wrong or missing mailbox now fails
   loudly with "Gmail account X is not connected yet" instead of quietly
   using someone else's account.

2. **`supabase/functions/gmail-sync/index.ts`** — every one of its 13
   `gmailFetch` calls now passes `mailboxEmail` (resolved from the request
   body, falling back to "most recently connected by this admin" only when
   the caller doesn't specify one — see compatibility note below). Added
   the missing `user_mailbox_access()` check entirely (previously absent).
   Also fixed `from_email: "me"` → the actual mailbox address on the
   sent-message record (was a placeholder, not a real address).

3. **`supabase/functions/gmail-sync-to-db/index.ts`** — accepts an explicit
   `mailboxEmail` in the request body (validated via `user_mailbox_access`)
   instead of only ever guessing "most recently connected." Trusted
   machine callers (pg_cron) must now pass it explicitly — there's no admin
   session to default from.

4. **`supabase/functions/gmail-oauth-callback/index.ts`** — after Google
   returns the authorized email (which the admin picked on Google's own
   consent screen, not something we controlled), it's now checked against
   `user_mailbox_access` for the requesting admin *before* the token is
   stored. If they connected a Gmail account outside their department's
   permission, the token is discarded and the redirect carries
   `gmail_error=mailbox_not_authorized` instead of silently succeeding.

5. **`supabase/functions/send-email/index.ts`** — accepts `fromMailbox`
   (and optional `fromName`), validated via `user_mailbox_access`, used as
   the actual Resend `from` address. Defaults to the previous hardcoded
   `admin@pwanbridgefort.ng` when omitted, so nothing currently calling this
   breaks.

6. **`supabase/migrations/20260807010000_email_center_backend_enforcement.sql`**
   - `admin_emails` RLS: replaced blanket `has_role(admin)` on all four
     policies with `user_mailbox_access(auth.uid(), to_email) OR
     user_mailbox_access(auth.uid(), from_email)` — this is the literal
     "filtering must happen on the backend" requirement from your spec.
     Checking both columns covers inbound (mailbox is `to_email`) and
     outbound/sent (mailbox is `from_email`) without a schema change.
   - New `get_available_mailboxes(_user_id uuid)` function — what Phase
     2's Email Login screen will list as an admin's account options
     (their `admin_mailboxes` rows, or every department mailbox if they
     have `admin:all`), plus whether each is already Gmail-connected.
     Locked to self (or `admin:manage_permissions`) — the first draft of
     this let any caller query any other user's mailbox list, fixed
     before shipping.

## Compatibility note — why nothing breaks today

The current UI (`AdminEmailCenter.tsx`) calls `gmail-sync` and
`gmail-sync-to-db` without ever passing `mailboxEmail` — there's no account
switcher yet for it to come from. Both functions fall back to "the mailbox
this admin most recently connected" when it's omitted, exactly matching the
old (buggy) default behavior — except now that resolved mailbox is actually
permission-checked, which it wasn't consistently before. Existing send/read
functionality keeps working unchanged; Phase 2 is what makes "pass a
specific mailbox" possible from the UI side.

## Verified

`tsc --noEmit` clean. All 13 `gmailFetch` call sites across `gmail-sync` and
`gmail-sync-to-db` confirmed to pass `mailboxEmail` (grep-verified, not just
visually).

## Next — Phase 2

The Email Login screen: lists mailboxes from `get_available_mailboxes()`,
Connect/Switch/Remove/Sign-out actions, account switcher state driving which
mailbox every inbox/sent/drafts/trash/spam query and compose action uses.
