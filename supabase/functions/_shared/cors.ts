const DEFAULT_ORIGINS = [
  "https://bridgeforthomes.com",
  "https://www.bridgeforthomes.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

function allowedOrigins(): Set<string> {
  const configured = (Deno.env.get("APP_URLS") || Deno.env.get("APP_URL") || "")
    .split(/[;,\s]+/)
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return new Set([...DEFAULT_ORIGINS, ...configured]);
}

export function corsHeaders(request: Request, methods = "POST, OPTIONS"): HeadersInit {
  const origin = request.headers.get("Origin");
  const allowed = allowedOrigins();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": methods,
    "Vary": "Origin",
  };

  if (origin && allowed.has(origin.replace(/\/$/, ""))) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export function corsJson(request: Request, body: unknown, status = 200, methods = "POST, OPTIONS") {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request, methods), "Content-Type": "application/json" },
  });
}
