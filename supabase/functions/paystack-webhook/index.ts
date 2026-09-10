import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { queueOrderForApproval } from "../_shared/paymentApproval.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function validSignature(payload: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const digest = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  if (digest.length !== signature.length) return false;
  let difference = 0;
  for (let index = 0; index < digest.length; index += 1) difference |= digest.charCodeAt(index) ^ signature.charCodeAt(index);
  return difference === 0;
}

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const rawPayload = await req.text();
  if (!secret || !signature || !(await validSignature(rawPayload, signature, secret))) {
    return json({ error: "Invalid webhook signature" }, 401);
  }

  try {
    const event = JSON.parse(rawPayload);
    if (event?.event !== "charge.success") return json({ received: true });

    const payment = event?.data;
    const reference = String(payment?.reference ?? "");
    const paidAmount = Number(payment?.amount ?? 0) / 100;
    if (!reference || payment?.currency !== "NGN" || !Number.isFinite(paidAmount) || paidAmount <= 0) {
      return json({ error: "Invalid payment event" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const metadataOrderId = payment?.metadata?.order_id ? String(payment.metadata.order_id) : null;

    let order: { id: string; user_id: string; total_amount: number; amount_paid: number } | null = null;
    if (metadataOrderId) {
      const { data } = await admin.from("orders")
        .select("id, user_id, total_amount, amount_paid")
        .eq("id", metadataOrderId)
        .maybeSingle();
      order = data;
    }
    if (!order) {
      const { data } = await admin.from("orders")
        .select("id, user_id, total_amount, amount_paid")
        .eq("payment_reference", reference)
        .maybeSingle();
      order = data;
    }

    if (order) {
      const outstanding = Math.max(0, Number(order.total_amount) - Number(order.amount_paid));
      if (paidAmount > outstanding + 1) {
        await admin.from("payment_gateway_events").upsert({
          gateway: "Paystack", reference, order_id: order.id, user_id: order.user_id,
          amount: paidAmount, currency: "NGN", status: "amount_mismatch",
          metadata: { source: "paystack-webhook", outstanding },
        }, { onConflict: "gateway,reference" });
        return json({ error: "Payment amount exceeds outstanding balance" }, 400);
      }

      await queueOrderForApproval(admin, {
        reference, orderId: order.id, paidAmount, channel: "Paystack",
      });
      return json({ received: true, processed: "order" });
    }

    const { data: purchase } = await admin.from("mlm_membership_purchases")
      .select("id, user_id, package_code, amount, status")
      .eq("paystack_reference", reference)
      .maybeSingle();
    if (purchase) {
      const { data: packageRow } = await admin.from("mlm_packages")
        .select("package_code, price")
        .eq("package_code", purchase.package_code)
        .maybeSingle();
      if (!packageRow || Math.abs(Number(packageRow.price) - paidAmount) > 1) {
        return json({ error: "Membership amount mismatch" }, 400);
      }

      const { data: completed } = await admin.from("mlm_membership_purchases")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", purchase.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

      if (completed) {
        await admin.from("profiles").update({
          current_package: packageRow.package_code, is_pbo: true, is_active: true,
          updated_at: new Date().toISOString(),
        }).eq("id", purchase.user_id);
      }
      await admin.from("payment_gateway_events").upsert({
        gateway: "Paystack", reference, order_id: null, user_id: purchase.user_id,
        amount: paidAmount, currency: "NGN", status: "success",
        metadata: { source: "paystack-webhook", purchase_type: "membership", package_code: purchase.package_code },
      }, { onConflict: "gateway,reference", ignoreDuplicates: true });
      return json({ received: true, processed: "membership" });
    }

    console.warn("Unmatched Paystack payment event", { reference });
    return json({ received: true, processed: "unmatched" });
  } catch (error) {
    console.error("paystack-webhook error", error);
    return json({ error: "Webhook processing failed" }, 500);
  }
});
