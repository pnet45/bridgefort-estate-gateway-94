import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  name?: string;
  subject: string;
  body: string;
  provider?: "resend" | "gmail";
  from?: string;
}

const GATEWAY_URL = "https://connector-gateway.lovable.dev";

function buildHtml(name: string | undefined, body: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:linear-gradient(135deg,#1a365d 0%,#2c5282 100%);padding:30px;text-align:center;border-radius:10px 10px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Bridgefort</h1>
  </div>
  <div style="background:#fff;padding:30px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;">
    ${name ? `<p style="font-size:16px;">Dear ${name},</p>` : ""}
    <div style="white-space:pre-wrap;font-size:16px;">${body}</div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:30px 0;">
    <p style="color:#718096;font-size:14px;margin:0;">Best regards,<br><strong>The Bridgefort Team</strong></p>
  </div>
  <div style="text-align:center;padding:20px;color:#a0aec0;font-size:12px;">
    <p style="margin:0;">© ${new Date().getFullYear()} Bridgefort. All rights reserved.</p>
  </div>
</body></html>`;
}

function encodeRawEmail(from: string, to: string, subject: string, html: string): string {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
  ].join("\r\n");
  // base64url encode UTF-8 safely
  const bytes = new TextEncoder().encode(message);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sendViaResend(opts: { from: string; to: string; subject: string; html: string }) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    throw new Error("Resend connector is not configured");
  }
  const res = await fetch(`${GATEWAY_URL}/resend/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error [${res.status}]: ${err}`);
  }
  return await res.json();
}

async function sendViaGmail(opts: { from: string; to: string; subject: string; html: string }) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GMAIL_API_KEY = Deno.env.get("GOOGLE_MAIL_API_KEY");
  if (!LOVABLE_API_KEY || !GMAIL_API_KEY) {
    throw new Error("Gmail connector is not configured");
  }
  const raw = encodeRawEmail(opts.from, opts.to, opts.subject, opts.html);
  const res = await fetch(`${GATEWAY_URL}/google_mail/gmail/v1/users/me/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GMAIL_API_KEY,
    },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail error [${res.status}]: ${err}`);
  }
  return await res.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authed = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authed.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await service.rpc("has_role", { _user_id: claimsData.claims.sub, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { to, name, subject, body, provider, from }: EmailRequest = await req.json();
    if (!to || !subject || !body) throw new Error("Missing required fields: to, subject, body");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) throw new Error("Invalid recipient email address");

    const chosen: "resend" | "gmail" = provider === "gmail" ? "gmail" : "resend";
    const html = buildHtml(name, body);
    const defaultFrom = chosen === "gmail"
      ? "Bridgefort Homes <me>"
      : "Bridgefort Homes Development Ltd <noreply@bridgeforthomes.com>";
    const fromAddress = from || defaultFrom;

    const data = chosen === "gmail"
      ? await sendViaGmail({ from: fromAddress, to, subject, html })
      : await sendViaResend({ from: fromAddress, to, subject, html });

    console.log(`Email sent via ${chosen}`);
    return new Response(JSON.stringify({ success: true, provider: chosen, data }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-admin-email error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
