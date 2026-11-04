import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const token = authorization.slice("Bearer ".length);
    const { data: claims, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) return json({ error: "Invalid authentication" }, 401);
    const userId = String(claims.claims.sub);

    const body = await req.json();
    const orderId = String(body?.order_id ?? "");
    const amount = Number(body?.amount);
    const transferDate = String(body?.transfer_date ?? "");
    const transferReference = String(body?.transfer_reference ?? "").trim().slice(0, 120);
    const receiptPath = String(body?.receipt_path ?? "");

    if (!UUID_RE.test(orderId)) return json({ error: "Invalid order" }, 400);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000_000) return json({ error: "Enter a valid transfer amount" }, 400);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(transferDate) || Number.isNaN(Date.parse(transferDate))) return json({ error: "Enter a valid transfer date" }, 400);
    if (transferReference.length < 3) return json({ error: "Enter your bank transfer narration or reference" }, 400);

    const expectedPrefix = `${userId}/${orderId}/`;
    if (!receiptPath.startsWith(expectedPrefix) || receiptPath.includes("..") || receiptPath.length > 500) {
      return json({ error: "Invalid receipt upload path" }, 400);
    }

    const admin = createClient(url, serviceKey);
    const { data: order, error: orderError } = await admin.from("orders")
      .select("id,user_id,total_amount,amount_paid,balance,payment_status,payment_reference")
      .eq("id", orderId).eq("user_id", userId).maybeSingle();
    if (orderError || !order) return json({ error: "Order not found for this account" }, 404);
    if (["paid", "cancelled", "rejected"].includes(String(order.payment_status).toLowerCase())) {
      return json({ error: "This order is not accepting further payment submissions" }, 409);
    }

    const { data: plan, error: planError } = await admin.from("payments")
      .select("id").eq("reference", order.payment_reference).maybeSingle();
    if (planError || !plan?.id) return json({ error: "The order payment plan could not be resolved. Please contact support." }, 409);

    const { data: object, error: objectError } = await admin.storage.from("bank-transfer-receipts")
      .list(`${userId}/${orderId}`, { search: receiptPath.split("/").pop(), limit: 10 });
    const filename = receiptPath.split("/").pop() ?? "";
    if (objectError || !object?.some((entry) => entry.name === filename)) {
      return json({ error: "Receipt upload was not found. Please upload it again." }, 400);
    }

    // The database function locks the order and performs the pending-amount
    // check plus insert atomically, preventing concurrent over-submissions.
    const { data: request, error: insertError } = await admin.rpc("submit_bank_transfer_request", {
      _user_id: userId,
      _order_id: order.id,
      _amount: amount,
      _transfer_date: transferDate,
      _transfer_reference: transferReference,
      _receipt_path: receiptPath,
    });
    if (insertError || !request?.request_id) {
      console.error("Bank transfer request insert failed", insertError);
      return json({ error: insertError?.message || "Could not submit your transfer for verification" }, 400);
    }

    const { error: notificationError } = await admin.from("notifications").insert({
      user_id: userId,
      audience: "user",
      type: "payment_status",
      title: "Bank transfer submitted",
      message: `Your bank transfer of ₦${amount.toLocaleString("en-NG")} has been received and is pending verification. Your order is not marked as paid yet.`,
      link: "/dashboard",
    });
    if (notificationError) console.warn("Customer notification failed", notificationError);

    return json({ success: true, request_id: request.request_id, status: request.status, submitted_at: request.created_at });
  } catch (error) {
    console.error("submit-bank-transfer-request error", error);
    return json({ error: "Could not submit bank transfer" }, 500);
  }
});
