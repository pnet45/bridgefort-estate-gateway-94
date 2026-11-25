import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { sendTrackedEmail } from "../_shared/email-delivery.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
}[char] || char));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

    const url = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!url || !anonKey || !serviceKey || !resendKey) {
      return json({ error: "BMC KYC email service is not configured" }, 503);
    }

    const token = authorization.slice(7);
    const authClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "Invalid authentication" }, 401);

    const admin = createClient(url, serviceKey);
    const actor = authData.user.id;
    const { data: canReview, error: permissionError } = await admin.rpc("user_has_permission", {
      _user_id: actor,
      _permission_key: "admin:manage_bmc_partners",
    });
    const { data: isGlobalAdmin } = await admin.rpc("user_has_permission", {
      _user_id: actor,
      _permission_key: "admin:all",
    });
    if (permissionError || !(canReview || isGlobalAdmin)) return json({ error: "BMC KYC review permission required" }, 403);

    const body = await req.json().catch(() => ({}));
    const kycId = String(body?.kyc_id ?? "").trim();
    if (!/^[0-9a-f-]{36}$/i.test(kycId)) return json({ error: "A valid KYC submission ID is required" }, 400);

    const { data: kyc, error: kycError } = await admin
      .from("bmc_identity_kyc")
      .select("id,user_id,status,identity_data")
      .eq("id", kycId)
      .maybeSingle();
    if (kycError) throw kycError;
    if (!kyc || kyc.status !== "VERIFIED") return json({ error: "Only an approved BMC identity can receive this email" }, 409);

    const { data: recipient, error: recipientError } = await admin.auth.admin.getUserById(kyc.user_id);
    if (recipientError || !recipient.user?.email) return json({ error: "The BMC account has no deliverable email address" }, 404);

    const { data: partnerProfile } = await admin
      .from("profiles")
      .select("is_pbo")
      .eq("id", kyc.user_id)
      .maybeSingle();
    const isLegacyRealtorAccount = partnerProfile?.is_pbo === true;
    const actionUrl = isLegacyRealtorAccount
      ? "https://bridgeforthomes.com/bh-realtors/withdraw"
      : "https://bridgeforthomes.com/bmc-partner-hub";
    const actionLabel = isLegacyRealtorAccount
      ? "Check Withdrawal Eligibility"
      : "View BMC Partner Dashboard";

    const { data: estates, error: estatesError } = await admin
      .from("estate")
      .select("id,name")
      .eq("is_sold_out", false)
      .order("created_at", { ascending: false })
      .limit(3);
    if (estatesError) console.warn("Could not load current property recommendations:", estatesError.message);

    const properties = (estates || []).filter((item) => item?.id && item?.name).slice(0, 3);
    const propertyHtml = properties.length
      ? properties.map((item) => `<li style="margin:10px 0"><a href="https://bridgeforthomes.com/properties/estates/${encodeURIComponent(item.id)}" style="color:#241047;font-weight:600">${escapeHtml(item.name)}</a></li>`).join("")
      : '<li>Explore current available properties at <a href="https://bridgeforthomes.com/properties/estates">Bridgefort Homes properties</a>.</li>';

    const firstName = escapeHtml(kyc.identity_data?.first_name || "BMC Partner");
    const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#1f2937;line-height:1.6">
      <h2 style="color:#241047">Your Bridgefort BMC identity is verified</h2>
      <p>Dear ${firstName},</p>
      <p>Bridgefort Homes Development Ltd has completed the manual review of your central BMC identity verification. Your identity is now marked as <strong>VERIFIED</strong> across Bridgefort Homes, Bridgefort Travels and Bridgefort Agrovest.</p>
      <p>This confirms your identity across all three businesses. It does not automatically approve a business division, create a commission, or guarantee a payout. Each division's approval, cleared-payment and applicable payout requirements continue to apply.</p>
      <p style="margin:26px 0"><a href="${actionUrl}" style="display:inline-block;background:#241047;color:#fff;text-decoration:none;padding:13px 22px;border-radius:7px;font-weight:700">${actionLabel}</a></p>
      <h3 style="color:#241047">Properties you may wish to market</h3>
      <p>Here are up to three currently available Bridgefort estate properties:</p>
      <ul>${propertyHtml}</ul>
      <p>You can also view your central partner account at <a href="https://bridgeforthomes.com/bmc-partner-hub">BMC Partner Hub</a>.</p>
      <p>Regards,<br><strong>Bridgefort Homes Development Ltd</strong><br>Bringing your dream home</p>
    </div>`;

    const resend = new Resend(resendKey);
    const sent = await sendTrackedEmail({
      supabase: admin,
      resend,
      eventKey: `bmc_kyc_approved:${kyc.id}`,
      recipientEmail: recipient.user.email,
      recipientUserId: kyc.user_id,
      recipientName: String(kyc.identity_data?.first_name || ""),
      templateKey: "bmc_kyc_approved",
      sourceFunction: "send-bmc-kyc-approval-email",
      sourceReference: kyc.id,
      metadata: { kyc_id: kyc.id, user_id: kyc.user_id, properties: properties.map((item) => item.id) },
      payload: {
        from: Deno.env.get("WELCOME_EMAIL_FROM") || "Bridgefort Homes Development Ltd <info@bridgeforthomes.com>",
        to: [recipient.user.email],
        subject: "Your Bridgefort BMC identity verification is approved",
        html,
        text: `Your Bridgefort BMC identity is verified across Homes, Travels and Agrovest. ${actionLabel}: ${actionUrl}. This does not automatically approve a division or guarantee a payout.`,
      },
    });
    if (sent.error) return json({ success: false, error: sent.error.message || "Email delivery failed" }, 502);
    return json({ success: true, duplicate: Boolean(sent.duplicate) });
  } catch (error) {
    console.error("send-bmc-kyc-approval-email failed:", error);
    return json({ error: "Unable to send BMC KYC approval email" }, 500);
  }
});
