# Batch 12 (Phase 4) — Dedicated Estate Details page (item 23)

5 files changed/created, **2 files deleted** (see below — delete these manually,
zips can't remove files).

## The gap
Estates opened in a `Dialog` (modal), not a page — no shareable URL, no
deep-linking, browser back button didn't work naturally, no SEO. Worse: two
different dialog components existed with inconsistent depth depending on which
card rendered the estate — `PropertyCard.tsx` used the rich
`PropertyDetailsDialogFullscreen` (gallery, tabs, company info, reviews/ratings/
likes/comments/replies), while `EnhancedPropertyCard.tsx` used a much more basic
`PropertyDetailsDialog` with none of that. Same estate, different experience
depending on which page you clicked from.

## What I built
- **New** `src/pages/EstateDetails.tsx` at route `/properties/estates/:id` —
  a real page (Navbar/Footer, its own URL) that ports over everything good
  from the fullscreen dialog: image/video gallery with a fullscreen viewer,
  tabs (Overview, Docs, Company, Terms, Reviews), full reviews/ratings/likes/
  dislikes/comments/replies (via the existing `PropertyReviews` component,
  untouched), download subscription form, add to cart.
- **New:** a real **Book Inspection** button that opens `InspectionBookingForm`
  pre-filled with the estate you're already looking at (previously that form
  only existed standalone on the dashboard with a manual dropdown - you'd have
  to already know the estate's exact name and pick it yourself).
- **New:** a **Related Properties** section at the bottom - up to 4 other
  estates in the same category, linking to their own detail pages.
- Estates without hand-curated company/terms copy (everything except the 2
  hardcoded ones) still get a full real page now instead of being blocked -
  gallery, description, contact info, and reviews all still show; they just
  skip the extra Company/Terms tabs that only 2 estates have deep copy for.

## Files to delete manually
Both dialogs are now fully unused (confirmed via search - zero remaining
imports anywhere) and removed per the "remove dead code when replacing
functionality" instruction. **Delete these two files from your repo**
(a zip can't do this for you):
- `src/components/PropertyDetailsDialog.tsx`
- `src/components/PropertyDetailsDialogFullscreen.tsx`

## Files updated to use the new page
- `src/components/PropertyCard.tsx` — both the card click and the "View
  Details" button now `navigate()` to `/properties/estates/:id` instead of
  opening the dialog. Removed the now-dead dialog state/import.
- `src/components/properties/EnhancedPropertyCard.tsx` — same change. The
  optional `onViewDetails` override prop (for parents that want custom
  behavior) is preserved; only the *default* behavior changed from opening a
  dialog to navigating to the page.
- `src/components/dashboard/InspectionBookingForm.tsx` — added an optional
  `initialEstateName` prop so it can be pre-filled when opened from a specific
  estate's page. Standalone usage (dashboard, manual dropdown) is unaffected.
- `src/App.tsx` — added the `/properties/estates/:id` route.

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new.
`eslint`: 5 pre-existing `no-explicit-any` errors confirmed on lines I didn't
add or matching the same `any`-for-Supabase-rows convention used throughout
this codebase (including the file I just deleted). 1 pre-existing-pattern
`react-hooks/exhaustive-deps` warning (same shape as elsewhere in this app).
0 new build-breaking issues.
