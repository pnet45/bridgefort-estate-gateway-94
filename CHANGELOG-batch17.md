# Batch 17 (Rich Text Editor, part 3) — Tables

7 files: 2 new, 5 modified (`RichTextEditor.tsx`/`EditorToolbar.tsx`/`richTextSanitize.ts` supersede batch 16; `index.css` and `package.json` are additive on top of earlier batches).

## Same verification caveat as batches 15-16
Still no Tiptap install / network access here. `tsc --noEmit` confirms the
exact same 13 pre-existing baseline errors, plus only "Cannot find module
'@tiptap/...'" on the 5 files that import Tiptap directly (listed explicitly
and confirmed - nothing unexpected). `eslint` is fully clean on every file in
this batch. CSS brace-balance double-checked after the `index.css` append (171
open, 171 close).

One thing I want to flag rather than quietly hope is right: the table command
names (`insertTable`, `addRowAfter`, `mergeCells`, `splitCell`,
`setCellAttribute`, etc.) and the `editor.can().mergeCells()`/`.splitCell()`
availability checks are all real, documented Tiptap table commands from
memory - I'm confident in them, but this whole batch carries the same
"needs your `npm install` + build to be truly proven" caveat as the last two.

## What's built
- **New** `src/components/editor/extensions/CustomTableCell.ts` — extends
  Tiptap's base `TableCell`/`TableHeader` with `backgroundColor`,
  `borderColor`, and `verticalAlign` attributes, rendered as real inline CSS
  (not data attributes) merged into each cell's `style` - same principle as
  the image caption in batch 16, so cell styling actually displays wherever
  the saved HTML is later rendered, not just live in the editor.
- **New** `src/components/editor/TableControls.tsx` — toolbar controls:
  - **Insert**: hover-to-size grid picker (up to 8x8), inserts with a header
    row by default.
  - **Row/column**: add row after, add column after, delete row, delete
    column.
  - **Merge cells** / **Split cell** (both disabled via `editor.can()` checks
    when not applicable, so you can't click into an invalid state).
  - **Toggle header row**.
  - **Vertical alignment** within the current cell (top/middle/bottom).
  - **Cell background color** and **border color**, each via a small preset
    swatch popover (7 options including "none") rather than a full custom
    color picker - a fuller color picker is planned for the font/highlight
    color batch later in the sequence, and cells will likely reuse it then.
  - **Delete table**.
  - All of the above except Insert only appear once the cursor is actually
    inside a table.
- `src/components/editor/RichTextEditor.tsx` — registers `Table` (resizable
  columns enabled), `TableRow`, and the two custom cell/header extensions;
  wrapped the editor content area in `overflow-x-auto` so wide tables scroll
  horizontally on narrow screens instead of breaking the page layout.
- `src/components/editor/EditorToolbar.tsx` — mounts `TableControls`.
- `src/components/editor/richTextSanitize.ts` — added `table`/`tbody`/`tr`/
  `th`/`td` tags and `colspan`/`rowspan`/`colwidth` attributes.
- `src/index.css` — added the standard Tiptap table CSS (column resize handle,
  selected-cell highlight, resize cursor), scoped to `.ProseMirror` so it only
  applies inside the live editor, never to rendered/saved content elsewhere.
  Colors pulled from the app's existing CSS variables (`--border`, `--muted`,
  `--estate-blue`) rather than hardcoded, so it matches dark mode automatically.
- `package.json` — added `@tiptap/extension-table`, `-table-row`,
  `-table-header`, `-table-cell`.

## Still not in this batch (per the phased plan)
Shapes/divider insert, code syntax highlighting, video embeds, colors/fonts
for text (vs. just table cells), emoji/icon insert, file attachments, find &
replace, autosave, preview modes, email templates, and wiring the editor into
the actual 10+ existing call sites. Next up: wiring into real use sites
(starting with blog/CMS), since the editor now covers a solid, genuinely
useful feature set worth actually using somewhere.
