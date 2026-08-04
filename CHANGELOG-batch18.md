# Batch 18 (Rich Text Editor, part 4) — First real integration: blog posts

3 files.

## A real consistency bug found and fixed before wiring anything up
`BlogPostContent.tsx` — the component that actually renders post content on
the **public** blog page — had its own separate, narrower DOMPurify allowlist
(no `ol`, no tables, no images-with-captions, no checklists, no `h5`/`h6`, no
code blocks). If I'd wired the new editor into post creation without touching
this, an author using any of those features (all fully supported by the
editor as of batches 16-17) would see them **silently stripped on the live
page** - formatted in the editor, gone on the actual site. Fixed by having
this component use the same shared `sanitizeRichText()` from
`richTextSanitize.ts` that the editor itself uses, instead of its own local
config - guaranteeing whatever the editor can produce is guaranteed to
display. Also added `loading` to the shared allowlist, since this component's
placeholder content uses `loading="lazy"` on its images and that would
otherwise have been stripped too.

## The actual integration
- `src/components/blog/PostForm.tsx` — the "Content" field (used by both
  `CreatePost.tsx` and `EditPost.tsx`) now uses `RichTextEditor` instead of a
  plain `Textarea`, same 20,000-character cap as before. The **Excerpt**
  field was deliberately left as plain text - it's a short SEO/preview
  summary, not rich content, so rich formatting doesn't make sense there.
- Since `RichTextEditor` isn't a native form control, the browser's `required`
  attribute can't catch an empty editor the way it could a `required`
  textarea. Added an explicit check before submit: strips HTML tags, allows
  submission if there's real text OR an image/table (a post that's just an
  image with no caption text is still valid), otherwise shows a clear message
  instead of silently allowing an empty post through.
- Legacy posts (plain-text content saved before this editor existed) load
  correctly - Tiptap treats a plain string as one paragraph of text rather
  than erroring, so nothing needs a data migration.

## Verified
`tsc --noEmit`: same 13 pre-existing baseline errors, 0 new, and confirmed no
cascading errors in either `PostForm.tsx` or `BlogPostContent.tsx` from
importing the Tiptap-dependent `RichTextEditor` (its public prop types are
all plain strings/functions, nothing Tiptap-specific leaks through).
`eslint`: 0 errors, 0 warnings on all 3 files.

## Next in the sequence
CMS content (property/apartment descriptions, notices), then property/estate
description fields, then email compose (Resend + Gmail), then CRM/customer
notes - working through the remaining ~9 integration points one at a time so
each can be verified in isolation rather than one giant risky batch.
