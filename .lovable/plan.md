This is a large, multi-domain change. Confirm the plan below before I implement.

## 1. Rename "mlm" → "BHRealtors" + Subscription payments

**Rename**
- Rename routes: `/mlm` → `/bh-realtors` (keep a redirect from `/mlm`).
- Rename files: `src/pages/MLM*.tsx` → `BHRealtors*.tsx`, `src/components/mlm/*` → `src/components/bh-realtors/*`, `redirectAfterSignIn: '/mlm'` → `/bh-realtors` in `BridgefortRealtorsAuth.tsx`.
- Update Navbar, Footer, sitemap, and any user-facing "MLM" copy → "BHRealtors".
- DB tables `mlm_commissions` etc. stay as-is (no destructive rename) — only code/URL/UI text change. If you want the DB renamed too, say so and I'll add a migration.

**Subscription (from the flyer)**
- Seed 8 estate offers exactly as on the flyer: The Big League County (Warri), Fountains Crest Smart City (Owode), Bridgefort Crest Ville (Isiwo-Epe), Hampton Court Phase 3 (Agbara), Hampton Ville Estate (Itokin-Epe), Bridgefort Biz Hub (Ode-Omi), The Big League Haven (Ogwashi-Uku), Gateway Mini-Golf Estate & Resorts (Owode) — with all SQM tiers and prices from the image.
- New table `subscription_plans` (seeded) and `user_subscriptions` (plan_id, plot_size, total_amount, frequency: daily/weekly/monthly, installment_amount, start_date, next_due_date, paid_amount, status).
- New table `subscription_payments` (subscription_id, amount, paid_at, paystack_reference).
- Payment page: user picks estate → plot size → frequency (Daily ₦5k / Weekly / Monthly) → shows total, per-installment amount, # of installments, projected completion date. Paystack redirect for each installment.
- Timeline UI on subscription detail: progress bar, `paid / total`, days/weeks/months remaining, next due date, missed-installment warning.

## 2. Admin Console UI

- Menu item text forced `text-white` in both light and dark mode.
- Strip transitions/hover glows/blur wobble from admin console shell — keep only glassmorphism (`backdrop-blur-xl`, translucent `bg-white/10`, subtle border).
- Remove Tawk.to widget on `/admin-console` route (unmount script when on admin route).
- On mount, `window.scrollTo(0,0)` and set focus to top heading so the console opens at the top.

## 3. Agrovest detail pages

- New route `/agrovest/:slug` rendering per-category detail page (description, key benefits, image, CTA).
- Data source: extend the existing `cashCrops` / `facilities` arrays with `slug`, `description`, `benefits[]`.
- Wrap each card in `<Link to={`/agrovest/${slug}`}>`.

## 4. Agrovest image optimization

- Append Unsplash params `?auto=format&fm=webp&q=70&w=640` (mobile) with `srcSet` for `w=1024` desktop.
- Add `loading="lazy"` and `decoding="async"` on every card `<img>`.

## 5. Cleanup

- Remove unused `Sprout` import from `src/pages/Agrovest.tsx`.

---

**Confirm** and I'll execute in this order: (5) → (4) → (3) → (2) → (1). Item 1 is the largest — reply "go" or tell me what to trim.