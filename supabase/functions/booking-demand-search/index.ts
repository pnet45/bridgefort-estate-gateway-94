import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  allowedOrigin, bookingDemandRequest, enforceBookingRateLimit, jsonResponse,
  parseJson, validIsoDate,
} from "../_shared/booking-demand.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    if (!allowedOrigin(req)) return jsonResponse(req, { error: "Origin not allowed" }, 403);
    return new Response(null, { headers: {
      "Access-Control-Allow-Origin": allowedOrigin(req)!,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    } });
  }
  if (req.method !== "POST") return jsonResponse(req, { error: "Method not allowed" }, 405);
  if (!allowedOrigin(req)) return jsonResponse(req, { error: "Origin not allowed" }, 403);

  const body = await parseJson(req, 4_096);
  if (!body) return jsonResponse(req, { error: "Invalid or oversized search request." }, 400);

  const country = String(body.country ?? "").trim().toLowerCase();
  const city = Number(body.city);
  const hasCity = Number.isSafeInteger(city) && city !== 0;
  if (!hasCity && !/^[a-z]{2}$/.test(country)) {
    return jsonResponse(req, { error: "Choose a destination country or city." }, 400);
  }

  const checkin = body.checkin;
  const checkout = body.checkout;
  if (!validIsoDate(checkin) || !validIsoDate(checkout) || checkout <= checkin) {
    return jsonResponse(req, { error: "Enter valid check-in and check-out dates." }, 400);
  }
  const adults = Number(body.adults ?? 2);
  const rooms = Number(body.rooms ?? 1);
  if (!Number.isInteger(adults) || adults < 1 || adults > 20 || !Number.isInteger(rooms) || rooms < 1 || rooms > 10) {
    return jsonResponse(req, { error: "Guest or room count is outside the supported range." }, 400);
  }
  const bookerCountry = String(body.bookerCountry ?? "ng").trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(bookerCountry)) return jsonResponse(req, { error: "Invalid traveller country." }, 400);
  const platform = body.platform === "mobile" ? "mobile" : "desktop";

  const limit = await enforceBookingRateLimit(req, "search", 20);
  if (!limit.allowed) {
    return jsonResponse(req, { error: limit.error === "rate_limit_unavailable" ? "Hotel search is temporarily unavailable." : "Too many hotel searches. Please wait a moment." }, limit.error ? 503 : 429);
  }

  const requestBody: Record<string, unknown> = {
    ...(hasCity ? { city } : { country }),
    booker: { country: bookerCountry, platform },
    checkin,
    checkout,
    guests: { number_of_adults: adults, number_of_rooms: rooms },
    extras: ["extra_charges", "products"],
    rows: 20,
    sort: { by: "price", direction: "ascending" },
  };

  const searchResult = await bookingDemandRequest("/accommodations/search", requestBody);
  if (!searchResult.ok) {
    return jsonResponse(req, { error: searchResult.message, requestId: searchResult.requestId || null }, searchResult.status,
      searchResult.retryAfter ? { "Retry-After": searchResult.retryAfter } : {});
  }

  const results = Array.isArray(searchResult.data?.data) ? searchResult.data.data.slice(0, 20) : [];
  const ids = results.map((item: any) => Number(item.id)).filter((id: number) => Number.isSafeInteger(id) && id > 0);
  let detailsById = new Map<number, any>();
  if (ids.length) {
    const detailsResult = await bookingDemandRequest("/accommodations/details", {
      accommodations: ids,
      extras: ["description", "photos", "facilities", "policies"],
      languages: ["en-gb"],
      rows: Math.max(10, Math.ceil(ids.length / 10) * 10),
    });
    if (detailsResult.ok && Array.isArray(detailsResult.data?.data)) {
      detailsById = new Map(detailsResult.data.data.map((item: any) => [Number(item.id), item]));
    } else if (!detailsResult.ok) {
      console.warn("Booking accommodation details lookup failed", detailsResult.message);
    }
  }

  return jsonResponse(req, {
    data: results.map((item: any) => ({ ...item, details: detailsById.get(Number(item.id)) || null })),
    metadata: searchResult.data?.metadata || {},
    requestId: searchResult.data?.request_id || null,
    detailsAvailable: detailsById.size > 0,
  });
});
