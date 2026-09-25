# Bridgefort Homes Platform Upgrade — Phase 1 Audit

Date: 25 September 2026
Repository: pnet45/bridgefort-estate-gateway-94
Audited branch: main
Audited HEAD: f2bf1192c61e11c17394266c6dd3110a94598ba6
Latest observed commit: subscriber (25 Sep 2026)

## Phase 1 objective
Audit the current Bridgefort Homes website/application before changing the CRM, admin approvals, profile workflow, estate/land inventory and pricing, travel booking, role permissions, or UI/UX.

## Current platform baseline
- React + TypeScript + Vite + Tailwind + shadcn/ui.
- Supabase is the backend/auth/data layer.
- React Router is used for public, customer, realtor, travel and admin routes.
- The application already has separate CRM, property, travel, profile, payment, approval, email, notification and BH Realtors areas.
- The current package declares Vite 8.1.5.
- Existing source contains a large historical migration set and several recent RBAC/security hardening migrations.
- The repository also contains a mobile-app directory; this audit focuses on the current web application.

## CRM audit
Existing CRM infrastructure is present.
- crm_leads and crm_follow_ups are present.
- Contact form to CRM lead automation exists.
- Inspection booking to CRM lead automation exists.
- CRM workspace includes lead assignment/follow-up fields.
Current issue: CRM is not yet the single business-system record for every customer/service journey. Lead data also mixes service-specific fields such as estate_interest with general lead information.

## Admin approval audit
Existing Approval Centre covers admin requests, listing requests, payments and withdrawals.
Current issue: AdminApprovalsHub.tsx still contains hard-coded approver role sets for admin requests, payments, listings and withdrawals. This duplicates the RBAC permission system and can cause business rules to diverge.
Backend protection is stronger: pending_admin_requests has RLS/security migrations, and payment/withdrawal/listing approval guards exist.

## RBAC audit
Current access resolution combines legacy user_roles, admin_roles, explicit admin_permissions and role_permissions.
Current issue: the application has both canonical permission checks and legacy role compatibility. rbac.ts also defines a broad ADMIN_ROLE_NAMES set, and AuthContext.tsx contains a compatibility path that grants broad admin permissions for legacy admin/super_admin roles. Some modules still contain direct role comparisons or hard-coded role sets.
Required direction: one canonical model of business role -> department/scope -> permission -> action. Legacy compatibility should be removed only after all consumers are migrated and tested.

## Profile audit
Two profile form implementations exist: src/components/profile/NewProfileForm.tsx and src/components/profile/ProfileForm.tsx. Profile.tsx currently renders NewProfileForm.
Important inconsistency: NewProfileForm writes profile_completed=true and profile_completion_percentage=100 on save, while ProfileForm calculates a real completion percentage. Dashboard widgets also consume completion data.
Required direction: one profile workflow, one completion calculation, one definition of complete, save-progress support, mobile-first multi-step UX, and clear separation of ordinary profile data from KYC/document data.

## Estate / land / property audit
The estate table already contains name, location, phase, size, category/type, media, plot totals, sold plots, sold-out state, sale/rent flags, promo_price, prelaunch_price and actual_price.
Admin property management already supports search, filters, create, edit, delete, real-time updates, property form and documentation pricing.
Current issue: multiple price fields can be edited directly and checkout resolves a price from those fields. There is not yet one clearly governed authoritative price/version model covering public display, checkout, approvals and history.
Later requirement: estate -> phase -> plot/inventory, authoritative price model, effective date/version, promotions, fees, approval history and payment price snapshots.

## Travel booking audit
Travel infrastructure exists: /travels, /travels/booking/:token, TravelsBookingForm.tsx, submit-travel-booking, manage-travel-booking, booking status workflow and a PostHog travel_enquiry_submitted event.
The form collects customer identity, destination, dates, travellers, package and notes. CAPTCHA is currently disabled in the form.
Current issue: the booking flow should become part of the common CRM/customer/service lifecycle rather than remaining a separate enquiry path.

## Notification audit
AdminNotificationCenter already handles contact messages, admin requests and property inquiries with realtime Supabase subscriptions.
Current issue: notifications are assembled directly from multiple tables. The later phase should provide a consistent activity/notification model tied to customer, service, action and state.

## UI/UX audit
The application uses Tailwind, shadcn/ui, Radix primitives, Lucide and responsive utilities, but several visual systems coexist: dark admin surfaces, public estate styling, older profile styling and newer rounded/glass admin components.
The UI phase should therefore be a design-system consolidation rather than a cosmetic page-by-page rewrite.
Mobile target: iPhone Safari/Chrome, Android Chrome, small and large phone widths, touch-friendly controls, responsive tables/forms and no desktop-only interaction assumptions.

## Build / verification status
A historical build_output.txt records a successful Vite 5.4.10 build with 4,548 modules. This is not current verification because package.json now declares Vite 8.1.5.
No GitHub Actions workflow run was attached to the current HEAD during this audit.
A fresh local clone/build could not be executed in this audit environment because outbound GitHub DNS/network access is unavailable. Therefore no claim is made that the current HEAD has been freshly built here.

## Phase 1 findings
Already substantially implemented: authentication, Supabase integration, admin console, basic RBAC/permission infrastructure, CRM lead infrastructure, approval infrastructure, property/estate management, travel booking infrastructure, profile completion infrastructure, notifications, payments/Paystack backend infrastructure and BH Realtors financial/commission infrastructure.

Main structural problems:
1. Duplicate/overlapping authorization logic.
2. Duplicate profile workflows and completion rules.
3. Property price fields are not yet governed as one authoritative approved pricing model.
4. Estate inventory is primarily estate-row based rather than a complete estate/phase/plot inventory system.
5. CRM needs to become the common customer/service activity record.
6. Approval Centre needs canonical permission-driven actions without duplicated role sets.
7. Travel bookings need deeper CRM/service lifecycle integration.
8. UI components need one consistent Bridgefort design system.
9. Mobile experience needs systematic testing and component-level standardization.
10. Current build verification is stale and must be refreshed before production changes are declared complete.

## Phase 1 gate
STATUS: COMPLETE
No production business-logic or UI rewrite was made during Phase 1.
The existing architecture and the main sources of duplication/conflict are now documented. Phase 2 can begin from this baseline.
Phase 2 must not replace working modules wholesale. It should first define the canonical business rules and data contracts that the existing modules will migrate toward.