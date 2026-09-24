import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

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

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

const textVersion = (name: string) => `Dear ${name},

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

const htmlVersion = (name: string) => {
  const safeName = escapeHtml(name);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>Welcome to Bridgefort Homes</title></head>
<body style="margin:0;padding:0;background:#f4f0fa;font-family:Arial,Helvetica,sans-serif;color:#25212b;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f0fa"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(72,37,105,.12)">
<tr><td style="background:#5b2a86;padding:30px 28px;text-align:center"><div style="font-size:27px;line-height:1.15;font-weight:800;color:#fff">Bridgefort Homes</div><div style="margin-top:7px;font-size:13px;color:#eadcf6;letter-spacing:.3px">Development Ltd.</div><div style="margin-top:18px;display:inline-block;padding:7px 14px;border:1px solid #caa8e8;border-radius:30px;color:#fff;font-size:12px;font-weight:700">WELCOME TO THE BRIDGEFORT FAMILY</div></td></tr>
<tr><td style="padding:34px 30px 12px">
<p style="margin:0 0 18px;font-size:18px;line-height:1.5;font-weight:700;color:#3b2057">Dear ${safeName},</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.75">Welcome to Bridgefort Homes Development Ltd.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.75">Thank you for registering on our website. We are delighted to have you join the Bridgefort family and appreciate your interest in our real estate and investment opportunities.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.75">At Bridgefort Homes, we are committed to helping individuals and families achieve their dreams of land and home ownership through <strong>integrity, transparency, accountability, and exceptional service.</strong></p>
<p style="margin:0 0 22px;font-size:15px;line-height:1.75">Whether you are looking to buy land, invest in high-growth properties, build your dream home, or explore our flexible payment plans, our team is here to guide you every step of the way.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f2fb;border:1px solid #eadcf6;border-radius:14px"><tr><td style="padding:22px"><div style="font-size:16px;font-weight:700;color:#4a236c;margin-bottom:12px">As a registered member, you can look forward to:</div><div style="font-size:14px;line-height:1.75;color:#43394b">• Access to our latest property listings and investment opportunities.<br>• Updates on new estate launches and exclusive promotions.<br>• Information on our flexible payment and subscription plans.<br>• Invitations to seminars, inspections, and wealth-building events.<br>• Personalized support from our dedicated customer service team.</div></td></tr></table>
<p style="margin:22px 0 16px;font-size:15px;line-height:1.75">If you have any questions or would like assistance in choosing the right property or investment plan, please don't hesitate to reach out. Our team will be happy to provide you with the information and guidance you need.</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.75">We encourage you to explore our available estates and stay connected with us for exciting opportunities designed to help you build lasting wealth through real estate.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 28px"><tr><td style="border-radius:9px;background:#5b2a86;text-align:center"><a href="${PROFILE_URL}" style="display:inline-block;padding:14px 25px;color:#fff;text-decoration:none;font-size:15px;font-weight:700">Complete Your Profile</a></td></tr></table>
<p style="margin:0 0 18px;font-size:15px;line-height:1.75">Thank you once again for choosing Bridgefort Homes Development Ltd. We look forward to serving you and making your property ownership journey a rewarding experience.</p>
<p style="margin:26px 0 4px;font-size:14px;line-height:1.6">Warm regards,</p><p style="margin:0;font-size:16px;line-height:1.55;font-weight:700;color:#3b2057">Dr. Dalvin Silva, PhD</p><p style="margin:2px 0 0;font-size:14px;line-height:1.5;color:#5b2a86;font-weight:700">MD/CEO</p><p style="margin:2px 0 22px;font-size:14px;line-height:1.5">Bridgefort Homes Development Ltd.</p>
</td></tr>
<tr><td style="background:#3b2057;padding:26px 24px;text-align:center;color:#fff"><div style="font-size:16px;font-weight:800">Bridgefort Homes Development Ltd.</div><div style="margin-top:5px;font-size:13px;color:#e9ddf3">Bringing your dream home!</div><div style="margin-top:15px;font-size:12px;line-height:1.7;color:#e9ddf3"><a href="${WEBSITE}" style="color:#fff;text-decoration:underline">www.bridgeforthomes.com</a><br><a href="mailto:info@bridgeforthomes.com" style="color:#fff;text-decoration:none">info@bridgeforthomes.com</a> &nbsp;|&nbsp; <a href="mailto:sales@bridgeforthomes.com" style="color:#fff;text-decoration:none">sales@bridgeforthomes.com</a><br>+234 803 062 4059 &nbsp;|&nbsp; +234 807 071 0688</div>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:18px auto 0"><tr>
<td style="padding:0 4px"><a href="https://web.facebook.com/people/Bridgefort-Homes/61591513100267/" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:11px;font-weight:800">f</a></td>
<td style="padding:0 4px"><a href="https://instagram.com/bridgeforthomes" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:10px;font-weight:800">ig</a></td>
<td style="padding:0 4px"><a href="https://x.com/bridgeforthomes" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:11px;font-weight:800">X</a></td>
<td style="padding:0 4px"><a href="https://www.linkedin.com/in/bridgeforthomes/" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:9px;font-weight:800">in</a></td>
<td style="padding:0 4px"><a href="https://tiktok.com/@bridgeforthomes" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:9px;font-weight:800">tt</a></td>
<td style="padding:0 4px"><a href="https://youtube.com/@bridgeforthomes" style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:50%;background:#fff;color:#3b2057;text-decoration:none;font-size:9px;font-weight:800">yt</a></td>
</tr></table><div style="margin-top:14px;font-size:11px;color:#d8c9e4">Follow @bridgeforthomes</div></td></tr>
</table></td></tr></table></body></html>`;
};

interface Payload { type?: string; table?: string; schema?: string; record?: { id?: string } | null; }

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } });

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    // This function is called by the database trigger with the project secret
    // in the apikey header. The key never enters the browser or source code.
    const callerKey = req.headers.get("apikey") || "";
    const configuredKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS") || "";
    let expectedKey = "";
    try {
      const keys = JSON.parse(configuredKeysRaw);
      expectedKey = String(keys.default || Object.values(keys)[0] || "");
    } catch {
      expectedKey = SERVICE_ROLE_KEY;
    }
    if (!callerKey || !expectedKey || callerKey !== expectedKey) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const payload = (await req.json()) as Payload;
    const userId = payload.record?.id;
    if (!userId) throw new Error("Missing profile user id");

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId);
    if (userError || !userData.user?.email) throw new Error(userError?.message || "User email not found");

    const { data: profile, error: profileError } = await admin.from("profiles").select("id, first_name, last_name").eq("id", userId).maybeSingle();
    if (profileError) throw profileError;

    const name = `${profile?.first_name || userData.user.user_metadata?.first_name || ""} ${profile?.last_name || userData.user.user_metadata?.last_name || ""}`.trim() || "Bridgefort Family Member";
    const email = userData.user.email;

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
      console.error("Welcome email Resend error:", message);
      // Email delivery failure must never roll back or falsely fail account creation.
      return new Response(JSON.stringify({ success: false, error: message }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const resendId = result?.id || null;
    await admin.from("welcome_email_deliveries").update({ status: "sent", resend_id: resendId, sent_at: new Date().toISOString(), updated_at: new Date().toISOString(), error_message: null }).eq("user_id", userId);
    return new Response(JSON.stringify({ success: true, resend_id: resendId }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error) {
    console.error("Welcome email function error:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Welcome email failed" }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
