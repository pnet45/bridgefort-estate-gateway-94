import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  allowedOrigin, bookingDemandRequest, enforceBookingRateLimit,
  jsonResponse, parseJson,
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
  const country = String(body.country ?? "").trim().toLowerCase();
  const query = String(body.query ?? "").trim();
  if (!/^[a-z]{2}$/.test(country)) return jsonResponse(req, { error: "Choose a valid destination country." }, 400);
  if (query.length < 3 || query.length > 200) {
    return jsonResponse(req, { error: "Enter at least 3 characters to find a destination." }, 400);
  }

  const limit = await enforceBookingRateLimit(req, "autocomplete", 30);
  if (!limit.allowed) {
    return jsonResponse(req, { error: limit.error === "rate_limit_unavailable" ? "Destination search is temporarily unavailable." : "Too many destination searches. Please wait a moment." }, limit.error ? 503 : 429);
  }

  const result = await bookingDemandRequest("/common/autocomplete", {
    query,
    country,
    language: "en-gb",
    filters: { types: ["city"] },
  });
  if (!result.ok) {
    return jsonResponse(req, { error: result.message, requestId: result.requestId || null }, result.status,
      result.retryAfter ? { "Retry-After": result.retryAfter } : {});
  }

  const suggestions = Array.isArray(result.data?.data)
    ? result.data.data.filter((item: any) => item?.type === "city" && item?.id != null && item?.name)
    : [];
  return jsonResponse(req, {
    data: suggestions.slice(0, 10),
    requestId: result.data?.request_id || null,
  });
});
