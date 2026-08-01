# Batch 11 (Phase 4) — CRM "Next Action" visibility (item 21)

1 file.

## What I found
The CRM (`AdminCRMLeads.tsx`) is much further along than expected — lead stages
with colored badges, follow-up scheduling with completion tracking, notes,
a full activity timeline (status changes, calls, emails, follow-ups logged
automatically), CSV export, search/filter, and a stats dashboard were all
already built. Most of item 21 was already done.

## What was actually missing
There was no way to see which leads need attention **without opening each one
individually** — follow-ups only showed up once you clicked into a lead's
detail panel. For a CRM with more than a handful of leads, that means no real
triage view.

- `fetchLeads()` now also pulls every pending (not-yet-completed) follow-up in
  one query and keeps the earliest one per lead as that lead's "next action."
- Every lead card in the list now shows a **Next Action** badge (action type +
  date), color-coded: red if overdue, amber if due today, slate if upcoming.
- Also surfaced **Last Contacted** on the card (the data already existed in
  `last_contacted_at`, it just wasn't shown anywhere in the list).
- Added an **Overdue** count to the stats row at the top, so admins immediately
  see how many leads have missed follow-ups without scanning the whole list.
- Scheduling a new follow-up now refreshes the list's next-action badges too
  (previously it only refreshed the currently-open lead's detail panel).

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new.
`eslint`: 0 errors, 0 warnings.
