# Batch 5 — Inline email validation

1 new file, 2 modified.

## Format validation (new)
- **New** `src/lib/emailValidation.ts` — `validateEmailFormat()` with specific,
  actionable messages ("Missing the @ symbol", "Enter a domain with a dot", etc.)
  instead of one generic "invalid email" error.
- `src/pages/Auth.tsx` — live error shown under the email field once the user
  blurs it (signup mode), submission blocked with a clear toast if invalid.
- `src/components/profile/NewProfileForm.tsx` — same live validation on the
  email field; shows a neutral helper text when valid/untouched, the specific
  error when not.

## Duplicate-email check — intentionally NOT added as a live/inline check
Found that this is **already handled correctly** in `Auth.tsx`, and handled the
right way from a security standpoint: Supabase's `signUp()` returns a user with
an empty `identities` array (not an error) when the email is already registered
— that's deliberate on Supabase's part, specifically to prevent email
enumeration. The existing code already catches that case and shows "An account
with this email already exists. Please sign in instead..." after submit.

I did not build a separate live "does this email exist" endpoint for inline
checking, because that would undo that protection — it would let anyone type
emails one at a time and learn which ones are registered accounts, which is a
real phishing/credential-stuffing enabler. If you specifically want live
duplicate checking despite that tradeoff (some products accept the risk for
UX reasons), say so and I'll build a rate-limited edge function for it - but I
didn't want to quietly introduce that exposure without you deciding on it.

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new.
`eslint`: 6 pre-existing `no-explicit-any` errors (line numbers shifted from
earlier batches' insertions, confirmed not on any line I added), 0 new issues.
