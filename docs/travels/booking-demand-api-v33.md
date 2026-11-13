# Bridgefort Travels — Booking.com Demand API v3.3

## Scope

The Travels page uses a server-side Booking.com Demand API v3.3 proxy for accommodation and attraction discovery. Booking.com remains the booking and payment destination. The website does not collect or store Booking.com credentials, live prices, availability, or reservation details.

The implementation uses:
- `POST /accommodations/search` for accommodation discovery.
- `POST /attractions/search` for experience discovery.
- Booking.com URLs returned by the API for outbound redirects.
- The existing service-role-only `consume_leo_public_rate_limit` database RPC for per-IP throttling.

The code does not create a new database table or migration. Live prices and availability are never cached.

## Required Supabase Edge Function secrets

Configure these secrets in the Supabase project before enabling live search:

| Secret | Required | Purpose |
| --- | --- | --- |
| `BOOKING_DEMAND_API_KEY` | Yes | Booking.com Demand API bearer token |
| `BOOKING_AFFILIATE_ID` | Yes | Numeric Booking.com affiliate identifier |
| `BOOKING_DEMAND_BASE_URL` | No | Defaults to `https://demandapi.booking.com/3.3`; use `https://demandapi-sandbox.booking.com/3.3` for approved sandbox testing |

The token and affiliate ID must be issued for the Bridgefort partner account. Do not commit either value to GitHub, Vercel environment variables, client code, or browser storage. Set them only as Supabase Edge Function secrets.

## Runtime controls

- Function slug: `booking-demand-api`
- JWT gateway verification is disabled because this is a public search endpoint; the function independently enforces an exact browser-origin allow-list, POST-only requests, JSON content type, 8 KB body limit, strict field/date validation and a 20-request / 15-minute per-IP limit.
- The function uses the Supabase service role only for the existing atomic rate-limit RPC. The service key is never returned to the client.
- The API base URL is restricted to Booking.com's official Demand API v3.3 production or sandbox host.
- Search results use `Cache-Control: no-store`; prices and availability are always requested live.
- Redirects are only accepted for HTTPS URLs on `booking.com` or `www.booking.com`.

## Date validation

Accommodation check-in must be within 500 days, with a stay of 1–90 nights. Attraction dates must be within 180 days, with a range of up to 90 days. These limits are validated before calling Booking.com.

## Production readiness checklist

1. Confirm the partner account has Demand API v3.3 access and valid credentials.
2. Set the three secrets above (the base URL is optional).
3. Deploy the `booking-demand-api` Edge Function with `verify_jwt = false`.
4. Smoke-test one accommodation search and one attraction search using the production site.
5. Confirm affiliate attribution on the Booking.com redirect and verify rate-limit responses.
6. Keep the feature in a controlled state if partner access or credentials are not yet available.

## API references

- [Demand API v3.3 overview](https://developers.booking.com/demand/docs/open-api/3.3/demand-api)
- [Accommodation search](https://developers.booking.com/demand/docs/open-api/3.3/demand-api/accommodations/accommodations/search)
- [Attraction search](https://developers.booking.com/demand/docs/open-api/3.3/demand-api/attractions/search)
