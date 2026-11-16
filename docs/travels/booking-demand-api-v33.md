# Bridgefort Travels — Booking.com Demand API 3.3

## Integration model

This branch prepares a **Search, Look and Redirect** accommodation integration. It does not implement Search, Look and Book, create orders, collect payment, or confirm reservations inside Bridgefort.

1. **Destination lookup:** `POST /3.3/common/autocomplete` returns ranked city suggestions from a free-text query. The UI requests suggestions after the visitor enters at least three characters; the browser component retains results only in page state.
2. **Search:** `POST /3.3/accommodations/search` finds accommodation IDs and available starting prices for the selected dates and guest count.
3. **Property details:** `POST /3.3/accommodations/details` enriches the first 20 results with names, photos, descriptions, facilities and policies.
4. **Look:** `POST /3.3/accommodations/availability` retrieves current prices and availability for a selected property.
5. **Redirect:** the browser opens only the HTTPS web URL returned by Booking.com availability, after the server validates its hostname.

Live prices and availability are never cached locally. Booking.com completes the reservation, payment (where applicable), and confirmation.

## Server-side configuration

The Demand API requires both an API key token and an Affiliate ID. Configure these as Supabase Edge Function secrets only; never add credential values to GitHub, Vercel client variables, or browser code:

- `BOOKING_DEMAND_API_KEY` — Booking.com Demand API bearer token.
- `BOOKING_DEMAND_AFFILIATE_ID` — the affiliate ID assigned to the API user.
- `BOOKING_DEMAND_ENV` — `sandbox` for testing; change to `production` only after partner approval and explicit release approval.
- `BOOKING_DEMAND_ALLOWED_ORIGINS` — comma-separated approved preview origins if preview testing needs them. Production Bridgefort domains and localhost development are already allow-listed.

The default upstream is `https://demandapi-sandbox.booking.com/3.3`. Production is `https://demandapi.booking.com/3.3`.

No credentials are committed. This repository review cannot inspect or expose project secrets. Until the authorised partner credentials are configured, the functions return a controlled configuration error.

## Edge Functions

- `booking-demand-cities`
- `booking-demand-search`
- `booking-demand-look`

The functions are public browser proxies (`verify_jwt = false`) because accommodation discovery is a public website feature. They validate request payloads and browser origin, apply persistent rate limiting through the existing `consume_leo_public_rate_limit(text, integer, integer)` RPC, and keep the Booking.com token server-side. The service-role key is never returned to the client.

The rate-limit identity uses platform-provided `cf-connecting-ip` or `x-real-ip` headers. It deliberately does not trust client-supplied `x-forwarded-for`. If neither platform header is present, requests share a conservative fallback bucket.

## Database impact

No new database table, migration, or grant is required by this implementation. The rate-limit RPC already exists in the production database and was verified read-only. No production database change is part of this branch.

## Front-end behaviour

The accommodation search section is added alongside existing Bridgefort destination cards, travel packages and enquiry form. It does not replace or modify the existing travel enquiry-to-CRM workflow. Customers who prefer a consultant can still use the existing Bridgefort enquiry form.

The country selector is limited to destinations already featured on the Travels page. Visitors can enter at least three characters to retrieve ranked city autocomplete suggestions, select one, and search by its destination ID. If no city is selected, search is scoped to the selected country.

## Validation checklist

- Obtain valid sandbox API key and Affiliate ID from the authorised Partner Centre account.
- Configure secrets in a non-production test environment.
- Verify autocomplete suggestions, empty results and API error handling.
- Verify Search request validation, property details and empty results.
- Verify Look returns current availability and a valid HTTPS Booking.com web URL.
- Verify invalid redirect hosts are rejected and no arbitrary URL is accepted from the browser.
- Verify rate limits and upstream 429 responses are handled without aggressive retries.
- Verify existing travel packages, enquiry form, CRM trigger and admin booking management remain unchanged.
- Complete TypeScript/lint/build and preview checks before requesting review.
- Do not deploy Edge Functions or change production secrets without explicit release approval.
