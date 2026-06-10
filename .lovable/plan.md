
# Bridgefort Travels — New Page & Services Integration

Add a dedicated, richly designed **Bridgefort Travels** page at `/travels`, and surface it as a new service on the Services page and main navigation.

## What gets built

### 1. New page: `/travels` (Bridgefort Travels)
A full marketing page using the existing logo-derived theme tokens (indigo/violet), `font-display` headings, and the site's Navbar/Footer chrome. Sections:

- **Hero** — Full-width image background with gradient overlay, headline "Explore the World with Bridgefort Travels", subheadline, dual CTAs (Plan My Trip → Contact, Browse Packages → scroll).
- **Intro / Value Props** — 4 cards: Visa Assistance, Flight Bookings, Hotel Reservations, Tour Packages. Icons from lucide-react (Plane, Hotel, MapPin, FileCheck).
- **Featured Destinations** — Grid of 6 destinations (Dubai, London, Istanbul, Cape Town, Bali, New York) with image, country, "from ₦" price hint, hover lift.
- **Travel Packages** — 3 tiered packages (Explorer / Premium / Luxury) with included perks and "Enquire" buttons.
- **Visa Services** — Two-column section listing supported visa categories (Tourist, Business, Student, Medical, Pilgrimage) with checklist styling.
- **How It Works** — 4-step process (Consult → Plan → Book → Travel) with numbered cards and framer-motion scroll reveals.
- **Why Choose Bridgefort Travels** — 3-column trust block (Licensed, 24/7 Support, Best Price Guarantee).
- **Testimonials** — 3 traveler quotes.
- **FAQ** — Accordion with 5 common travel questions.
- **CTA Section** — Gradient indigo→violet band with "Start Planning" button → `/contact`.

All sections use the existing `container-custom`, `section-padding`, `btn-cta`, `text-gradient`, and motion patterns already in the codebase (mirrors `Buy2Sell`/`Services` page composition).

### 2. Services page integration
- Add a **Travels** card to `src/components/home/InvestmentServices.tsx` services array (icon: `Plane`, link: `/travels`, flagged `isCallToAction`).
- Add a **Bridgefort Travels** feature block to `src/pages/Services.tsx` (between `AdditionalServices` and `BuyAndResellFeature`) — short teaser card with image, 3 bullets, and "Visit Bridgefort Travels" button → `/travels`.

### 3. Navigation
- Add `{ to: '/travels', label: 'Travels' }` to `src/components/navbar/AnimatedNavLinks.tsx` (placed after Training).
- Add the same entry to `src/components/navbar/MobileMenu.tsx` and `NavLinks.tsx` for parity.

### 4. Routing
- Register `<Route path="/travels" element={<Travels />} />` in `src/App.tsx`.

### 5. Imagery
Generate 3 images via imagegen (fast tier, jpg):
- `src/assets/travels-hero.jpg` — cinematic airplane wing over clouds at sunset.
- `src/assets/travels-destinations.jpg` — collage-style world landmarks.
- `src/assets/travels-feature.jpg` — passport + boarding pass flatlay for Services teaser.
Destination cards use Unsplash-style stock URLs already used elsewhere or reuse generated hero crops to keep cost down.

## Technical notes
- Files created:
  - `src/pages/Travels.tsx`
  - `src/components/travels/TravelsHero.tsx`
  - `src/components/travels/TravelValueProps.tsx`
  - `src/components/travels/FeaturedDestinations.tsx`
  - `src/components/travels/TravelPackages.tsx`
  - `src/components/travels/VisaServices.tsx`
  - `src/components/travels/HowItWorks.tsx`
  - `src/components/travels/WhyChooseTravels.tsx`
  - `src/components/travels/TravelsTestimonials.tsx`
  - `src/components/travels/TravelsFAQ.tsx`
  - `src/components/travels/TravelsCTA.tsx`
  - `src/components/services/TravelsFeature.tsx`
- Files edited: `src/App.tsx`, `src/pages/Services.tsx`, `src/components/home/InvestmentServices.tsx`, `src/components/navbar/AnimatedNavLinks.tsx`, `src/components/navbar/MobileMenu.tsx`, `src/components/navbar/NavLinks.tsx`.
- SEO: page sets `<title>Bridgefort Travels — Flights, Visas & Tours</title>`, meta description, single H1, alt text on all images, JSON-LD `TravelAgency` schema.
- No database or backend changes. Enquiry buttons route to existing `/contact` page.
