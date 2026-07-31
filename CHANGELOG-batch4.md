# Batch 4 — Character counters on textareas

26 files: 1 core component change + 25 call sites.

## The high-leverage fix
- `src/components/ui/textarea.tsx` — the base `Textarea` component (used everywhere)
  now renders a live `N/max` counter automatically whenever a `maxLength` prop is
  passed, turning red when near the limit. Native `maxLength` already stops typing
  past the limit at the browser level, satisfying "prevent typing beyond limit."
  Zero risk to existing usages that don't pass `maxLength` — renders exactly as
  before.

## The 25 call sites
Audited all 37 `<Textarea>` usages in the app. 2 already had a sensible `maxLength`
(`AdminTravelDashboard.tsx` note field, `ListingForm.tsx` description) and were left
untouched — they'll now show the counter automatically with zero changes needed.
`ProfileForm.tsx` was skipped — confirmed it's dead code with no importers anywhere
in the app, so not worth touching.

The remaining 25 files got a `maxLength` sized to what the field actually is:

| Limit | Fields |
|---|---|
| 300 | Short address/subtitle/excerpt fields (CMS subtitle, testimonial excerpt, employer/company address, training center address) |
| 500 | Testimonials, rejection reasons, KYC "explain" fields (political exposure, financial crimes), review replies |
| 1000 | Task/event/training descriptions, CRM/admin notes, contact form message, dashboard message field, travel booking notes, review text |
| 2000 | CMS notices content, CRM lead notes, bulk-email recipient list |
| 3000 | Cover letters, property descriptions |
| 5000 | Email bodies (bulk email, templates, compose dialog, reply pane, Gmail reply, BridgefortMails compose) |
| 20000 | Blog/CMS full body content (generous — this will likely get superseded once the rich text editor work happens) |

## A bug I introduced and caught before delivery
My first automated pass added a duplicate `maxLength` to `TravelsBookingForm.tsx`
(it already had one further down in the JSX than my duplicate-detection window
checked) — that would have been a hard TypeScript build error (`JSX elements cannot
have multiple attributes with the same name`). Caught it via `tsc --noEmit`, removed
the duplicate, then re-scanned the whole `src/` tree for the same pattern to confirm
it was the only instance. Verified clean afterward.

## Verified
`tsc --noEmit`: same 14 pre-existing errors, 0 new (after fixing the duplicate above).
`eslint`: 40 pre-existing errors/6 warnings across these files, all confirmed via
line-by-line diff to be on lines I didn't touch (mostly `no-explicit-any` in admin
email/CRM components). 0 new lint issues from this batch.
