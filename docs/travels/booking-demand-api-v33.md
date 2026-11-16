# Bridgefort Travels — Booking.com Demand API 3.3

## API version decision

This integration targets Booking.com Demand API **v3.3**, the current stable version recommended for new integrations. It uses the supported accommodation Search, Look and Redirect flow. It does not create Booking.com orders or take payment inside Bridgefort.

## Integration flow

1. **Destination lookup:** `POST /3.3/common/locations/cities` retrieves city identifiers by country. Static city reference data is cached for 24 hours.
2. **Search:** `POST /3.3/accommodations/search` finds accommodation options for the selected dates and guest count. The request asks for product information but does not cache prices.
3. **Property details:** `POST /3.3/accommodations/details` enriches the first 20 results with names, photos, descriptions, facilities and policies.
4. **Look:** `POST /3.3/accommodations/availability` retrieves current availability and pricing for the selected property.
5. **Redirect:** the browser opens only the HTTPS Booking.com web URL returned by the availability endpoint after server-side hostname validation.

Live prices and availability are never cached. Booking.com completes the reservation, payment and confirmation. Bridgefort must not display a reservation as confirmed based on search or availability results alone.

## Server-side configuration

The integration requires an approved Booking.com Managed Affiliate Partner account and credentials. Configure these as Supabase Edge Function secrets only; never commit credentials or expose them in browser code:

- `BOOKING_DEMAND_API_KEY` — API bearer token.
- `BOOKING_DEMAND_AFFILIATE_ID` — affiliate ID.
- `BOOKING_DEMAND_ENV` — `sandbox` by default; use `production` only after partner access and release approval.
- `BOOKING_DEMAND_ALLOWED_ORIGINS` — optional comma-separated preview origins. Production domains are allow-listed in code.

The default API host is `https://demandapi-sandbox.booking.com/3.3`. Production uses `https://demandapi.booking.com/3.3`.

No API credentials are committed or deployed by this change. Until the required secrets are configured, the functions return a controlled configuration error.

## Edge Functions

- `booking-demand-cities`
- `booking-demand-search`
- `booking-demand-look`

These public browser proxy functions use `verify_jwt = false` because accommodation discovery is public. They enforce an exact origin allow-list, bounded JSON payloads, strict date/occupancy validation and persistent per-IP rate limits through the existing `consume_travel_enquiry_rate_limit` RPC. Booking.com credentials and the Supabase service-role key remain server-side.

## Database dependency

The migration `20261111130000_booking_demand_api_cache.sql` creates a service-role-only table for static city reference data. RLS is enabled and all privileges are revoked from `PUBLIC`, `anon` and `authenticated`. Only `service_role` can read/write it.

This migration is committed for review but **has not been applied**. Production migration execution requires a separate reviewed and approved database change. If it is not applied, city lookup still falls back to Booking.com but the persistent 24-hour cache will be unavailable.

## Preserved behaviour

- Existing Bridgefort destinations, packages, visa services and enquiry form remain in place.
- The existing travel enquiry submission and CRM trigger are not modified.
- Existing admin travel-booking workflow and permissions are not modified.
- Search, Look and Redirect only: Bridgefort does not create Booking.com orders or process payments.

## Validation and release requirements

- Configure valid sandbox API key and Affiliate ID in a non-production environment.
- Test city lookup, cache hit/expiry, search, details, availability, safe redirect validation and rate limits against Booking.com's sandbox.
- Confirm affiliate attribution remains in the returned Booking.com URL.
- Verify the existing enquiry-to-CRM workflow and admin booking management.
- Run repository Quality Gate, documentation checks, Deno checks and Vercel preview.
- Do not deploy production Edge Functions, apply the cache migration, or switch the API environment to production until credentials and migration are reviewed and approved.
