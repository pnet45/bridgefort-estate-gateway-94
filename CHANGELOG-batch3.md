# Batch 3 — Phone formatting & validation

2 new files, 1 modified.

No phone-formatting library (e.g. libphonenumber-js) was installed in the project,
and I don't have network access in this sandbox to add + verify a new dependency
safely — so rather than hand you an unverified `npm install`, I built a small
dependency-free formatter/validator that covers what the brief asked for
(spaces, country code, hyphens, copy/paste, invalid digits). If you'd rather use
libphonenumber-js for broader international coverage, say so and I'll swap it in.

- **New** `src/lib/phoneFormat.ts` — `formatPhoneInput()` formats as-you-type/paste
  (defaults to Nigerian numbers: `08012345678` → `+234 801 234 5678`, also handles
  `234...` and generic international `+cc ...` grouping), and `validatePhone()`
  with specific, actionable messages (not generic "invalid" errors).
- **New** `src/components/ui/PhoneInput.tsx` — reusable input wrapping the above,
  shows helper text by default and switches to a specific error message once the
  field is touched and invalid.
- `src/components/profile/NewProfileForm.tsx` — swapped the two rendered phone
  fields (`phoneNumber`, `referrerPhone`) from plain `<Input>` to `<PhoneInput>`.

## Found but not touched (flagging for you)
`NewProfileForm.tsx` tracks `nextOfKinPhone` (and the rest of the Next of Kin
fields: name, relationship, address, email) in state and writes them to the
`profiles` table on every save — but there's **no rendered form field for any of
them anywhere in the JSX**. Users are never asked for this info, yet it's sent to
the database unconditionally as empty strings. Didn't want to build a whole new
form section without you confirming that's wanted — let me know if Next of Kin
should be a visible required section and I'll add it (with the same phone
formatting/validation).

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new.
`eslint`: 0 new errors on all 3 files (2 pre-existing `no-explicit-any` in
`NewProfileForm.tsx` confirmed on lines I didn't touch).
