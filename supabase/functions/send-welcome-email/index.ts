import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";
import { bridgefortEmail, escapeHtml } from "../_shared/email-template.ts";

interface Payload {
  type?: string;
  table?: string;
  schema?: string;
  record?: {
    id?: string;
    dispatch_token?: string;
  };
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = Deno.env.get("WELCOME_EMAIL_FROM") || "Bridgefort Homes Development Ltd <info@bridgeforthomes.com>";
const WEBSITE = "https://www.bridgeforthomes.com";
const PROFILE_URL = `${WEBSITE}/profile`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const textVersion=(name:string)=>`Dear ${name},

Welcome to Bridgefort Homes Development Ltd.

Thank you for registering on our website. We are delighted to have you join the Bridgefort family and appreciate your interest in our real estate and investment opportunities.

At Bridgefort Homes, we are committed to helping individuals and families achieve their dreams of land and home ownership through integrity, transparency, accountability, and exceptional service.

Whether you are looking to buy land, invest in high-growth properties, build your dream home, or explore our flexible payment plans, our team is here to guide you every step of the way.

As a registered member, you can look forward to:
• Access to our latest property listings and investment opportunities.
• Updates on new estate launches and exclusive promotions.
• Information on our flexible payment and subscription plans.
• Invitations to seminars, inspections, and wealth-building events.
• Personalized support from our dedicated customer service team.

If you have any questions or would like assistance in choosing the right property or investment plan, please don't hesitate to reach out. Our team will be happy to provide you with the information and guidance you need.

We encourage you to explore our available estates and stay connected with us for exciting opportunities designed to help you build lasting wealth through real estate.

Complete Your Profile: ${PROFILE_URL}

Thank you once again for choosing Bridgefort Homes Development Ltd. We look forward to serving you and making your property ownership journey a rewarding experience.

Warm regards,

Dr. Dalvin Silva, PhD
MD/CEO
Bridgefort Homes Development Ltd.

Website: ${WEBSITE}
Email: info@bridgeforthomes.com | sales@bridgeforthomes.com
Phone: +234 803 062 4059 | +234 807 071 0688

Bridgefort Homes Development Ltd.
Bringing your dream home!`;

const htmlVersion=(name:string)=>bridgefortEmail(`
<p style="margin:0 0 18px;font-size:18px;line-height:1.5;font-weight:700;color:#3b2057">Dear ${escapeHtml(name)},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.75">Welcome to Bridgefort Homes Development Ltd.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.75">Thank you for registering on our website. We are delighted to have you join the Bridgefort family and appreciate your interest in our real estate and investment opportunities.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.75">At Bridgefort Homes, we are committed to helping individuals and families achieve their dreams of land and home ownership through <strong>integrity, transparency, accountability, and exceptional service.</strong></p>
<p style="margin:0 0 22px;font-size:15px;line-height:1.75">Whether you are looking to buy land, invest in high-growth properties, build your dream home, or explore our flexible payment plans, our team is here to guide you every step of the way.</p>
<div style="background:#f7f2fb;border:1px solid #eadcf6;border-radius:14px;padding:22px;font-size:14px;line-height:1.75">
<div style="font-size:16px;font-weight:700;color:#4a236c;margin-bottom:12px">As a registered member, you can look forward to:</div>
• Access to our latest property listings and investment opportunities.<br>
• Updates on new estate launches and exclusive promotions.<br>
• Information on our flexible payment and subscription plans.<br>
• Invitations to seminars, inspections, and wealth-building events.<br>
• Personalized support from our dedicated customer service team.
</div>
<p style="margin:22px 0 16px;font-size:15px;line-height:1.75">If you have any questions or would like assistance in choosing the right property or investment plan, please don't hesitate to reach out. Our team will be happy to provide you with the information and guidance you need.</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.75">We encourage you to explore our available estates and stay connected with us for exciting opportunities designed to help you build lasting wealth through real estate.</p>
<p style="margin:0 0 18px;font-size:15px;line-height:1.75">Thank you once again for choosing Bridgefort Homes Development Ltd. We look forward to serving you and making your property ownership journey a rewarding experience.</p>
<p style="margin:26px 0 4px;font-size:14px;line-height:1.6">Warm regards,</p>
<p style="margin:0;font-size:16px;line-height:1.55;font-weight:700;color:#3b2057">Dr. Dalvin Silva, PhD</p>
<p style="margin:2px 0 0;font-size:14px;line-height:1.5;color:#5b2a86;font-weight:700">MD/CEO</p>
<p style="margin:2px 0 22px;font-size:14px;line-height:1.5">Bridgefort Homes Development Ltd.</p>
`, { preheader: "Welcome to the Bridgefort Homes family.", ctaLabel: "Complete Your Profile", ctaUrl: PROFILE_URL });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } });

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    // The profile trigger supplies a one-time dispatch token in the request body.
    // A project secret is still accepted for trusted internal callers.
    const payload = (await req.json()) as Payload;
    const userId = payload.record?.id;
    const dispatchToken = payload.record?.dispatch_token || "";
    if (!userId) throw new Error("Missing profile user id");

    let authorized = false;
    if (dispatchToken) {
      const { data: delivery } = await admin
        .from("welcome_email_deliveries")
        .select("user_id, dispatch_token")
        .eq("user_id", userId)
        .eq("dispatch_token", dispatchToken)
        .maybeSingle();
      authorized = Boolean(delivery?.user_id);
    }

    if (!authorized) {
      const callerKey = req.headers.get("apikey") || "";
      const configuredKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS") || "";
      let expectedKey = "";
      try {
        const keys = JSON.parse(configuredKeysRaw);
        expectedKey = String(keys.default || Object.values(keys)[0] || "");
      } catch {
        expectedKey = SERVICE_ROLE_KEY;
      }
      authorized = Boolean(callerKey && expectedKey && callerKey === expectedKey);
    }

    if (!authorized) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) throw new Error(userError?.message || "User email not found");

    const { data: profile, error: profileError } = await admin.from("profiles").select("id, first_name, last_name").eq("id", userId).maybeSingle();
    if (profileError) throw profileError;

    const name = `${profile?.first_name || userData.user.user_metadata?.first_name || ""} ${profile?.last_name || userData.user.user_metadata?.last_name || ""}`.trim() || "Bridgefort Family Member";
    const email = userData.user.email;

    const eventKey = `welcome_email:${userId}`;
    const { data: existingEvent } = await admin
      .from("email_delivery_events")
      .select("status, provider_message_id, attempt_count")
      .eq("event_key", eventKey)
      .maybeSingle();

    if (existingEvent?.status === "sent") {
      return new Response(JSON.stringify({ success: true, duplicate: true, resend_id: existingEvent.provider_message_id }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    await admin.from("email_delivery_events").upsert({
      event_key: eventKey,
      recipient_email: email,
      recipient_user_id: userId,
      recipient_name: name,
      subject: "Welcome to the Bridgefort Homes Family",
      provider: "resend",
      sender_email: FROM_EMAIL,
      sender_name: "Bridgefort Homes Development Ltd.",
      template_key: "welcome_email",
      source_function: "send-welcome-email",
      source_reference: userId,
      status: "queued",
      attempt_count: (existingEvent?.attempt_count || 0) + 1,
      metadata: { event: "welcome", profile_id: userId },
      updated_at: new Date().toISOString(),
    }, { onConflict: "event_key" });

    const { error: claimError } = await admin.from("welcome_email_deliveries").insert({ user_id: userId, email, status: "sending" });
    if (claimError) {
      const { data: existing } = await admin.from("welcome_email_deliveries").select("status, resend_id").eq("user_id", userId).maybeSingle();
      if (existing?.status === "sent") return new Response(JSON.stringify({ success: true, duplicate: true, resend_id: existing.resend_id }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      if (existing?.status === "sending") return new Response(JSON.stringify({ success: true, duplicate: true, status: "sending" }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      await admin.from("welcome_email_deliveries").update({ status: "sending", error_message: null, updated_at: new Date().toISOString() }).eq("user_id", userId);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `welcome-email#${userId}` },
      body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject: "Welcome to the Bridgefort Homes Family", html: htmlVersion(name), text: textVersion(name) }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = result?.message || result?.error || `Resend returned HTTP ${response.status}`;
      await admin.from("welcome_email_deliveries").update({ status: "failed", error_message: message, updated_at: new Date().toISOString() }).eq("user_id", userId);
      await admin.from("email_delivery_events").update({ status: "failed", error_message: message, updated_at: new Date().toISOString() }).eq("event_key", eventKey);
      console.error("Welcome email Resend error:", message);
      // Email delivery failure must never roll back or falsely fail account creation.
      return new Response(JSON.stringify({ success: false, error: message }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const resendId = result?.id || null;
    await admin.from("welcome_email_deliveries").update({ status: "sent", resend_id: resendId, sent_at: new Date().toISOString(), updated_at: new Date().toISOString(), error_message: null }).eq("user_id", userId);
    await admin.from("email_delivery_events").update({ status: "sent", provider_message_id: resendId, sent_at: new Date().toISOString(), updated_at: new Date().toISOString(), error_message: null }).eq("event_key", eventKey);
    return new Response(JSON.stringify({ success: true, resend_id: resendId }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error) {
    console.error("Welcome email function error:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Welcome email failed" }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
