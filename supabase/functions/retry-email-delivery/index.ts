import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bridgefort-cron-token",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

async function authorized(supabase: any, req: Request) {
  const token = req.headers.get("x-bridgefort-cron-token")?.trim();
  if (!token) return false;
  const { data, error } = await supabase
    .from("automation_secrets")
    .select("secret_hash")
    .eq("secret_name", "inactive_account_reminders")
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data?.secret_hash) return false;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hash === data.secret_hash;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  if (!(await authorized(supabase, req))) return json({ error: "Unauthorized" }, 401);

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return json({ error: "RESEND_API_KEY is not configured" }, 500);
  const resend = new Resend(resendKey);

  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: candidates, error: fetchError } = await supabase
    .from("email_delivery_events")
    .select("id,event_key,recipient_email,recipient_name,subject,attempt_count,payload,provider,sender_email,sender_name")
    .eq("retryable", true)
    .in("status", ["failed", "queued"])
    .lt("updated_at", cutoff)
    .lt("attempt_count", 3)
    .order("updated_at", { ascending: true })
    .limit(50);

  if (fetchError) return json({ error: fetchError.message }, 500);

  let retried = 0;
  let sent = 0;
  let failed = 0;

  for (const event of candidates ?? []) {
    const payload = event.payload ?? {};
    if (!payload.html || !Array.isArray(payload.to) || !payload.to.length) continue;

    const nextAttempt = Number(event.attempt_count ?? 0) + 1;
    const { data: claimed, error: claimError } = await supabase
      .from("email_delivery_events")
      .update({
        status: "sending",
        attempt_count: nextAttempt,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id)
      .in("status", ["failed", "queued"])
      .select("id")
      .maybeSingle();

    if (claimError || !claimed) continue;

    retried++;
    try {
      const result = await resend.emails.send({
        from: payload.from || `${event.sender_name || "Bridgefort Homes Development Ltd"} <${event.sender_email || "noreply@bridgeforthomes.com"}>`,
        to: payload.to,
        ...(Array.isArray(payload.cc) && payload.cc.length ? { cc: payload.cc } : {}),
        ...(Array.isArray(payload.bcc) && payload.bcc.length ? { bcc: payload.bcc } : {}),
        subject: payload.subject || event.subject,
        html: payload.html,
        text: payload.text || undefined,
      });
      const providerId = result?.data?.id ?? result?.id ?? null;
      if (result?.error) {
        throw new Error(result.error.message || "Resend delivery failed");
      }

      await supabase.from("email_delivery_events").update({
        status: "sent",
        provider_message_id: providerId,
        sent_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      }).eq("id", event.id);
      sent++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown retry error";
      await supabase.from("email_delivery_events").update({
        status: "failed",
        error_message: message.slice(0, 2000),
        updated_at: new Date().toISOString(),
      }).eq("id", event.id);
      failed++;
    }
  }

  return json({
    success: failed === 0,
    candidates: candidates?.length ?? 0,
    retried,
    sent,
    failed,
  }, failed ? 207 : 200);
});
