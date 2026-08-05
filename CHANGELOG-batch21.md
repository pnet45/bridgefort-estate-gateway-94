# Batch 21 (Rich Text Editor, part 6) — CRM & admin notes

2 files.

## A display bug I'd have introduced if I'd only touched the form fields
Both files rendered saved notes as plain React text (`<p>{notes}</p>`, JSX
auto-escapes text content). Once `notes` becomes HTML from the new editor,
that would display literal `<p>...</p>` tags as visible text on screen
instead of rendering the formatting - so I fixed the display side of both,
not just the input side:
- `src/components/admin/AdminCRMLeads.tsx` — the lead detail panel's notes
  section now renders via `dangerouslySetInnerHTML` + the shared
  `sanitizeRichText()`, styled with `prose prose-invert` to match the dark
  admin theme.
- `src/components/admin/AdminNotes.tsx` — same fix for the sticky-note card
  previews, plus `[&_*]:my-0` to strip the typography plugin's default
  paragraph/heading spacing, since these are small `line-clamp-3` preview
  cards where that spacing would look wasteful.

## The actual editor wiring
- `AdminCRMLeads.tsx` — the lead's main **Notes** field (the one explicitly
  matching "CRM Notes" in the brief) now uses `RichTextEditor`, same
  2000-character cap as before. Left the separate follow-up "Notes..." field
  as a plain `Input` - that one's meant to be a brief one-line annotation on
  a scheduled action ("Call to discuss pricing"), not a content field.
- `AdminNotes.tsx` — the admin sticky-notes feature's content field, same cap.

## Verified
`tsc --noEmit`: same 13 pre-existing baseline errors, 0 new.
`eslint`: 0 errors, 0 warnings on both files.

## Next in the sequence
Property/estate description fields, then remaining CMS content (notices,
homes/apartments listings, testimonials).
