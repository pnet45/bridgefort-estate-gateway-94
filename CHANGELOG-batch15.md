# Batch 15 (Rich Text Editor, part 1 of several) — Core editor + toolbar

5 files: 3 new, 2 modified.

## ⚠️ Verification status — different from every prior batch, please read
Tiptap wasn't installed in this project, and I have no network access in this
sandbox to `npm install` it. That means I could **not** run my usual
`tsc --noEmit` + `eslint` check against the real library the way I have for
every batch so far. Here's exactly what I could and couldn't verify:

- **Could verify:** `package.json` is still valid JSON. The Tiptap-independent
  file (`richTextSanitize.ts`) passes `tsc` and `eslint` cleanly. The two
  Tiptap-dependent files pass `eslint` cleanly (ESLint's resolver doesn't hard-fail
  on missing modules the way `tsc` does). Confirmed the whole rest of the
  project still shows the exact same pre-existing baseline errors as always
  (5 in AgrovestCategory.tsx, 7 in BHRealtors.tsx, 1 in Travels.tsx) — nothing
  else broke.
- **Could NOT verify:** that the Tiptap API calls in `RichTextEditor.tsx` and
  `EditorToolbar.tsx` type-check against the real installed library, or that
  the app actually builds with these packages present. `tsc` reports "Cannot
  find module '@tiptap/...'" for these files right now — expected, and it'll
  resolve once you `npm install`.

**What to do:** run `npm install`, then `npx tsc --noEmit` and `npm run build`.
If anything doesn't compile, send me the exact error and I'll fix it — I did
write this against Tiptap v2's real, stable, well-documented public API from
memory (not guessing at syntax), and caught and fixed two mistakes myself
during review (see below), but a fully-installed check is the only real proof.

## Two mistakes I caught and fixed before delivering
1. Initially wrote `StarterKit.configure({ link: false })` assuming StarterKit
   bundles a Link extension that needed disabling before adding my own. On
   reflection, mainline Tiptap v2's StarterKit does **not** bundle Link or
   Underline (that's exactly why both are added as separate packages here) -
   that config key doesn't exist on StarterKit's options type and would have
   been a real compile error. Removed it; `StarterKit` is used plain.
2. `richTextSanitize.ts` initially annotated the sanitize config with an explicit
   `DOMPurify.Config` type, which turned out to be incompatible with this
   project's installed `dompurify` version's exact type shape (a `PARSER_MEDIA_TYPE`
   literal-type mismatch). Removed the explicit annotation - the object is still
   checked structurally against `DOMPurify.sanitize()`'s real parameter type at
   the call site, so nothing about actual safety changed, just a redundant
   annotation that happened to be wrong.

## What's built (per your "core editor + toolbar first" scope)
- **New** `src/components/editor/RichTextEditor.tsx` — the reusable editor.
  Bold, italic, underline, strikethrough, superscript, subscript, clear
  formatting, paragraph + H1-H6, alignment (left/center/right/justify), bullet/
  numbered/checklist lists, blockquote, code block, links (insert/edit/remove,
  restricted to http/https/mailto so a pasted `javascript:` URL can't get
  through), undo/redo, and an optional live character counter (`maxLength`
  prop) matching the same visual pattern as the app's existing Textarea
  counter. Keyboard shortcuts (Ctrl+B/I/U, Ctrl+Z/Y, etc.) come free from
  Tiptap's StarterKit - no extra wiring needed.
- **New** `src/components/editor/EditorToolbar.tsx` — the toolbar UI, kept
  separate from the editor logic for reuse/testability. Horizontally
  scrollable on mobile (`overflow-x-auto`) rather than a multi-row wrap, so
  nothing gets cut off or breaks awkwardly on small screens. (Note: the brief
  described a fuller "collapse into expandable groups" mobile pattern - this
  first pass uses horizontal scroll as the simpler, more robust starting
  point; I can build the accordion-style grouped version in a later batch if
  you want that specifically.)
- **New** `src/components/editor/richTextSanitize.ts` — single shared
  DOMPurify allowlist for exactly what this editor's schema can produce
  (including task-list `<input type="checkbox">`/`<label>` output). This same
  config should be reused everywhere this content is later rendered (blog,
  CMS, email viewer, CRM notes, admin preview) so nothing the editor produces
  ever gets silently stripped somewhere it's displayed.
- `package.json` — added the 12 Tiptap packages actually used: `@tiptap/react`,
  `@tiptap/pm`, `@tiptap/starter-kit`, and extensions for underline,
  superscript, subscript, text-align, link, placeholder, task-list, task-item,
  character-count.
- `tailwind.config.ts` — registered `@tailwindcss/typography` in the `plugins`
  array. **Found it was already an installed dependency but never actually
  activated** — meaning the `prose`/`prose-estate` classes already used in
  `BlogPostContent.tsx` have been silently doing nothing this whole time. This
  fixes that as a side effect, and is required for the editor's own content
  styling to render properly.

## Explicitly NOT in this batch (per the phased plan)
Fonts/font sizes, text/highlight colors, tables, shapes, horizontal divider
insert, code syntax highlighting, image upload/paste/resize/crop/caption,
video embeds, emoji picker, icon insert, file attachments, find & replace,
auto-save, preview modes (desktop/tablet/mobile/email/print), email templates,
and actually wiring this into the 10+ existing textareas (blog, CMS, property
descriptions, email compose x2, CRM notes). All planned for subsequent
batches - this batch is specifically the foundation (editor + toolbar) you
asked to start with.
