# Batch 7 (Phase 3) — Withdrawal validation & confirmation gating

1 file.

Found the balance check and password re-verification already existed from an
earlier session — but both only ran at final submit (toast after the fact), not
live, and the submit button was never actually disabled on them. Brief specifically
asked for both to be immediate/live, so:

## Live balance validation (item 35)
- Amount field now shows the specific problem inline as you type — "Enter an
  amount greater than ₦0" or "This exceeds your available balance of ₦X" — instead
  of only finding out via a toast after clicking submit.

## Submit gated on verified password (item 36)
- Password field now verifies against Supabase on blur (`signInWithPassword`),
  showing "Verifying password…" → "Password verified" (green) or "Incorrect
  password" (red) inline.
- Submit button is disabled (`canSubmit`) until: bank details exist, amount is
  valid and within balance, password is filled in, **and** it has actually been
  verified — not just present.
- Editing the password after a successful verification resets the verified state,
  so a stale checkmark can never linger next to a changed value.
- The original submit-time re-verification and balance/amount checks are left in
  place as defense-in-depth (never trust only a disabled button), so nothing about
  the final security check changed — this is additive.

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new.
`eslint`: 1 pre-existing `no-explicit-any` (in the untouched `catch (error: any)`
block), 0 new issues.
