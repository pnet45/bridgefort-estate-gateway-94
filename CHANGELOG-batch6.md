# Batch 6 — Admin Activity Log filters, search, sort, date range, pagination

1 file, full rewrite of the data/filter layer (icon helpers and `logAdminActivity()`
export untouched).

Previous state: a flat realtime feed capped at the last 100 rows, no way to search,
filter, or page through history.

## What's new
- **Search** — debounced (350ms) `ilike` match on `action_description`
- **Action type filter** — dropdown populated from whatever action types actually
  exist in the table (not a hardcoded list, so it never goes stale as new action
  types get logged)
- **Entity type filter** — same approach
- **Date range** — from/to native date inputs, each constrains the other's min/max
  so you can't pick an invalid range
- **Sort** — toggle newest/oldest first
- **Pagination** — server-side via Supabase `.range()` + exact count, 20 rows/page,
  so it no longer loads only the most recent 100 rows and stops

## One deliberate behavior change worth knowing about
The old version auto-refreshed on every new log via a realtime subscription,
regardless of what you were looking at — meaning a new event could yank you back
to the top of a filtered search or a page you were reading through. Now the
realtime subscription only fires when you're on the plain, unfiltered, newest-first
first page (the "default" view) — anywhere else, the log list stays put until you
change a filter or manually refresh. If you'd rather it always live-refresh
regardless of filters, easy one-line change, just say so.

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new.
`eslint`: 1 pre-existing `no-explicit-any` (the `metadata: Record<string, any>`
field, present before my changes) + 1 pre-existing fast-refresh warning (same
pattern as before — this file exports both the component and the
`logAdminActivity` helper). 0 new issues.
