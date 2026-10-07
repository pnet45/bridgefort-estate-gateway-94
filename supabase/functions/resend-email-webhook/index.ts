import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, svix-id, svix-timestamp, svix-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", ...corsHeaders },
});

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function base64ToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function verifyResendWebhook(payload: string, headers: Headers, secret: string) {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false;

  const secretBytes = base64ToBytes(secret.replace(/^whsec_/, ""));
  const signedContent = new TextEncoder().encode(`${id}.${timestamp}.${payload}`);
  const key = await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, signedContent));
  const expected = btoa(String.fromCharCode(...digest));

  return signature.split(" ").some((item) => {
    const [version, value] = item.split(",", 2);
    return version === "v1" && value
      ? timingSafeEqual(new TextEncoder().encode(value), new TextEncoder().encode(expected))
      : false;
  });
}

function statusForEvent(type: string) {
  switch (type) {
    case "email.sent": return "sent";
    case "email.delivered": return "delivered";
    case "email.delivery_delayed": return "delayed";
    case "email.bounced": return "bounced";
    case "email.complained": return "complained";
    case "email.opened": return "opened";
    case "email.clicked": return "clicked";
    case "email.failed": return "failed";
    case "email.suppressed": return "suppressed";
    case "email.scheduled": return "queued";
    default: return null;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!webhookSecret) return json({ error: "Webhook secret is not configured" }, 503);

  const rawBody = await req.text();
  if (!(await verifyResendWebhook(rawBody, req.headers, webhookSecret))) {
    return json({ error: "Invalid webhook signature" }, 401);
  }

  try {
    const event = JSON.parse(rawBody);
    const eventType = String(event?.type || "");
    const eventData = event?.data ?? {};
    const providerEventId = req.headers.get("svix-id") || `${eventType}:${event?.created_at || ""}:${eventData?.email_id || ""}`;
    const providerMessageId = eventData?.email_id ? String(eventData.email_id) : null;
    if (!eventType) return json({ error: "Missing event type" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: inserted, error: insertError } = await supabase
      .from("email_delivery_webhook_events")
      .insert({
        provider: "resend",
        provider_event_id: providerEventId,
        event_type: eventType,
        provider_message_id: providerMessageId,
        payload: event,
      })
      .select("id")
      .maybeSingle();

    if (insertError?.code === "23505") return json({ received: true, duplicate: true });
    if (insertError) throw insertError;

    const status = statusForEvent(eventType);
    let processingError: string | null = null;

    if (providerMessageId && status) {
      const update: Record<string, unknown> = {
        status,
        last_provider_event_type: eventType,
        updated_at: new Date().toISOString(),
      };
      const eventAt = event?.created_at || new Date().toISOString();

      if (eventType === "email.delivered") update.delivered_at = eventAt;
      if (eventType === "email.delivery_delayed") update.delayed_at = eventAt;
      if (eventType === "email.bounced") {
        update.bounced_at = eventAt;
        update.retryable = false;
        update.error_message = eventData?.bounce?.message || "Email bounced";
      }
      if (eventType === "email.complained") {
        update.complained_at = eventAt;
        update.retryable = false;
        update.error_message = "Recipient complained about the email";
      }
      if (eventType === "email.opened") update.opened_at = eventAt;
      if (eventType === "email.clicked") update.clicked_at = eventAt;
      if (eventType === "email.failed") {
        update.retryable = true;
        update.error_message = eventData?.failed?.message || "Provider reported email failure";
      }

      const { error: updateError } = await supabase
        .from("email_delivery_events")
        .update(update)
        .eq("provider", "resend")
        .eq("provider_message_id", providerMessageId);

      if (updateError) processingError = updateError.message;
    }

    await supabase
      .from("email_delivery_webhook_events")
      .update({ processed_at: new Date().toISOString(), processing_error: processingError })
      .eq("id", inserted?.id);

    if (processingError) return json({ received: true, processed: false, error: processingError }, 500);
    return json({ received: true, processed: true });
  } catch (error) {
    console.error("Resend webhook handler error:", error);
    return json({ error: error instanceof Error ? error.message : "Webhook processing failed" }, 500);
  }
});
