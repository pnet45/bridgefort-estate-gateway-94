import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const DEFAULT_ORIGINS = [
  "https://bridgeforthomes.com",
  "https://www.bridgeforthomes.com",
  "http://localhost:5173",
];

export function allowedOrigin(req: Request): string | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  const configured = (Deno.env.get("BOOKING_DEMAND_ALLOWED_ORIGINS") || "")
    .split(",").map((value) => value.trim()).filter(Boolean);
  return [...DEFAULT_ORIGINS, ...configured].includes(origin) ? origin : null;
}

export function corsHeaders(req: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(req) || "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function jsonResponse(req: Request, body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json", "Cache-Control": "no-store", ...extra },
  });
}

export function createServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function parseJson(req: Request, maxBytes = 8_192): Promise<Record<string, unknown> | null> {
  const raw = await req.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export async function enforceBookingRateLimit(
  req: Request,
  scope: string,
  maxRequests = 30,
): Promise<{ allowed: boolean; error?: string }> {
  const supabase = createServiceClient();
  const address = req.headers.get("cf-connecting-ip")
    || req.headers.get("x-real-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`booking:${scope}:${address}`),
  );
  const clientKey = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const { data, error } = await supabase.rpc("consume_travel_enquiry_rate_limit", {
    _client_key: clientKey,
    _window_seconds: 60,
    _max_requests: maxRequests,
  });
  if (error) {
    console.error("Booking Demand API rate-limit check failed", error);
    return { allowed: false, error: "rate_limit_unavailable" };
  }
  return { allowed: data === true };
}

export async function bookingDemandRequest(path: string, payload: Record<string, unknown>) {
  const apiKey = Deno.env.get("BOOKING_DEMAND_API_KEY");
  const affiliateId = Deno.env.get("BOOKING_DEMAND_AFFILIATE_ID");
  if (!apiKey || !affiliateId) {
    return { ok: false as const, status: 503, message: "Booking.com integration is not configured." };
  }

  const environment = Deno.env.get("BOOKING_DEMAND_ENV") || "sandbox";
  if (environment !== "sandbox" && environment !== "production") {
    return { ok: false as const, status: 503, message: "Booking.com integration environment is invalid." };
  }
  const baseUrl = environment === "production"
    ? "https://demandapi.booking.com/3.2"
    : "https://demandapi-sandbox.booking.com/3.2";

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "X-Affiliate-Id": affiliateId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.error("Booking Demand API network failure", error);
    return { ok: false as const, status: 502, message: "Booking.com is temporarily unavailable." };
  }

  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore malformed upstream payload */ }
  if (!response.ok) {
    const upstreamMessage = Array.isArray(data?.errors)
      ? data.errors.map((item: any) => String(item?.message || "")).filter(Boolean).join("; ")
      : "";
    console.warn("Booking Demand API returned an error", {
      path,
      status: response.status,
      requestId: data?.request_id,
    });
    return {
      ok: false as const,
      status: response.status === 429 ? 429 : response.status >= 500 ? 502 : response.status,
      message: upstreamMessage.slice(0, 500) || "Booking.com could not complete this request.",
      requestId: data?.request_id || null,
      retryAfter: response.headers.get("Retry-After") || undefined,
    };
  }
  return { ok: true as const, data };
}

export function validIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function safeBookingWebUrl(value: unknown): string | null {
  const candidate = typeof value === "string"
    ? value
    : value && typeof value === "object" && typeof (value as any).web === "string"
    ? (value as any).web
    : null;
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || !(url.hostname === "booking.com" || url.hostname.endsWith(".booking.com"))) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
