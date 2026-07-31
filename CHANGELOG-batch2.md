# Batch 2 — Remember Me + Password Strength

3 files: 2 modified, 1 new (`src/components/ui/PasswordStrengthChecklist.tsx`).

## Remember Me (real, not cosmetic)
Previously `persistSession: true` was hardcoded on the Supabase client, meaning
every login was *already* permanently remembered in localStorage regardless of
any checkbox — there was no way for a session to actually expire on browser close.

- `src/integrations/supabase/client.ts` — added a Remember-Me-aware storage
  adapter. When remembered (default, matches old behavior), tokens go to
  localStorage. When not, they go to sessionStorage only and vanish when the
  browser/tab closes. Exposes `setRememberMe(boolean)`.
- `src/pages/Auth.tsx` — added the actual checkbox to the login form
  ("Remember me on this device", defaults checked), wired to call
  `setRememberMe()` right before `signIn()`. Signup also explicitly sets it to
  `true` so a stale "not remembered" flag from a previous session can't leak
  into a brand-new account's first session.

## Password strength checklist (live, while typing)
- `src/components/ui/PasswordStrengthChecklist.tsx` — new reusable component:
  progress bar + checklist for the 5 requirements (6+ chars, upper, lower,
  number, special char). Exports `isPasswordStrong()` so any form can gate
  submission on it, and `PASSWORD_REQUIREMENTS` if you want to reuse the rules
  elsewhere (e.g. a future password-reset screen).
- `src/pages/Auth.tsx` — shown live under the password field during signup
  only (once the user starts typing); signup submission is now blocked with
  a clear, actionable toast if the password doesn't meet all 5 requirements.

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new.
`eslint`: 0 new errors on `client.ts` and `Auth.tsx` (4 pre-existing `no-explicit-any`
warnings confirmed on lines I didn't touch). `PasswordStrengthChecklist.tsx` has 2
harmless `react-refresh/only-export-components` advisory warnings (expected — the
file intentionally exports both the component and its validation helper for reuse).

## Not done yet in this batch
Phone formatting/validation, inline email-duplicate check, character counters on
textareas, and admin activity log filters/search/pagination — next up.
