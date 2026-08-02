# Batch 13 (Phase 4) — Referral MLM tree + downline visibility fix (item 41)

3 files: 1 new SQL migration, 1 new component, 1 modified page.

## ⚠️ Real bug found: downlines were invisible to every real PBO

The only non-admin `SELECT` policy on `profiles` was `USING (auth.uid() = id)`
— a regular user can only ever see their own row. The existing "Direct
referrals" feature queried `profiles WHERE referred_by_id = auth.uid()`, but
RLS silently blocks every other user's row *before* that filter is even
considered. In plain terms: **the "You currently have N direct referrals"
count has almost certainly shown 0 for every real PBO this whole time**,
regardless of how many people they actually referred. This isn't a UI
bug — the data was never reaching the browser.

### The fix — `supabase/migrations/20260802000000_downline_visibility_rls.sql`
**You need to run this migration against your live Supabase project** (via the
Supabase CLI, dashboard SQL editor, or however you normally apply migrations —
I don't have a way to apply it myself from here).

Adds a narrow, recursive RLS policy: a user may see a profile if it's
anywhere in *their own* downline (direct referral, their referrals, and so
on) — never anyone else's downline, upline, or unrelated users. Recursive
membership can't be checked directly inside an RLS `USING` clause against the
same protected table, so — following the exact same safe pattern your
`pbo_referral_leaderboard` view already uses — it's implemented via a
narrowly-scoped `SECURITY DEFINER` function that only ever returns descendant
ids of whatever root id it's called with; the RLS policy itself still
restricts every caller to `auth.uid()`'s own downline.

## The actual tree UI

- **New** `src/components/bhRealtors/DownlineTree.tsx` — a real, working,
  unlimited-depth referral tree. Shows each member's **name, email,
  registration date, and rank** (PBO vs. Member badge) — previously this data
  was fetched but never displayed, only a bare count was shown. Click the
  arrow next to any member to lazily fetch and expand *their* referrals, and
  so on recursively — this is what makes it a genuine tree rather than a
  flat one-level list.
- `src/pages/BHRealtors.tsx` — removed the now-redundant `downlineMembers`
  state/fetch (the new component is self-contained and fetches its own data),
  replaced the "Direct referrals: N" count with `<DownlineTree />`.
- The existing top-PBO `ReferralLeaderboard.tsx` was left untouched — it's
  already well-built and deliberately privacy-scoped (first name + last
  initial + package + count only, via a `SECURITY DEFINER` view, no emails).

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new.
`eslint`: 1 pre-existing `no-explicit-any` (confirmed on a line I didn't
touch), 0 new issues. `DownlineTree.tsx` is fully clean.

**Note:** the tree UI won't show any data until the migration above is
applied — that's expected and by design (RLS fails closed), not a bug in the
component.
