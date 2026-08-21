import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function getUsdToNgnRate(): Promise<number> {
  try { const res = await fetch("https://open.er-api.com/v6/latest/USD"); if (res.ok) { const data = await res.json(); const rate = data?.rates?.NGN; if (typeof rate === "number" && rate > 0) return rate; } } catch (e) { console.error("FX primary failed", e); }
  try { const res = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=NGN"); if (res.ok) { const data = await res.json(); const rate = data?.rates?.NGN; if (typeof rate === "number" && rate > 0) return rate; } } catch (e) { console.error("FX fallback failed", e); }
  return 1600;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims) return json({ error: "Invalid authentication" }, 401);
    const userId = claimsData.claims.sub as string;
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) return json({ error: "Stripe not configured" }, 500);
    const body = await req.json();
    const { email, reference, metadata, description } = body;
    if (!reference) return json({ error: "Order reference is required" }, 400);
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { data: order, error: orderError } = await admin.from("orders").select("id, user_id, total_amount, payment_status, items").eq("payment_reference", reference).maybeSingle();
    if (orderError || !order) return json({ error: "Order not found" }, 404);
    if (order.user_id !== userId) return json({ error: "Forbidden" }, 403);
    if (order.payment_status === "paid") return json({ error: "This order has already been paid" }, 400);
    const amount = Number(order.total_amount);
    if (!email || !Number.isFinite(amount) || amount <= 0) return json({ error: "Invalid order amount or email" }, 400);

    const rate = await getUsdToNgnRate();
    const amountUsdCents = Math.max(50, Math.round((amount / rate) * 100));
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("payment_method_types[]", "card");
    params.append("customer_email", email);
    params.append("client_reference_id", reference);
    params.append("success_url", `${origin}/payment-success?stripe_session_id={CHECKOUT_SESSION_ID}&reference=${encodeURIComponent(reference)}`);
    params.append("cancel_url", `${origin}/cart`);
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][unit_amount]", String(amountUsdCents));
    params.append("line_items[0][price_data][product_data][name]", description || "Bridgefort Homes Property Payment");
    params.append("line_items[0][price_data][product_data][description]", `Authoritative order amount ₦${amount.toLocaleString()} converted at ₦${rate.toFixed(2)}/USD`);
    params.append("line_items[0][quantity]", "1");
    params.append("metadata[user_id]", userId);
    params.append("metadata[order_id]", String(order.id));
    params.append("metadata[reference]", reference);
    params.append("metadata[ngn_amount]", String(amount));
    params.append("metadata[fx_rate]", String(rate));

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString() });
    const session = await stripeRes.json();
    if (!stripeRes.ok) return json({ error: session?.error?.message || "Stripe error" }, stripeRes.status);

    return json({ status: true, session_id: session.id, url: session.url, fx_rate: rate, amount_usd_cents: amountUsdCents, order_id: order.id, reference });
  } catch (error) {
    console.error("stripe-initialize error", error);
    return json({ error: "An error occurred creating the Stripe checkout" }, 500);
  }
});