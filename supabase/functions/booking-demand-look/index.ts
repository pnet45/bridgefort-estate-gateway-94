import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  allowedOrigin, bookingDemandRequest, enforceBookingRateLimit, jsonResponse,
  parseJson, safeBookingWebUrl, validIsoDate,
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

  const body = await parseJson(req, 2_048);
  if (!body) return jsonResponse(req, { error: "Invalid request." }, 400);
  const accommodation = Number(body.accommodation);
  if (!Number.isSafeInteger(accommodation) || accommodation <= 0) {
    return jsonResponse(req, { error: "A valid accommodation ID is required." }, 400);
  }
  if (!validIsoDate(body.checkin) || !validIsoDate(body.checkout) || String(body.checkout) <= String(body.checkin)) {
    return jsonResponse(req, { error: "Enter valid check-in and check-out dates." }, 400);
  }
  const adults = Number(body.adults ?? 2);
  const rooms = Number(body.rooms ?? 1);
  if (!Number.isInteger(adults) || adults < 1 || adults > 20 || !Number.isInteger(rooms) || rooms < 1 || rooms > 10) {
    return jsonResponse(req, { error: "Guest or room count is outside the supported range." }, 400);
  }
  const bookerCountry = String(body.bookerCountry ?? "ng").trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(bookerCountry)) return jsonResponse(req, { error: "Invalid traveller country." }, 400);

  const limit = await enforceBookingRateLimit(req, "look", 30);
  if (!limit.allowed) {
    return jsonResponse(req, { error: limit.error === "rate_limit_unavailable" ? "Availability is temporarily unavailable." : "Too many availability checks. Please wait a moment." }, limit.error ? 503 : 429);
  }

  const availability = await bookingDemandRequest("/accommodations/availability", {
    accommodations: [accommodation],
    booker: { country: bookerCountry, platform: body.platform === "mobile" ? "mobile" : "desktop" },
    checkin: body.checkin,
    checkout: body.checkout,
    guests: { number_of_adults: adults, number_of_rooms: rooms },
    extras: ["extra_charges"],
  });
  if (!availability.ok) {
    return jsonResponse(req, { error: availability.message, requestId: availability.requestId || null }, availability.status,
      availability.retryAfter ? { "Retry-After": availability.retryAfter } : {});
  }

  const item = Array.isArray(availability.data?.data)
    ? availability.data.data.find((value: any) => Number(value.id) === accommodation) || availability.data.data[0]
    : null;
  if (!item) return jsonResponse(req, { error: "No current availability was returned for this property." }, 404);

  const redirectUrl = safeBookingWebUrl(item.url);
  return jsonResponse(req, {
    data: item,
    redirectUrl,
    redirectAvailable: Boolean(redirectUrl),
    requestId: availability.data?.request_id || null,
  });
});
