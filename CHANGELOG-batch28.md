# Batch 28 — Fix Role Resolution: "Client" Instead of Real Role

Your report: `princenetlegacy@gmail.com` (super_admin) signs in and shows
"Client" instead of their real role. Traced it back — this affects every
account, not just this one, and it's three separate bugs stacked together.

## Bug 1 — `user_roles` has never had a SELECT policy, for anyone

Searched every migration referencing `user_roles`. There are `RESTRICTIVE`
policies blocking client-side INSERT/UPDATE/DELETE (added `20260704`) —
which only have any effect if RLS is already enabled — but **no migration
anywhere in this project's history ever added a permissive SELECT policy**
for this table. With RLS enabled and zero permissive SELECT policies, every
client-side `SELECT` on `user_roles` has always returned zero rows, for
every account, since RLS was turned on. Not a recent regression — this has
likely never worked.

`AuthContext.fetchUserAccess()` queries `user_roles` directly with the
user's own session to help determine their role. Getting zero rows back
from an RLS block looks identical to "this user genuinely has no legacy
role" — and the error was never even checked (only `data` was destructured,
never `error`), so this was invisible in the console too.

**Fixed:** `supabase/migrations/20260808000000_user_roles_select_policy.sql`
adds `user_roles_select_own` — self-select, or `admin:manage_permissions`
for viewing others.

## Bug 2 — the frontend's own permission-resolution query used the wrong column

Separate from Batch 23's SQL-side fix (`role_permissions.role_name` →
`role`), `AuthContext.tsx` had the *exact same* wrong-column bug on the
client side: `.in('role_name', roleSet)` against a table whose real column
is `role`. This always errored (silently — same unchecked-error problem),
meaning role-based permissions coming from `role_permissions` never
actually populated in the app, for anyone, regardless of role.

**Fixed:** column corrected to `role`, error now logged instead of
swallowed.

## Bug 3 — role resolution and every "is this an admin" check only recognized the literal string 'admin'

Even with Bugs 1 and 2 fixed, `getPrimaryRole()` only ranked
`['super_admin', 'admin', 'manager', 'team_leader', 'associate', 'staff']`
— none of the 7 department roles from Batch 23 (`admin_dir`, `admin_acct`,
`admin_legal`, etc.) were in that list at all. And separately, five
different places across the app checked `userRole === 'admin'` as an exact
string match — so even a `super_admin` (which *was* in the priority list)
would fail every one of those five checks, because none of them accept
anything other than the literal word "admin".

**Fixed:**
- **`src/lib/rbac.ts`** — new `ADMIN_ROLE_NAMES` set and `isAdminRole()`
  helper covering all 13 admin-type role names. `getPrimaryRole()`'s
  priority list now includes every department role, ranked appropriately
  (`super_admin`/`admin_dir` first, since those are unrestricted).
- **`src/pages/Dashboard.tsx`** — "Account Type" display now uses
  `isAdminRole()` instead of the exact-match check that caused the
  "Client" label in the first place.
- **`src/pages/AdminAuth.tsx`** — the "redirect to console if already
  logged in as admin" check had the same bug: a `super_admin` or
  department-role admin visiting `/admin-auth` while already logged in
  would just sit on the login page instead of being redirected.
- **`src/pages/AdminConsole.tsx`** — access gate simplified to use
  `isAdminRole()` (it already also checked `hasPermission('admin:all')`,
  which Bugs 1+2 were breaking too — this is a second, independent path to
  the same correct answer now).
- **`src/components/admin/PropertyManagement.tsx`**,
  **`src/components/reviews/PropertyReviews.tsx`**,
  **`src/components/dashboard/ClientDashboard.tsx`** — same one-line fix;
  these gate admin-only UI on the customer-facing side of the site.

## What to do

Apply the migration, then have `princenetlegacy@gmail.com` **sign out and
back in** (role/permission data is fetched once at session start, so an
existing session won't pick this up automatically). "Account Type" on
`/dashboard` should now show "Admin", and `/admin-auth` will redirect
straight to `/admin-console` if already signed in.

## Verified

`tsc --noEmit` clean. Grepped the full `src/` tree for every remaining
`userRole === '...'` pattern — one hit left, in `Dashboard.tsx`, and it's
correct as-is (it's choosing between "Staff"/"Admin" *label text* inside
the already-fixed `isAdminRole()` branch, not a gating check).
