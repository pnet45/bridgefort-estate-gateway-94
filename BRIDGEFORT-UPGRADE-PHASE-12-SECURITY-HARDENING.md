# BRIDGEFORT UPGRADE — PHASE 12
## Security-Definer & Authentication Hardening

**Status: IN PROGRESS**

### Phase 12A — Canonical authorization helper hardening

The security advisor reported 33 SECURITY DEFINER functions callable by authenticated users. Review showed these functions are not equivalent: several are intentionally used by RLS or server-side authorization and must remain callable, while some still contained legacy authorization fallbacks.

### Finding
Phase 11 disabled all enabled `role_permissions` entries for the legacy `admin` role, but four callable authorization helpers still consulted legacy `user_roles` or the legacy `admin` role directly:

- `has_role(uuid,text)`
- `can_approve_financial_requests(uuid)`
- `can_manage_bhrealtor_financials(uuid)`
- `can_manage_bhrealtor_funnel(uuid)`

That created a potential mismatch between the canonical RBAC model and older helper logic.

### Changes applied
Migration:
`supabase/migrations/20261003000000_phase_12_canonical_admin_helper_hardening.sql`

1. `has_role`
   - Privileged/admin roles now resolve from `admin_roles`.
   - Business roles continue to resolve from `user_roles`.
   - The legacy `admin` role no longer grants privileged access by itself.
2. `can_approve_financial_requests`
   - Removed direct legacy-role checks.
   - Uses global-admin authority or the canonical `admin:approve_payments` permission.
3. `can_manage_bhrealtor_financials`
   - Removed legacy `user_roles` fallback.
   - Uses global authority or the canonical `admin_acct` role.
4. `can_manage_bhrealtor_funnel`
   - Removed legacy `user_roles` fallback.
   - Uses global authority or the canonical `admin_acct` role.
5. Anonymous execution was explicitly revoked for all four helpers; authenticated/service-role execution remains because these helpers are used by application/RLS authorization paths.

### Verification
- Migration applied successfully to Supabase.
- All four functions retain `SECURITY DEFINER` with `search_path=public`.
- `anon` execution is false for all four.
- `authenticated` execution remains true where required.
- No customer, payment, booking, inventory, or account rows were modified.
- Global `admin_dir` / `super_admin` authority remains intact.

### Additional authorization fix

The `approve-admin-request` Edge Function was also reconciled. Its Admin-Dir grant check previously accepted a legacy `user_roles.super_admin` row. It now checks the canonical `admin_roles` table for either `admin_dir` or `super_admin`.

- GitHub commit: `d4992cfcdfb74a88f46e38a54ed730690b5576c8`
- Supabase deployment: ACTIVE, version 117
- JWT verification remains enabled.

### Phase 12B — Admin Subscribers directory hardening

The Admin Console Subscribers tab was traced to `src/components/admin/AdminEstateSubscribers.tsx` and its live RPC chain.

Live data audit:
- 42 estate subscriptions exist.
- 0 subscriptions are missing a linked customer profile.
- 0 subscriptions are missing an order.
- 41 profiles have a phone number.
- 5 profiles have a PBO referral code.

The previous `admin_get_estate_subscribers` RPC returned several fields the UI expected but did not actually receive, including phone number and PBO referral code. This caused subscriber details to appear incomplete when an administrator opened a subscriber.

### Subscriber fix applied
- Rebuilt the live subscriber RPC data contract while keeping `estate_subscriptions` as the source of truth.
- Added phone number and PBO referral code.
- Added order payment status and payment reference.
- Preserved subscription number, estate, customer, plan, plot count, order total, amount paid and outstanding balance.
- Expanded search to name, subscription number, email, phone and referral code.
- Updated the subscriber detail dialog to show payment status, payment reference and referral code.
- Preserved the existing payment-history and referral-sharing workflows.
- No duplicate subscriber table or competing data model was introduced.

Migration:
`supabase/migrations/20261003031108_phase_12_subscribers_directory_data_contract.sql`

UI commit:
`df4999f5186bec4e1b80c8410d227c4e8b2f63c5`


### Phase 12C — BHRealtors dashboard, referral centre and withdrawal flow

The BHRealtors page was reviewed as an existing feature set rather than a new module. The goal was to make the Realtor experience clearer while keeping referral, commission and withdrawal records on the existing business tables and RPCs.

#### Dashboard read-model hardening
Migration:
`supabase/migrations/20261003031825_phase_12_bhrealtor_dashboard_read_model.sql`

The existing `get_my_bhrealtor_dashboard()` read model was expanded to return:
- current Realtor profile/package/rank and referral code;
- available wallet balance;
- direct referral count;
- active direct referral count;
- total commissions earned;
- locked commissions;
- paid withdrawal total;
- pending withdrawal total;
- withdrawal eligibility;
- recent commissions;
- recent withdrawals;
- direct network members.

The function remains `SECURITY DEFINER`, pinned to `search_path=public`, requires an authenticated user, and is not executable by `anon`. This keeps the browser from needing broad direct reads across financial tables.

#### BHRealtors UI restructuring
Updated:
- `src/pages/BHRealtors.tsx`
- `src/pages/BHRealtorsWithdraw.tsx`
- `src/components/bhRealtors/ReferralLeaderboard.tsx`
- `src/components/bhRealtors/DownlineTree.tsx`

Relevant UI commits: `5d5e14d382e5c8b71b8165b3798c479546cede7c`, `422357bcae667717fbaa19d241ca5f28660937f6`, `ea5fcef5fda26c84bcd17540e49308f7302a61af`, `6b5b5f825aa8a74874352b6eca1c95339d8f8bcc`, `7630b76fca78639e81a534c58c222b1a6189e2eb`.

The dashboard now presents the Realtor's operational information more clearly. The referral code and sharing card remain the single primary referral action area, so the page does not repeat the same tools in multiple sections:
- registered members;
- active Realtors;
- direct referrals;
- active direct referrals;
- commission earned;
- available commission balance;
- current package/rank;
- withdrawal eligibility;
- pending withdrawal amount;
- recent withdrawal activity.

The referral experience is centered around the existing referral share card, which provides the referral code, referral link, QR code, browser/device sharing, WhatsApp, Telegram, Facebook, X, email sharing, referral-image generation and image sharing/download.

The duplicate referral-center implementation inside the leaderboard was removed so the page has one clear referral-sharing area.

#### Downline visibility
The direct BHRealtor network now uses the protected `get_my_bhrealtor_network_tree()` read model for the signed-in user's root network. The expandable tree still loads deeper levels where the existing profile access path permits it.

The tree now shows:
- direct referral count;
- active direct count;
- member name;
- Realtor/member state;
- package;
- rank;
- joined date;
- expandable deeper referrals where available.

#### Withdrawal flow
The withdrawal page now uses the canonical BHRealtor dashboard read model for wallet eligibility, balance, package state, pending withdrawal amount and withdrawal history instead of relying on a separate direct financial read path.

The submit button now reflects the real business state:
- withdrawal unavailable when the current package is not eligible;
- no available balance when the wallet is empty;
- submission enabled only after required password verification, bank details and amount validation;
- existing transactional `submit_withdrawal_request()` remains the authoritative write path.

No withdrawal request, wallet balance or customer financial record was created or changed as part of this UI/read-model work.

#### Referral leaderboard access
The leaderboard now calls the existing `get_pbo_referral_leaderboard()` RPC instead of directly reading the leaderboard relation from the browser.

No new referral table, wallet table, commission table or competing downline model was introduced.

### Phase 12C verification
- Dashboard RPC migration applied successfully as version `20261003031825`.
- `get_my_bhrealtor_dashboard()`: SECURITY DEFINER, `search_path=public`, authenticated execution enabled, anonymous execution disabled.
- Withdrawal submission remains protected by the private transactional function and enforces `auth.uid() = p_user_id`, package withdrawal eligibility and wallet-balance checks.
- No production withdrawal was submitted.
- No production financial data was modified.
- No emojis or decorative AI-style copy were introduced into the BHRealtors UI changes. The existing Lucide icon system is used for interface affordances.

### Phase 12D — Mailbox manager authorization cleanup

Reviewed the remaining authenticated mailbox-management RPC surface. `list_privileged_mailbox_managers()` was still checking the legacy `has_role(...,'admin')` path when determining which users could be returned as mailbox managers.

The function was updated to use only the canonical `mailbox:write` permission for candidate managers, while the requesting administrator must have `admin:manage_mailboxes` or `admin:all`.

Anonymous execution remains revoked and authenticated execution remains available to the intended mailbox-management workflow.

Migration:
`20261003032332_phase_12_mailbox_manager_authorization_cleanup`

No mailbox assignment, user role, or account data was changed by this cleanup.

### Remaining Phase 12 work
The remaining SECURITY DEFINER findings will continue to be reviewed by category rather than mass-revoked. Functions used by RLS or required authenticated customer workflows will be preserved with their authorization checks; genuinely privileged Data API functions will be restricted to the minimum required callers.

### Release note
Current Vercel status is blocked by the platform's build-rate limit. No application build failure was reported by the status checks reviewed during this phase.

### Remaining Phase 12 work
The remaining SECURITY DEFINER findings will be reviewed by category rather than mass-revoked. Functions used by RLS or required authenticated customer workflows will be preserved with their authorization checks; genuinely privileged Data API functions will be restricted to the minimum required callers.

### Release note
Current Vercel status is blocked by the platform's build-rate limit. No application build failure was reported by the status checks reviewed during this phase.
