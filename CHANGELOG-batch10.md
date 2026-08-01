# Batch 10 (Phase 3) — Error modals / actionable error handling (item 13)

5 files: 1 new, 4 modified.

## The real gap: no error boundary anywhere in the app
Searched the whole codebase for an `ErrorBoundary` and found none. That means
any unhandled render-time error in any page or component would unmount the
**entire** React tree and leave a blank white screen — no message, no way
back, nothing. This is the most severe version of "generic errors" the brief
is pointing at, so it's the priority fix here.

- **New** `src/components/ErrorBoundary.tsx` — class component catching render
  errors, showing a friendly full-page fallback that explains what happened
  ("this page ran into a problem, your data and account are safe"), why in
  plain language, and gives three concrete actions: **Try again** (resets the
  boundary), **Go to homepage**, and **Report this** (opens a pre-filled
  support email with the page URL and error message attached). In development
  mode only, it also shows the raw error stack in a collapsible details panel
  for debugging - never shown to real users in production.
- `src/App.tsx` — wraps only `<Routes>` in the boundary, not the whole provider
  tree. That way if one page crashes, routing/auth context/the cart
  sidebar/toast notifications all keep working, and "Go to homepage" actually
  has something functional to land on.

## Smaller generic-message fallbacks improved
Found 3 places using a bare `error.message || "An error occurred while X"` -
these already show the real error first when one exists, so this only affects
the rare case where the error has no message at all. Changed the fallback text
to be actionable instead of a dead end:
- `src/components/properties/PropertyForm.tsx` (saving a property)
- `src/pages/CreatePost.tsx` (creating a blog post)
- `src/pages/EditPost.tsx` (updating a blog post)

All three now suggest checking the connection, trying again, and contacting
support if it persists - instead of just stating that an error occurred.

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new.
`eslint`: 0 errors/warnings on `App.tsx` and `ErrorBoundary.tsx`. 7 pre-existing
`no-explicit-any` errors across the other 3 files, all confirmed on lines I
didn't touch (existing `catch (error: any)` blocks and one pre-existing
`useState<any>`).
