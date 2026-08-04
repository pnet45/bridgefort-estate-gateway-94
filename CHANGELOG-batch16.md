# Batch 16 (Rich Text Editor, part 2) — Images

6 files: 2 new, 4 modified (`RichTextEditor.tsx` and `EditorToolbar.tsx` supersede batch 15; `richTextSanitize.ts` and `package.json` are additive on top of batch 15).

## Same verification caveat as batch 15
Still no Tiptap install / network access in this sandbox. `tsc --noEmit`
confirms the exact same pre-existing baseline (5 AgrovestCategory.tsx errors,
7 BHRealtors.tsx, 1 Travels.tsx) plus only the expected "Cannot find module
'@tiptap/...'" errors on the files that import them - nothing else broke.
`eslint` is fully clean on every file in this batch (its resolver doesn't
hard-fail on unresolved modules the way `tsc` does, so it could actually check
the code logic even without the packages installed).

**Two real mistakes I caught and fixed via manual review before delivering**
(same discipline as batch 15, since I can't compile-check this part):
1. `event.clipboardData?.files` / `event.dataTransfer?.files` inside
   `handlePaste`/`handleDrop` were typing as `unknown` because the callback's
   `event` parameter wasn't explicitly typed - `tsc` caught this immediately
   (this part doesn't depend on Tiptap types at all, just DOM lib types, so it
   was fully verifiable). Fixed by explicitly typing `event: ClipboardEvent`/
   `DragEvent`.
2. `@tiptap/core` is imported directly in `ResizableImage.tsx` (for
   `mergeAttributes`) but I'd only added the packages that *use* it, not the
   package itself, as a dependency. Added it explicitly - it would likely have
   resolved transitively anyway, but importing directly without declaring it
   is fragile practice.

## What's built
- **New** `src/components/editor/extensions/ResizableImage.tsx` — a custom
  image node extending Tiptap's base Image extension:
  - **Upload** via the toolbar's new Image button, **paste** from clipboard,
    and **drag & drop** all go through the same upload path
    (`editorImageUpload.ts`), which uploads to the same `public` storage
    bucket `CreatePost.tsx` already uses, under `editor-content/`.
  - **Caption** — a plain text input under the image, stored as a real
    `<figcaption>` in the saved HTML (not an invisible data attribute), so it
    actually displays wherever this content is later rendered.
  - **Alignment** — left/center/right, via a small floating control bar shown
    only when the image is selected.
  - **Resize** — width presets (25/50/75/100%) rather than a free-drag corner
    handle. Deliberate scope choice: a hand-built drag-resize handle is
    meaningfully more code with more ways to be subtly wrong, and un-testable
    here either way. Happy to build real drag-resize as a follow-up if you
    want it specifically.
  - **Alt text** editable via a small prompt (accessibility/SEO).
  - Two `parseHTML` rules: one recovers width/align/caption correctly when
    re-opening previously-saved content, the other is a plain fallback for a
    bare `<img>` (pasted HTML, or older content saved before this extension
    existed) so it still becomes an editable image node.
- **New** `src/components/editor/editorImageUpload.ts` — shared upload
  helper: validates type (PNG/JPEG/WEBP/GIF) and size (8MB cap) before
  uploading, returns a clear, actionable error message on failure rather than
  a generic one.
- `src/components/editor/richTextSanitize.ts` — added `figure`, `figcaption`,
  `img` to the allowlist (these weren't needed in batch 15, which had no image
  support yet), plus `src`/`alt`/`width`/`height` attributes.
- `src/components/editor/RichTextEditor.tsx` — registers the new image
  extension, wires `handlePaste`/`handleDrop`, and the shared
  upload-and-insert function used by all three entry points (toolbar button,
  paste, drop).
- `src/components/editor/EditorToolbar.tsx` — added the Image button + hidden
  file input.
- `package.json` — added `@tiptap/extension-image` and `@tiptap/core`
  (the latter needed directly for `mergeAttributes`).

## Still not in this batch (per the phased plan)
Tables, shapes/divider, code syntax highlighting, video embeds, colors/fonts,
emoji/icon insert, file attachments, find & replace, autosave, preview modes,
email templates, and wiring the editor into the actual 10+ existing call
sites. Next up per the sequence: tables, then wiring into real use sites.
