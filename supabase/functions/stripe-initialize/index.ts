import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fetch NGN per 1 USD from a free FX API (fallback to a sane default if unavailable)
async function getUsdToNgnRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (res.ok) {
      const data = await res.json();
      const rate = data?.rates?.NGN;
      if (typeof rate === "number" && rate > 0) return rate;
    }
  } catch (e) {
    console.error("FX primary failed", e);
  }
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=NGN");
    if (res.ok) {
      const data = await res.json();
      const rate = data?.rates?.NGN;
      if (typeof rate === "number" && rate > 0) return rate;
    }
  } catch (e) {
    console.error("FX fallback failed", e);
  }
  // Conservative fallback
  return 1600;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const userId = claimsData.claims.sub;

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const body = await req.json();
    const {
      email,
      amount, // amount in NGN
      reference,
      metadata,
      description,
    } = body;

    if (!email || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount or email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const rate = await getUsdToNgnRate();
    const amountUsd = Number(amount) / rate;
    const amountUsdCents = Math.max(50, Math.round(amountUsd * 100)); // Stripe min ~$0.50

    console.log("Stripe init:", { amountNGN: amount, rate, amountUsdCents, reference });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("payment_method_types[]", "card");
    params.append("customer_email", email);
    params.append("client_reference_id", reference || `PWAN_${Date.now()}_${userId}`);
    params.append("success_url", `${origin}/payment-success?stripe_session_id={CHECKOUT_SESSION_ID}&reference=${encodeURIComponent(reference || "")}`);
    params.append("cancel_url", `${origin}/cart`);
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][unit_amount]", String(amountUsdCents));
    params.append("line_items[0][price_data][product_data][name]", description || "PWAN Bridgefort Property Payment");
    params.append(
      "line_items[0][price_data][product_data][description]",
      `Converted from ₦${Number(amount).toLocaleString()} @ ₦${rate.toFixed(2)}/USD`
    );
    params.append("line_items[0][quantity]", "1");
    params.append("metadata[user_id]", userId);
    params.append("metadata[ngn_amount]", String(amount));
    params.append("metadata[fx_rate]", String(rate));
    if (metadata?.order_id) params.append("metadata[order_id]", String(metadata.order_id));
    if (metadata?.customer_name) params.append("metadata[customer_name]", String(metadata.customer_name));

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const session = await stripeRes.json();
    console.log("Stripe session status:", stripeRes.status);

    if (!stripeRes.ok) {
      return new Response(JSON.stringify({ error: session?.error?.message || "Stripe error", details: session }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: stripeRes.status,
      });
    }

    // Record a pending payment for tracking
    try {
      const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
      await admin.from("payments").insert([
        {
          user_id: userId,
          paystack_reference: session.id, // reuse existing column to store stripe session id
          status: "pending",
          amount: amount,
          order_id: metadata?.order_id ?? null,
        },
      ]);
    } catch (e) {
      console.error("Failed to record pending stripe payment", e);
    }

    return new Response(
      JSON.stringify({
        status: true,
        session_id: session.id,
        url: session.url,
        fx_rate: rate,
        amount_usd_cents: amountUsdCents,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("stripe-initialize error", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
