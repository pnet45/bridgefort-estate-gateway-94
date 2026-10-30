import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  allowedOrigin, bookingDemandRequest, createServiceClient, enforceBookingRateLimit,
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
  const country = String(body?.country ?? "").trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(country)) return jsonResponse(req, { error: "A valid two-letter country code is required." }, 400);

  const limit = await enforceBookingRateLimit(req, "cities", 30);
  if (!limit.allowed) {
    return jsonResponse(req, { error: limit.error === "rate_limit_unavailable" ? "Search is temporarily unavailable." : "Too many location searches. Please try again shortly." }, limit.error ? 503 : 429);
  }

  const supabase = createServiceClient();
  const cacheKey = `cities:${country}`;
  const { data: cached, error: cacheReadError } = await supabase
    .from("booking_demand_cache")
    .select("payload")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!cacheReadError && cached?.payload) {
    return jsonResponse(req, { data: cached.payload.data || [], metadata: cached.payload.metadata || {}, cached: true });
  }

  let upstream = await bookingDemandRequest("/common/locations/cities", {
    country,
    languages: ["en-gb"],
    rows: 1000,
  });
  if (!upstream.ok) {
    return jsonResponse(req, { error: upstream.message, requestId: upstream.requestId || null }, upstream.status,
      upstream.retryAfter ? { "Retry-After": upstream.retryAfter } : {});
  }

  // Demand API v3.2 paginates common/location results through metadata.next_page.
  // Follow a bounded number of pages so large countries do not silently lose cities.
  const allCities: unknown[] = Array.isArray(upstream.data?.data) ? [...upstream.data.data] : [];
  let nextPage = upstream.data?.metadata?.next_page;
  let pageCount = 1;
  while (typeof nextPage === "string" && nextPage && pageCount < 20) {
    upstream = await bookingDemandRequest("/common/locations/cities", {
      country,
      languages: ["en-gb"],
      rows: 1000,
      page: nextPage,
    });
    if (!upstream.ok) {
      return jsonResponse(req, { error: upstream.message, requestId: upstream.requestId || null }, upstream.status,
        upstream.retryAfter ? { "Retry-After": upstream.retryAfter } : {});
    }
    if (Array.isArray(upstream.data?.data)) allCities.push(...upstream.data.data);
    nextPage = upstream.data?.metadata?.next_page;
    pageCount += 1;
  }
  if (typeof nextPage === "string" && nextPage) {
    return jsonResponse(req, { error: "This destination has too many city records to load at once. Please search by country instead." }, 422);
  }

  const payload = {
    data: allCities,
    metadata: { total_results: allCities.length },
  };
  const { error: cacheWriteError } = await supabase.from("booking_demand_cache").upsert({
    cache_key: cacheKey,
    payload,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "cache_key" });
  if (cacheWriteError) console.warn("Booking city cache write failed", cacheWriteError);
  return jsonResponse(req, { ...payload, cached: false });
});
