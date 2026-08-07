# Batch 25 — Email Center Phase 2: Login Screen + Multi-Account Switcher

Builds on Batch 24's backend enforcement. This is the frontend half: the
actual Email Login screen, account switching, and connect/disconnect UI
your spec asked for.

## Another real bug found and fixed along the way

`emailService.sendEmail()` (in `emailClient.ts`) called `send-admin-email`,
which routes through `connector-gateway.lovable.dev` — a Lovable connector
gateway that other comments already in this codebase (`_shared/gmail.ts`)
note is no longer reachable. Every Resend send through that path (the reply
flow, and anything routed through the old compose path) would fail with a
non-2xx response and no working fallback. **This may well have been the
original "Edge Function returned a non-2xx status code" bug from several
batches ago that I couldn't pin down without logs.**

Fixed: `emailService.sendEmail()` now calls `send-email` directly (the
function fixed in Batch 24 — real Resend API call, no gateway dependency,
no external Lovable connector involved).

## New files

1. **`src/components/admin/email/EmailLoginScreen.tsx`** — the actual
   "Email Login screen." Lists every mailbox this admin is authorized for
   (via `get_available_mailboxes()` from Batch 24 — Admin-Dir sees every
   department mailbox, everyone else sees exactly their `admin_mailboxes`
   rows). Each row: Connect (Gmail, not yet connected) / Sign In (switch to
   it) / Sign out (disconnect Gmail). An address the admin isn't authorized
   for simply never appears in the list — that's the enforcement, not a
   client-side filter on top of a bigger list.

2. **`supabase/functions/gmail-oauth-disconnect/index.ts`** — deletes the
   stored token for one mailbox. Requires the caller to currently have
   `user_mailbox_access` for that specific address (not just any admin).

## Modified files

3. **`src/components/admin/AdminEmailCenter.tsx`** — the real rewrite:
   - Replaced the old binary Resend/Gmail toggle (`activeAccount`,
     hardcoded to `admin@pwanbridgefort.ng` either way) with `activeMailbox`
     — a specific address, persisted in localStorage, validated against
     `get_available_mailboxes()` on every load (if access was revoked since
     last visit, it's silently dropped and the login screen shows again —
     the previously-unused `mailboxAccessDenied` state was actually meant
     to do this but was never wired to anything).
   - `activeAccount` (gmail/resend) is now *derived* from `activeMailbox`'s
     provider, kept only for the bits of logic that still branch on it
     (which send path to use, whether to show the Sync button).
   - Inbox/Sent/Drafts/Trash/Spam filtering changed from coarse
     source-bucket matching to exact address matching
     (`to_email === activeMailbox || from_email === activeMailbox`) — each
     mailbox now genuinely has its own separate folders, per the spec.
   - `connectGmail`, `syncGmailNow`, `handleComposeSend`, `handleRefresh`
     all take/use the specific `activeMailbox` instead of the hardcoded
     address — this is what actually makes Batch 24's backend parameters
     (`mailboxEmail`, `fromMailbox`) reachable from the UI at all.
   - New `disconnectGmail` wired to the new edge function.
   - Component renders `EmailLoginScreen` first (or whenever "Switch
     account" is clicked) instead of auto-opening an inbox.

4. **`src/services/emailClient.ts`** — `sendEmail()` fixed as described
   above; `SendEmailPayload` gained `fromMailbox`/`fromName`.

5. **`src/hooks/useEmail.ts`** — `sendEmail()` and `replyToMessage()` both
   accept an optional `fromMailbox` and pass it through to `send-email`.

## Known limitation carried forward (not a bug, a data fact)

Contact-form and legacy email-log entries are hardcoded to
`admin@pwanbridgefort.ng` / `noreply@bridgeforthomes.com` respectively —
this was already true before this batch. They'll only appear when that
exact address is the active mailbox. I didn't change this; flagging it in
case it's not what you want long-term (these two historical sources predate
the department-mailbox system entirely).

## Verified

`tsc --noEmit` clean. Grepped for every removed symbol (`switchAccount`,
`gmailConnected`, `connectingGmail`, `ACCOUNT_KEY`, `RESEND_SOURCES`) to
confirm no stale references were left behind.

## Next — Phase 3 (polish, not security-critical)

- Compose "from" selector when an admin has more than one mailbox (right
  now it always sends as whichever mailbox is currently active — correct,
  just not switchable mid-compose)
- Sync status / last-synced indicator per mailbox (`mail_sync_status` table
  exists since Batch 23, unused so far)
- `gmail-oauth-start` doesn't yet accept a "which mailbox am I trying to
  connect" hint — the permission check in `gmail-oauth-callback` still
  works fine without it, this would only improve the error message if
  someone signs into the wrong Google account mid-flow
