# Batch 8 (Phase 3) — Referral QR code + referral-link routing/lock fix

2 files.

## Referral QR code (item 34)
- `src/pages/BHRealtors.tsx` — the referral link card now shows a QR code of
  the referral link, plus "Download JPG" (fetches the image and triggers a
  real browser download named `bridgefort-referral-<code>.jpg`) and "Share"
  (uses the native Web Share API on mobile/supporting browsers, falls back to
  copying the link on desktop browsers that don't support it).
- No QR library was installed, and I don't have network access in this sandbox
  to add + verify one. Generating a real scannable QR code requires the actual
  encoding algorithm (Reed-Solomon error correction, module matrix) — getting
  that wrong by hand-rolling it produces a code that silently fails to scan, so
  instead I used a public QR image API (`api.qrserver.com`, the same kind of
  service most "share this link" features use) with a graceful fallback UI if
  the image ever fails to load. If you'd rather this be fully self-contained
  with an npm package (e.g. `qrcode`), say so and I'll wire that in instead.

## Bug found and fixed while building this: referral links opened the wrong tab (item 41)
Traced the actual referral flow end-to-end and found two real problems, not
just missing features:
1. `src/pages/Auth.tsx` — the `?ref=CODE` query param correctly prefilled the
   sponsor code, but the auth page always defaulted to the **login** tab
   regardless. A referred person clicking the link landed on login and had to
   notice and manually switch to sign up themselves — easy to miss, defeats
   the point of the link. Now presence of `?ref=` forces signup mode.
2. The sponsor code field was fully editable even when it came from a link,
   so a referred person could accidentally (or intentionally) overwrite it
   before signing up. Now it's locked (`readOnly`, greyed out, with a lock
   icon and explanatory text) whenever it was populated from a URL param —
   manually-entered codes on the plain signup page are unaffected and stay
   editable as before.

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new (line numbers shifted from
my insertions, confirmed same set of errors as before).
`eslint`: 6 pre-existing `no-explicit-any` errors, all confirmed on lines I
didn't touch. 0 new issues.
