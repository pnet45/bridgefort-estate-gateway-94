import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  validateTravelPartnerSearch,
  type TravelPartnerSearchInput,
} from "../_shared/booking-demand.ts";

const ALLOWED_ORIGINS = new Set([
  "https://bridgeforthomes.com",
  "https://www.bridgeforthomes.com",
  "http://localhost:5173",
]);

function response(req: Request, body: unknown, status = 200) {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "authorization, x-client-info, apikey, content-type";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return response(req, { error: "Origin not allowed" }, 403);
  if (req.method === "OPTIONS") return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    },
  });
  if (req.method !== "POST") return response(req, { error: "Method not allowed" }, 405);
  if (!(req.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
    return response(req, { error: "Content-Type must be application/json" }, 415);
  }

  let input: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 8_192) return response(req, { error: "Search request is too large" }, 413);
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return response(req, { error: "Invalid search request" }, 400);
    input = parsed;
  } catch {
    return response(req, { error: "Invalid JSON search request" }, 400);
  }

  const kind = input.kind;
  if (kind !== "accommodations" && kind !== "attractions") {
    return response(req, { error: "Unsupported travel search type" }, 400);
  }
  const city = typeof input.city === "number" && Number.isSafeInteger(input.city) && input.city !== 0 ? input.city : undefined;
  const country = typeof input.country === "string" ? input.country.trim().toLowerCase() : "";
  const currency = typeof input.currency === "string" ? input.currency.trim().toUpperCase() : "";
  const searchInput: TravelPartnerSearchInput = {
    kind,
    ...(city !== undefined ? { city } : { country }),
    checkin: input.checkin as string,
    checkout: input.checkout as string,
    currency,
    bookerCountry: typeof input.bookerCountry === "string" ? input.bookerCountry.toLowerCase() : "ng",
    platform: input.platform === "mobile" ? "mobile" : "desktop",
    adults: Number(input.adults ?? 2),
    rooms: Number(input.rooms ?? 1),
  };
  const validationError = validateTravelPartnerSearch(searchInput);
  if (validationError) return response(req, { error: validationError }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const apiKey = Deno.env.get("BOOKING_DEMAND_API_KEY");
  const affiliateId = Deno.env.get("BOOKING_AFFILIATE_ID");
  const apiBase = Deno.env.get("BOOKING_DEMAND_BASE_URL") || "https://demandapi.booking.com/3.3";
  if (!supabaseUrl || !serviceRoleKey || !apiKey || !affiliateId) {
    console.error("Booking.com Demand API configuration is incomplete");
    return response(req, { error: "Travel partner search is not configured yet" }, 503);
  }
  if (!/^\d+$/.test(affiliateId) || !/^https:\/\/demandapi(?:-sandbox)?\.booking\.com\/3\.3$/.test(apiBase)) {
    console.error("Booking.com Demand API configuration failed validation");
    return response(req, { error: "Travel partner configuration is invalid" }, 503);
  }

  const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip");
  if (!clientIp?.trim()) {
    console.error("Booking.com search could not identify the requesting client IP for rate limiting");
    return response(req, { error: "Travel search is temporarily unavailable" }, 503);
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const rateKey = `booking-demand:${await sha256(clientIp.trim().slice(0, 128))}`;
  const { data: rateAllowed, error: rateError } = await supabase.rpc("consume_leo_public_rate_limit", {
    p_rate_key: rateKey,
    p_limit: 20,
    p_window_seconds: 900,
  });
  if (rateError) {
    console.error("Booking.com search rate-limit check failed", rateError.message);
    return response(req, { error: "Travel search is temporarily unavailable" }, 503);
  }
  if (rateAllowed !== true) return response(req, { error: "Too many searches. Please try again in 15 minutes." }, 429);

  let payload: Record<string, unknown>;
  let endpoint: string;
  if (kind === "accommodations") {
    payload = {
      booker: {
        country: searchInput.bookerCountry || "ng",
        platform: searchInput.platform || "desktop",
      },
      checkin: searchInput.checkin,
      checkout: searchInput.checkout,
      currency,
      guests: {
        number_of_adults: searchInput.adults,
        number_of_rooms: searchInput.rooms,
      },
      rows: 20,
      ...(city !== undefined ? { city } : { country }),
      extras: ["products"],
    };
    endpoint = "/accommodations/search";
  } else {
    payload = {
      currency,
      dates: { start_date: searchInput.checkin, end_date: searchInput.checkout },
      rows: 20,
      sort: { by: "most_popular" },
      ...(city !== undefined ? { cities: [city] } : { countries: [country] }),
    };
    endpoint = "/attractions/search";
  }

  try {
    const upstream = await fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Affiliate-Id": affiliateId,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });
    const result = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      console.warn("Booking.com Demand API returned non-success status", {
        endpoint,
        status: upstream.status,
      });
      return response(req, {
        error: upstream.status === 429
          ? "Travel search is busy. Please try again shortly."
          : "Travel search is temporarily unavailable.",
      }, upstream.status === 429 ? 429 : 502);
    }
    if (!isRecord(result) || !Array.isArray(result.data)) {
      console.error("Booking.com Demand API returned an unexpected response shape");
      return response(req, { error: "Travel search returned an unexpected response" }, 502);
    }
    return response(req, {
      kind,
      data: result.data,
      metadata: isRecord(result.metadata) ? result.metadata : {},
      request_id: typeof result.request_id === "string" ? result.request_id : null,
    });
  } catch (error) {
    console.error("Booking.com Demand API request failed", error instanceof Error ? error.message : "unknown error");
    return response(req, { error: "Travel search is temporarily unavailable. Please try again." }, 502);
  }
});
