# Bridgefort Travels — Booking.com Demand API 3.2

## API version decision

This implementation targets Demand API v3.2. Booking.com currently lists v3.3 as the latest stable version and v3.2 as a supported, frozen version. v3.2 is retained here as an explicit compatibility target for this staged implementation; it must not be described as the newest API. Before production release, confirm partner-account access and decide whether to keep v3.2 or migrate this branch to v3.3. Do not change the API version or endpoint paths without a separate compatibility review and sandbox tests.

## Integration model

This branch prepares a **Search, Look and Redirect** accommodation integration. It does not implement Search, Look and Book, create orders, collect payment, or confirm reservations inside Bridgefort.

1. **Destination lookup:** `POST /3.2/common/locations/cities` loads city IDs by country. City reference data is cached for 24 hours.
2. **Search:** `POST /3.2/accommodations/search` finds accommodation IDs and available starting prices for the selected dates and guest count.
3. **Property details:** `POST /3.2/accommodations/details` enriches the first 20 results with names, photos, descriptions, facilities and policies.
4. **Look:** `POST /3.2/accommodations/availability` retrieves current prices and availability for a selected property.
5. **Redirect:** the browser opens only the HTTPS web URL returned by Booking.com availability, after the server validates its hostname.

Live prices and availability are never stored in the local cache. Booking.com completes the reservation, payment (where applicable), and confirmation.

## Server-side configuration

Obtain access through the Booking.com Managed Affiliate Partner programme and Partner Centre. The Demand API requires both an API key token and an Affiliate ID on every request.

Configure these as Supabase Edge Function secrets only; never add credential values to GitHub, Vercel client variables, or browser code:

- `BOOKING_DEMAND_API_KEY` — Booking.com Demand API bearer token.
- `BOOKING_DEMAND_AFFILIATE_ID` — the affiliate ID assigned to the API user.
- `BOOKING_DEMAND_ENV` — `sandbox` for testing; change to `production` only after partner approval and explicit release approval.
- `BOOKING_DEMAND_ALLOWED_ORIGINS` — comma-separated, explicitly approved preview origins if preview testing needs them. Production Bridgefort domains and localhost development are already allow-listed.

The default upstream is `https://demandapi-sandbox.booking.com/3.2`. Production is `https://demandapi.booking.com/3.2`.

No credentials are committed or configured by this PR. Until valid credentials are supplied, the functions return a controlled configuration error.

## Edge Functions

- `booking-demand-cities`
- `booking-demand-search`
- `booking-demand-look`

The functions are public browser proxies (`verify_jwt = false`) because hotel discovery is a public website feature. They validate request payloads and origin, apply persistent per-IP rate limiting using the Stage 1.5 server-side rate-limit function, and keep the Booking.com token server-side. The service-role key is never returned to the client.

## Database dependency

- Stage 1.5 migration `20261030010000_travel_enquiry_security_and_permissions.sql` provides the shared persistent rate-limit RPC.
- This branch adds `20261030020000_booking_demand_api_cache.sql` for a service-role-only static reference cache.
- Neither migration has been applied. Both remain blocked by the outstanding Supabase migration-history reconciliation and require explicit approval before application.

## Front-end behaviour

The new accommodation search section is added alongside existing Bridgefort destination cards, travel packages and enquiry form. It does not replace or modify the existing travel enquiry-to-CRM workflow. Customers who prefer a consultant can still use the existing Bridgefort enquiry form.

The initial destination selector covers the destinations already featured on the Travels page. A city is selected from Booking.com city lookup results; if no city is selected, search is scoped to the selected country.

## Validation checklist

- Obtain valid sandbox API key and Affiliate ID from the authorised Partner Centre account.
- Configure secrets in a non-production test environment.
- Verify cities lookup, cache hit, cache expiry and API error handling.
- Verify Search request validation, result pagination metadata, property details and empty results.
- Verify Look returns current availability and a valid HTTPS Booking.com web URL.
- Verify invalid redirect hosts are rejected and no arbitrary URL is accepted from the browser.
- Verify rate limits and upstream 429 responses are handled without aggressive retries.
- Verify existing travel packages, booking enquiry form, CRM trigger and admin booking management remain unchanged.
- Complete TypeScript/lint/build and preview checks before requesting review.
- Do not deploy Edge Functions, apply migrations, change production secrets, or promote a production deployment without approval.
