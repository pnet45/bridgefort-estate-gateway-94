// Creates a checkout order with SERVER-COMPUTED prices.
//
// The browser may only say *what* is being bought (property id, doc type,
// quantity, plan) — never *how much* it costs. Every price is looked up here
// from the authoritative tables (estate, estate_doc_pricing,
// documentation_types, listings), the payment plan interest is applied with
// the same rules the UI displays, and the resulting order + payment-plan rows
// are written with the service role. paystack-initialize then charges the
// amount stored on the order, and paystack-verify compares the paid amount to
// it, so a tampered client total can never result in an underpriced order.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_RATES: Record<string, { months: number; rate: number }> = {
  outright: { months: 1, rate: 0 },
  "1-3": { months: 3, rate: 0.05 },
  "4-6": { months: 6, rate: 0.1 },
  "7-12": { months: 12, rate: 0.15 },
};

const AGROVEST_PLOT_PRICE = 800000;

const DOC_FIELD_BY_NAME: Record<string, string> = {
  "Survey Plan": "survey_plan",
  "Deed of Assignment": "deed_of_assignment",
  "Plot Demarcation": "plot_demarcation",
  "Plot Maintenance Fee": "plot_maintenance_fee",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) return json({ error: "Invalid authentication" }, 401);
    const userId = claimsData.claims.sub as string;

    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const planType = String(body?.plan_type ?? "outright");
    const monthsToPay = Math.max(1, Math.min(12, Number(body?.months_to_pay ?? 1) || 1));
    const customer = body?.customer ?? {};

    if (items.length === 0) return json({ error: "Cart is empty" }, 400);
    if (!PLAN_RATES[planType]) return json({ error: "Invalid payment plan" }, 400);
    const customerEmail = String(customer.email ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return json({ error: "Invalid email" }, 400);

    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // ---- Authoritative pricing -------------------------------------------
    const pricedItems: Array<Record<string, unknown>> = [];
    let principal = 0;
    let isDocumentationPurchase = false;

    for (const raw of items) {
      const quantity = Math.max(1, Math.min(50, Number(raw?.quantity ?? 1) || 1));
      const propertyId = String(raw?.property_id ?? "");
      const propertyType = String(raw?.property_type ?? "");
      const itemId = String(raw?.item_id ?? "");
      let unitPrice: number | null = null;
      let label = "";

      if (propertyType === "Agrovest") {
        unitPrice = AGROVEST_PLOT_PRICE;
        label = "Bridgefort Agrovest Estate plot";
      } else if (propertyType.startsWith("Documentation")) {
        isDocumentationPurchase = true;
        if (!UUID_RE.test(propertyId)) return json({ error: "Unknown documentation estate" }, 400);

        const { data: pricing } = await admin
          .from("estate_doc_pricing")
          .select("survey_plan, deed_of_assignment, plot_demarcation, plot_maintenance_fee")
          .eq("estate_id", propertyId)
          .maybeSingle();

        // `doc-<estateId>-<docTypeId>` = single document; anything else is
        // the complete bundle for that estate.
        const docTypeId = itemId.startsWith(`doc-${propertyId}-`)
          ? itemId.slice(`doc-${propertyId}-`.length)
          : null;

        if (docTypeId && UUID_RE.test(docTypeId)) {
          const { data: docType } = await admin
            .from("documentation_types")
            .select("name, price")
            .eq("id", docTypeId)
            .maybeSingle();
          if (!docType) return json({ error: "Unknown documentation type" }, 400);
          const field = DOC_FIELD_BY_NAME[docType.name as string];
          unitPrice = Number(
            (field && pricing ? (pricing as Record<string, number>)[field] : null) ?? docType.price ?? 0
          );
          label = String(docType.name);
        } else {
          const sum = pricing
            ? Number(pricing.survey_plan ?? 0) +
              Number(pricing.deed_of_assignment ?? 0) +
              Number(pricing.plot_demarcation ?? 0) +
              Number(pricing.plot_maintenance_fee ?? 0)
            : 0;
          if (sum <= 0) {
            const { data: allTypes } = await admin.from("documentation_types").select("price");
            unitPrice = (allTypes ?? []).reduce((t, d) => t + Number(d.price ?? 0), 0);
          } else {
            unitPrice = sum;
          }
          label = "Complete documentation bundle";
        }
      } else if (UUID_RE.test(propertyId)) {
        const { data: estate } = await admin
          .from("estate")
          .select("name, actual_price, promo_price, prelaunch_price, is_sold_out")
          .eq("id", propertyId)
          .maybeSingle();
        if (estate) {
          if (estate.is_sold_out) return json({ error: `${estate.name} is sold out` }, 400);
          unitPrice = Number(estate.actual_price ?? estate.promo_price ?? estate.prelaunch_price ?? 0);
          label = String(estate.name ?? "Estate plot");
        } else {
          const { data: listing } = await admin
            .from("listings")
            .select("title, actual_price, promo_price, prelaunch_price")
            .eq("id", propertyId)
            .maybeSingle();
          if (!listing) return json({ error: "Unknown property in cart" }, 400);
          unitPrice = Number(listing.actual_price ?? listing.promo_price ?? listing.prelaunch_price ?? 0);
          label = String(listing.title ?? "Listing");
        }
      } else {
        return json({ error: "Unknown property in cart" }, 400);
      }

      if (!unitPrice || unitPrice <= 0) return json({ error: "Price unavailable for an item in your cart" }, 400);

      principal += unitPrice * quantity;
      pricedItems.push({
        plot_id: itemId,
        property_id: propertyId,
        property_name: label,
        plot_number: raw?.plot_number ?? null,
        quantity,
        price: unitPrice,
      });
    }

    // Documentation purchases are always paid outright, no interest.
    const effectivePlan = isDocumentationPurchase ? "outright" : planType;
    const { months, rate } = PLAN_RATES[effectivePlan];
    const interestAmount = Math.round(principal * rate);
    const totalAmount = principal + interestAmount;
    const monthlyPayment = Math.ceil(totalAmount / months);
    const payAmount = effectivePlan === "outright"
      ? totalAmount
      : Math.min(totalAmount, monthlyPayment * monthsToPay);

    const reference = `PWAN_${Date.now()}_${userId}`;

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: userId,
        customer_email: customerEmail,
        customer_name: String(customer.name ?? "").slice(0, 200),
        total_amount: payAmount, // what this checkout session must collect
        payment_reference: reference,
        payment_status: "pending",
        items: pricedItems,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Failed to create order:", orderError);
      return json({ error: "Failed to create order" }, 500);
    }

    const { error: planError } = await admin.from("payments").insert({
      user_id: userId,
      property_id: String(pricedItems[0]?.property_id ?? ""),
      plan_type: effectivePlan,
      months,
      principal_amount: principal,
      interest_percent: rate * 100,
      interest_amount: interestAmount,
      total_amount: totalAmount,
      amount_paid: 0,
      balance: totalAmount,
      status: "pending",
    });
    if (planError) console.warn("Payment plan row not created:", planError.message);

    return json({
      order_id: order.id,
      reference,
      pay_amount: payAmount,
      total_amount: totalAmount,
      principal_amount: principal,
      interest_amount: interestAmount,
      plan_type: effectivePlan,
      months,
    });
  } catch (error) {
    console.error("create-checkout-order error:", error);
    return json({ error: "Failed to create order" }, 500);
  }
});
