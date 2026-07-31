# Bridgefort Homes — Phase 1 (complete) + Phase 2 (in progress)

Drop these files into the matching paths in your repo (they mirror `src/...` and
`tailwind.config.ts` exactly) and commit. `src/lib/profileEvents.ts` is a **new** file;
everything else is a modified existing file.

Verified before delivery: `tsc --noEmit` shows the same 14 pre-existing errors as
before my changes (all in files I didn't touch: AgrovestCategory.tsx line-level types,
BHRealtors.tsx, Travels.tsx) — zero new type errors. ESLint clean on every file below
except pre-existing `no-explicit-any` warnings on lines I didn't add.

---

## PHASE 1 — Critical fixes (✅ complete)

### 1. Removed bounce/zoom hover animations
- `src/components/ui/card.tsx` — base Card used app-wide; removed `hover:animate-roll animate-drop-in`
- `src/components/blog/BlogPostCard.tsx` — removed mount-in `animate-roll-in`
- `src/components/PropertyCard.tsx` — removed `animate-drop-in` / `hover:animate-roll`
- `src/components/properties/EnhancedPropertyCard.tsx` — removed `animate-roll-in`; toned hover image zoom from 110%→105%
- `tailwind.config.ts` — deleted now-unused `roll`, `bounce-zoom`, `focus-zoom`, `roll-in`, `drop-in`, `card-bob` keyframes; added a minimal `fly-in` keyframe for future scroll-triggered text use
- `src/App.css` — reduced-motion media query rewritten to match the new animation set

### 2. Hero/navbar gap bug (real root cause, not cosmetic)
Navbar is `fixed`, `h-[88px] lg:h-[104px]`. Thirteen pages/heroes were padding only
`pt-16 lg:pt-20` (64/80px) — a 24px gap that let content slide under the nav.
- `src/pages/Home.tsx`, `src/components/HomeHeroImage.tsx` — hero-specific height fix
- Same `pt-[88px] lg:pt-[104px]` fix applied to: `src/pages/Dashboard.tsx`,
  `src/pages/PaymentSuccess.tsx`, `src/pages/ListingDetails.tsx`, `src/pages/Listings.tsx`,
  `src/components/training/TrainingHero.tsx`, `src/components/services/ServicesHero.tsx`,
  `src/components/blog/BlogHeader.tsx`, `src/components/career/CareerHero.tsx`,
  `src/components/ecommerce/CartPage.tsx`, `src/components/buy2sell/Buy2SellHero.tsx`,
  `src/components/properties/PropertyHero.tsx`, `src/components/about/AboutHero.tsx`

### 3. Shopping cart empty state
- `src/components/ecommerce/CartSidebar.tsx` — icon badge + friendly copy + "Browse Estates"
  CTA → `/properties`; line items got hover/border polish

### 4. UI consistency pass (bounded — see note below)
- Standardized 9 pages from inconsistent `container mx-auto px-4` (default Tailwind
  breakpoints, less padding) to the app's real container utility `container-custom`
  (max-w-[1920px], responsive padding): `src/pages/Dashboard.tsx`, `src/pages/PaymentSuccess.tsx`,
  `src/pages/AgrovestCategory.tsx`, `src/pages/BHRealtorsWithdraw.tsx`, `src/pages/BridgefortMails.tsx`,
  `src/pages/BHRealtorsSubscription.tsx`, `src/pages/Profile.tsx`, `src/pages/BHRealtors.tsx`,
  `src/components/dashboard/ClientDashboard.tsx`
- **Not done, flagged instead:** `estate-blue` vs `primary` color-token naming (93 vs 28 usages).
  Confirmed both resolve to the identical HSL value in light/dark mode — this is a legacy
  naming inconsistency, not a visual bug. Renaming ~93 files for zero visual change was
  judged disproportionate risk for this pass; flagging for a dedicated cleanup session if
  you want it done.

---

## PHASE 2 — Mechanical improvements (in progress)

### Lazy loading
Audited all 89 `<img>` tags in the app. Added `loading="lazy" decoding="async"` to every
one that was missing it (16 files), **except** the single true above-the-fold gallery image
in `ListingDetails.tsx`, which got `loading="eager" fetchPriority="high"` instead:
`src/components/admin/AuthCarouselManager.tsx`, `src/components/admin/content/AdminHeroSlidesContent.tsx`,
`src/components/admin/email/EmailReadingPane.tsx`, `src/components/training/FeaturedEventsCarousel.tsx`,
`src/components/training/UpcomingEvents.tsx`, `src/components/blog/BlogPostContent.tsx` (also added
`loading` to the DOMPurify `ALLOWED_ATTR` whitelist so it isn't stripped),
`src/components/home/Partners.tsx`, `src/components/home/FeaturedCenterSeminar.tsx`,
`src/components/PropertyDetailsDialog.tsx`, `src/components/properties/ComparisonTray.tsx`,
`src/components/listings/ListingForm.tsx`, `src/components/about/OurEstates.tsx`,
`src/components/about/WhyRealEstate.tsx`, `src/pages/Dashboard.tsx`, `src/pages/ListingDetails.tsx`,
`src/pages/MyListings.tsx`

### Profile pictures not refreshing across the app after upload
Root cause: Navbar, Dashboard, and the Profile/KYC form each kept their **own disconnected**
copy of the `profiles` row, fetched once on mount. Uploading a new picture on one screen never
told the others to refetch, so it wouldn't show up until a hard reload.
- **New file** `src/lib/profileEvents.ts` — tiny shared pub/sub (`notifyProfileUpdated()` / `onProfileUpdated()`)
- `src/components/Navbar.tsx` — listens, refetches profile on the event
- `src/pages/Dashboard.tsx` — listens (picks up changes from the Profile form) and now also
  announces its own quick-upload so Navbar updates instantly
- `src/components/profile/NewProfileForm.tsx` — announces on successful save

### Prefill known info
- `src/components/profile/NewProfileForm.tsx` — email is now prefilled from the authenticated
  session immediately, even before a `profiles` row exists. (First/last name were already
  prefilled correctly via the signup-time profile row — no fix needed there.)

### Dashboard left-nav reorder
- `src/components/ecommerce/CartSidebarMenu.tsx` — "5K Daily Promo" moved to 2nd position
  in the Account Menu (the actual left-nav referenced in the brief)

### CMS "Create Content" buttons (Homes Sales / Apartments for Rent)
Both tabs were previously **read-only lists** that literally said "managed via the Properties
tab" with no way to actually create one from there.
- `src/components/admin/content/AdminHomeSalesContent.tsx` — added "Create Home Sale Listing"
  button (header + empty-state)
- `src/components/admin/content/AdminApartmentsContent.tsx` — added "Create Apartment Listing"
  button (header + empty-state)
- `src/components/properties/PropertyForm.tsx` — new optional `initialCategory` prop to seed
  category/listing-type fields for a **new** listing only (doesn't touch edit-mode logic)
- `src/components/admin/AdminPropertyManagement.tsx` — reads `?new=home` / `?new=apartment`
  query param, auto-opens the existing "Add Property" dialog pre-seeded with the right
  category, then cleans the URL
- `src/pages/AdminConsole.tsx` — **found and fixed a related bug**: the admin tab state only
  read the `?tab=` URL param on first mount, so navigating with a button while the console was
  already open wouldn't actually switch the visible tab. Added a sync effect so it does.

### Next in Phase 2 (not started)
Character counters, Remember Me, password strength, phone formatting, inline validation,
activity log filters/search/pagination.

---

## Before you commit
Run `npm run build` and `npx tsc --noEmit` on your machine — I couldn't run Vite's bundler
in this sandbox (the vendored `node_modules` here is Windows-built with no network to
reinstall Linux bindings), so it's only been verified with `tsc --noEmit` + `eslint` directly.
