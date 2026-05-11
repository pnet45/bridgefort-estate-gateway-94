
Investigating the two requests:

1. **Featured Announcements Card layout** — Need to identify which component renders on the homepage. Memory says `FeaturedAnnouncementsCarousel` is the homepage one (single-row, two-column carousel). The user wants:
   - Image fully visible (no crop) on the LEFT
   - Text write-up on the RIGHT
   - Currently uses `object-cover` which crops images

2. **"PWAN Bridgefort Delivers Again" Read More** — Need to make this announcement open the full article view (likely via the existing dialog or route to the blog post). Looking at `FeaturedAnnouncementsCarousel`, it already has a dialog with `fullContent`. Need to verify the Ode-Omi item exists there with full content, and ensure clicking "Read More" opens it.

## Plan

### 1. Featured Announcements Card Redesign (`FeaturedAnnouncementsCarousel.tsx`)
- Restructure each card to a horizontal split: **image left (40%)**, **text right (60%)**
- Replace `object-cover` with `object-contain` on a neutral background so the full image shows without cropping
- Use a fixed-height container (e.g., `h-64`) with `bg-gray-100` so varied image aspect ratios display fully
- Keep the existing animations, indicators, and dialog open behavior

### 2. Ode-Omi "Read More" Full Article
- Verify the `announcementItems` array contains the Ode-Omi entry with rich `fullContent` HTML (including the uploaded allocation images)
- If missing or thin, expand `fullContent` with the full press release text and embed the allocation images (`/lovable-uploads/ALLOCATION_*.jpg`)
- Confirm the "Read Full Article" button calls `setSelectedArticle(item); setIsDialogOpen(true)` so the existing DOMPurify-sanitized dialog renders the full content
- The dialog already supports scrollable HTML content via `ScrollArea` — no new route needed

### Files to edit
- `src/components/blog/FeaturedAnnouncementsCarousel.tsx` — layout restructure + ensure Ode-Omi `fullContent` is complete

### Technical notes
- Layout: `flex flex-col md:flex-row` with image div `md:w-2/5` and text div `md:w-3/5`
- Image container: `h-56 md:h-64 bg-gray-100 flex items-center justify-center` + `<img className="w-full h-full object-contain">`
- Dialog open already wired via existing `onClick` handlers — just confirm both "Read More" buttons (button + indicator) trigger it
- Preserve XSS safety: keep `DOMPurify.sanitize` with current `ALLOWED_TAGS`/`ALLOWED_ATTR`
