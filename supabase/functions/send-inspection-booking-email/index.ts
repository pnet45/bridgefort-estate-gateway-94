import { bridgefortEmail } from "../_shared/email-template.ts";
import { sendTrackedEmail } from "../_shared/email-delivery.ts";
import { createClient } from "npm:@supabase/supabase-js@2.110.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const esc = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Sign in required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return json({ error: "Inspection email service is not configured" }, 500);

    const service = createClient(supabaseUrl, serviceKey);
    const token = authHeader.slice(7);
    const { data: authData, error: authError } = await service.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "Invalid session" }, 401);

    const body = await req.json();
    const bookingId = typeof body?.bookingId === "string" ? body.bookingId : "";
    if (!bookingId) return json({ error: "bookingId is required" }, 400);

    const { data: booking, error: bookingError } = await service
      .from("inspection_bookings")
      .select("id,user_id,email,estate_name,inspection_date,inspection_time,message,status,crm_lead_id,service_journey_id")
      .eq("id", bookingId)
      .eq("user_id", authData.user.id)
      .single();
    if (bookingError || !booking) return json({ error: "Inspection booking not found" }, 404);

    const email = String(booking.email || authData.user.email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ success: true, emailStatus: "not_available" });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ success: true, emailStatus: "not_configured" });

    const resend = new Resend(resendKey);
    const firstName = String(authData.user.user_metadata?.first_name || "").trim() || "Valued Client";
    const subject = "Bridgefort Homes — inspection booking received";
    const text = [
      `Dear ${firstName},`,
      "",
      "We have received your property inspection booking request.",
      `Property: ${booking.estate_name}`,
      `Preferred date: ${booking.inspection_date}`,
      `Preferred time: ${booking.inspection_time}`,
      `Status: ${booking.status || "pending"}`,
      "",
      "Our Client Service Team will contact you to confirm the appointment.",
      "",
      "Bridgefort Homes Development Ltd.",
      "Bringing your dream home!",
    ].join("\n");
    const html = bridgefortEmail(
      `<p>Dear <strong>${esc(firstName)}</strong>,</p>
       <p>We have received your property inspection booking request.</p>
       <p><strong>Property:</strong> ${esc(booking.estate_name)}<br>
       <strong>Preferred date:</strong> ${esc(booking.inspection_date)}<br>
       <strong>Preferred time:</strong> ${esc(booking.inspection_time)}<br>
       <strong>Status:</strong> ${esc(booking.status || "pending")}</p>
       <p>Our Client Service Team will contact you to confirm the appointment.</p>`,
    );

    const delivery = await sendTrackedEmail({
      supabase: service,
      resend,
      eventKey: `inspection_booking_received:${booking.id}`,
      recipientEmail: email,
      recipientUserId: authData.user.id,
      recipientName: firstName,
      templateKey: "inspection_booking_received",
      sourceFunction: "send-inspection-booking-email",
      sourceReference: booking.id,
      metadata: {
        booking_id: booking.id,
        estate_name: booking.estate_name,
        inspection_date: booking.inspection_date,
        inspection_time: booking.inspection_time,
      },
      payload: {
        from: "Bridgefort Homes Development Ltd. <info@bridgeforthomes.com>",
        to: [email],
        subject,
        html,
        text,
      },
    });

    if (delivery.error) {
      console.error("inspection confirmation email failed", delivery.error);
      return json({ success: true, emailStatus: "send_failed" });
    }

    const { error: inboxError } = await service.from("admin_emails").insert({
      from_email: email,
      from_name: firstName,
      to_email: "info@bridgeforthomes.com",
      to_name: "Bridgefort Homes Client Service",
      subject: `New inspection booking — ${booking.estate_name}`,
      body: [
        "New property inspection booking received.",
        `Customer: ${firstName}`,
        `Email: ${email}`,
        `Estate: ${booking.estate_name}`,
        `Date: ${booking.inspection_date}`,
        `Time: ${booking.inspection_time}`,
        `Status: ${booking.status || "pending"}`,
        `Booking ID: ${booking.id}`,
      ].join("\n"),
      html,
      folder: "inbox",
      is_read: false,
      source: "inspection_booking",
      external_ref: booking.id,
      account_email: "info@bridgeforthomes.com",
    });
    if (inboxError) console.error("inspection admin inbox insert failed", inboxError);

    if (booking.crm_lead_id) {
      const { error: activityError } = await service.from("crm_lead_activities").insert({
        lead_id: booking.crm_lead_id,
        activity_type: "INSPECTION_BOOKING_EMAIL_SENT",
        description: `Inspection booking confirmation sent for ${booking.estate_name}.`,
        created_by: authData.user.id,
      });
      if (activityError) console.error("inspection CRM activity failed", activityError);
    }

    return json({ success: true, emailStatus: "sent" });
  } catch (error) {
    console.error("send-inspection-booking-email", error);
    return json({ error: "Inspection email could not be processed" }, 500);
  }
});
