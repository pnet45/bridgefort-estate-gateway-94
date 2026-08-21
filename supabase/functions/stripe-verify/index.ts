import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { queueOrderForApproval } from "../_shared/paymentApproval.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const authed = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const { data: claimsData, error: claimsError } = await authed.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsError || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);
    const callerId = claimsData.claims.sub as string;
    const { session_id } = await req.json();
    if (!session_id || typeof session_id !== "string" || !/^cs_[a-zA-Z0-9_]+$/.test(session_id)) return json({ error: "session_id required" }, 400);

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) return json({ error: "Stripe not configured" }, 500);
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } });
    const session = await res.json();
    if (!res.ok) return json({ error: "Unable to retrieve Stripe checkout session" }, res.status);
    if (session?.metadata?.user_id && session.metadata.user_id !== callerId) return json({ error: "Forbidden" }, 403);

    const reference = String(session?.client_reference_id ?? session?.metadata?.reference ?? "");
    if (!reference) return json({ error: "Order reference missing from Stripe session" }, 400);
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { data: order } = await admin.from("orders").select("id, user_id, total_amount, payment_status").eq("payment_reference", reference).maybeSingle();
    if (!order) return json({ error: "Order not found" }, 404);
    if (order.user_id !== callerId) return json({ error: "Forbidden" }, 403);

    const expectedNgn = Number(order.total_amount);
    const fxRate = Number(session?.metadata?.fx_rate ?? 0);
    const stripeUsdCents = Number(session?.amount_total ?? 0);
    const expectedUsdCents = fxRate > 0 ? Math.round((expectedNgn / fxRate) * 100) : 0;
    if (!Number.isFinite(expectedNgn) || expectedNgn <= 0 || !stripeUsdCents || !expectedUsdCents || Math.abs(stripeUsdCents - expectedUsdCents) > 1) {
      await admin.from("payments").update({ status: "amount_mismatch" }).eq("reference", reference);
      return json({ status: false, message: "Stripe payment amount does not match the order amount." }, 400);
    }

    const paid = session?.payment_status === "paid";
    if (paid) await queueOrderForApproval(admin, { reference, paidAmount: expectedNgn, channel: "Stripe" });
    return json({ status: paid, session: { id: session.id, payment_status: session.payment_status, amount_total: session.amount_total, currency: session.currency, reference } });
  } catch (e) {
    console.error("stripe-verify error", e);
    return json({ error: "An error occurred verifying the Stripe payment" }, 500);
  }
});