# Batch 9 (Phase 3) — Social icons & profile links (items 18–19)

3 files: 1 new, 2 modified.

## Two real broken links found and fixed
Both `Footer.tsx` and `Contact.tsx` linked LinkedIn to `linkedln.com` (typo —
missing the "i") instead of `linkedin.com`. That link has been dead this whole
time. Fixed in both places.

## Modern icons
- **New** `src/components/icons/BrandIcons.tsx` — `XIcon` and `TikTokIcon`.
  lucide-react (v0.462.0, already in this project) doesn't ship an X mark or a
  TikTok mark at all, so these are drawn from scratch in the exact same minimal
  stroke style as the rest of the icon set (24x24, currentColor, 2px rounded
  strokes) — not a reproduction of either platform's official logo artwork,
  just a same-family line icon that drops in next to `<Facebook />` etc.
- `Footer.tsx` — swapped the outdated Twitter bird for `<XIcon />`, added
  TikTok and YouTube.
- `Contact.tsx` — the "Connect With Us" section was hand-rolled duplicate
  inline SVGs (not using the shared icon set at all, missing LinkedIn
  entirely, X icon styled with the wrong color). Rebuilt using the same
  lucide/BrandIcons components as the footer for consistency, added TikTok
  and YouTube.

## Every handle updated to bridgeforthomes
Old handles were a mix of `pwanbridgefortestates` / `pwanbridgefort.official` /
`pwanbridgefort` (legacy brand name) and one bare `https://facebook.com` with
no handle at all. All 6 platforms across both files now point to
`bridgeforthomes` consistently: Facebook, Instagram, X, LinkedIn, TikTok, YouTube.

## Small security/UX fix along the way
None of the social links had `target="_blank" rel="noopener noreferrer"` —
meaning clicking one navigated the visitor away from your site entirely (bad
for retention) and, more importantly, opening external links without
`rel="noopener"` is a known tab-nabbing risk (the opened page can access
`window.opener` and redirect it). Added to every social link in both files.
Also added `aria-label`s since these are icon-only links with no visible text
for screen readers.

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new.
`eslint`: 0 errors, 0 warnings across all 3 files.
