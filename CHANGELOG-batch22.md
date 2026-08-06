# Batch 22 — Circular Gallery (React Bits, real WebGL component)

Drop these files into the matching paths in your repo (they mirror `src/...` and
`supabase/...` exactly) and commit. The three files under "Modified" are edits to
existing files — everything under "New" is a new file.

Scope: Gallery page hero is untouched. The real React Bits `CircularGallery`
(WebGL/OGL) now lives in the second section of the page, alongside a grid of
cards with a short event description per item. Both are clickable and open a
fullscreen lightbox (image or autoplay video). Admins manage the items (upload
image/video, caption, short description, reorder, publish/unpublish, delete)
from a new "Circular Gallery" tab in the Admin Console.

Verified: `tsc --noEmit` clean across the whole project — zero new type errors.

---

## New files

1. **`supabase/migrations/20260806000000_gallery_media_items.sql`**
   New `gallery_media_items` table — `media_type` (image/video), `media_url`,
   `poster_url` (thumbnail, required for video), `caption`, `event_description`,
   `display_order`, `is_published`. RLS: public can read published rows; admin
   role (`has_role(auth.uid(), 'admin')`, same pattern as `content_items`) can
   insert/update/delete. Apply via `supabase db push` or the SQL editor.

2. **`src/types/gallery.ts`**
   `GalleryMediaItem` type (mirrors the table) and `CircularGalleryDisplayItem`
   (the `{ image, text }` shape the 3D component consumes).

3. **`src/components/gallery/CircularGallery3D.tsx`**
   The actual React Bits CircularGallery (TS-TW variant, OGL/WebGL), renamed to
   avoid clashing with the existing hardcoded `CircularGallery.tsx` used in the
   hero. Added an `onItemClick(index)` prop — the canvas has no native per-item
   click handling, so this detects a genuine click/tap (not a drag) and a
   keyboard Enter/Space, and resolves it to whichever item is centered.

4. **`src/components/gallery/GalleryLightbox.tsx`**
   Fullscreen modal (shadcn `Dialog`, `hideCloseButton` + custom close button):
   dark overlay, click-outside-to-close, image or `<video autoPlay controls>`,
   caption + event description shown underneath.

5. **`src/components/ui/MediaUploadField.tsx`**
   Same upload pattern as the existing `ImageUploadField`, generalized to accept
   `image/*` or `video/*` via an `accept` prop, for the admin panel.

6. **`src/components/admin/content/AdminCircularGalleryContent.tsx`**
   Admin panel: card grid of items with thumbnail + type badge + live/draft
   badge; Add/Edit dialog (media type select, `MediaUploadField` for the file,
   a second upload for the video poster when type = video, caption, short event
   description, published switch); move up/down (swaps `display_order` between
   neighbors); delete.

## Modified files

7. **`src/lib/rbac.ts`**
   Added `gallery: 'admin:view_cms'` to `ADMIN_TAB_PERMISSION_MAP` — reuses the
   existing CMS Hub permission rather than requiring a new permission grant for
   current admins.

8. **`src/pages/AdminConsole.tsx`**
   Imported `AdminCircularGalleryContent` and the `Images` icon; added a
   "Circular Gallery" `TabsTrigger` next to CMS Hub (gated on
   `admin:view_cms`) and its `TabsContent`.

9. **`src/pages/Gallery.tsx`**
   Hero section (top of file) is unchanged. The second `<section>` (previously
   3 hardcoded cards) now: fetches published `gallery_media_items` from
   Supabase → feeds them into `CircularGallery3D` (600px, `bend=3`,
   `borderRadius=0.21`, `scrollEase=0.09`, `scrollSpeed=2.7`, Orbitron font,
   exactly as specced) → renders the same items as a card grid below it
   (thumbnail, video play-icon overlay when applicable, caption, short event
   description) → clicking either the 3D item or a card opens
   `GalleryLightbox`.

---

**Next up, when you're ready to instruct further:** storage bucket policy for
`media-files` if it isn't already public-read, or wiring drag-and-drop
reordering instead of up/down buttons.
