import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://bridgeforthomes.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (origin && origin !== "https://bridgeforthomes.com" && origin !== "https://www.bridgeforthomes.com") {
    return json({ error: "Origin not allowed" }, 403);
  }
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const key = Deno.env.get("BOOKING_DEMAND_API_KEY");
  const affiliateId = Deno.env.get("BOOKING_AFFILIATE_ID");
  const apiBase = Deno.env.get("BOOKING_DEMAND_BASE_URL") || "https://demandapi.booking.com/3.3";
  if (!key || !affiliateId) return json({ error: "Travel partner search is not configured yet" }, 503);
  if (!/^\d+$/.test(affiliateId)) return json({ error: "Travel partner configuration is invalid" }, 503);
  if (!/^https:\/\/demandapi(?:-sandbox)?\.booking\.com\/3\.3$/.test(apiBase)) {
    console.error("Invalid Booking.com API base URL configuration");
    return json({ error: "Travel partner configuration is invalid" }, 503);
  }

  let input: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 12_000) return json({ error: "Search request is too large" }, 413);
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return json({ error: "Invalid search request" }, 400);
    input = parsed;
  } catch {
    return json({ error: "Invalid JSON search request" }, 400);
  }

  const kind = input.kind;
  if (kind !== "accommodations" && kind !== "attractions") return json({ error: "Unsupported travel search type" }, 400);
  const checkin = input.checkin;
  const checkout = input.checkout;
  const currency = typeof input.currency === "string" ? input.currency.toUpperCase() : "";
  if (!validDate(checkin) || !validDate(checkout) || checkout <= checkin) {
    return json({ error: "Valid check-in and check-out dates are required" }, 400);
  }
  if (!/^[A-Z]{3}$/.test(currency)) return json({ error: "A valid ISO currency code is required" }, 400);

  const country = typeof input.country === "string" ? input.country.toLowerCase() : "";
  const city = typeof input.city === "number" && Number.isInteger(input.city) ? input.city : null;
  if (!(city !== null || /^[a-z]{2}$/.test(country))) {
    return json({ error: "Provide a supported Booking.com city ID or two-letter country code" }, 400);
  }

  let payload: Record<string, unknown>;
  let endpoint: string;
  if (kind === "accommodations") {
    const adults = Number(input.adults ?? 2);
    const rooms = Number(input.rooms ?? 1);
    if (!Number.isInteger(adults) || adults < 1 || adults > 30 || !Number.isInteger(rooms) || rooms < 1 || rooms > 10) {
      return json({ error: "Guest and room counts are outside supported limits" }, 400);
    }
    payload = {
      booker: { country: /^[a-z]{2}$/.test(country) ? country : "ng", platform: "desktop" },
      checkin,
      checkout,
      currency,
      guests: { number_of_adults: adults, number_of_rooms: rooms },
      rows: 20,
      ...(city !== null ? { city } : { country }),
      extras: ["products"],
    };
    endpoint = "/accommodations/search";
  } else {
    const dates = { start_date: checkin, end_date: checkout };
    payload = {
      currency,
      dates,
      rows: 20,
      sort: { by: "most_popular" },
      ...(city !== null ? { cities: [city] } : { countries: [country] }),
    };
    endpoint = "/attractions/search";
  }

  try {
    const response = await fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "X-Affiliate-Id": affiliateId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("Booking.com Demand API returned non-success status", response.status);
      return json({ error: response.status === 429 ? "Travel search is busy. Please try again shortly." : "Travel search is temporarily unavailable." }, response.status === 429 ? 429 : 502);
    }
    if (!isRecord(result) || !Array.isArray(result.data)) {
      console.error("Booking.com Demand API returned an unexpected response shape");
      return json({ error: "Travel search returned an unexpected response" }, 502);
    }
    // Dynamic prices and availability are returned live and are never cached here.
    return json({ kind, data: result.data, metadata: result.metadata ?? {}, request_id: result.request_id ?? null });
  } catch (error) {
    console.error("Booking.com Demand API request failed", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Travel search is temporarily unavailable. Please try again." }, 502);
  }
});
