import { bridgefortEmail } from "../_shared/email-template.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_STATUSES = ["received", "confirmed", "rejected", "cancelled"];
const FROM_EMAIL = "Bridgefort Travels <travels@bridgeforthomes.com>";

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return response({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) return response({ error: "Invalid session" }, 401);

    const userId = userData.user.id;
    const { data: canManageBookings } = await supabase.rpc("user_has_permission", {
      _user_id: userId,
      _permission: "booking.manage",
    });
    const { data: isGlobalAdmin } = await supabase.rpc("is_global_admin", { _user_id: userId });
    if (!canManageBookings && !isGlobalAdmin) {
      return response({ error: "Forbidden — booking.manage permission required" }, 403);
    }

    const body = await req.json();
    const { action, bookingId } = body;
    if (!bookingId || typeof bookingId !== "string") return response({ error: "bookingId required" }, 400);

    const { data: booking, error: fetchErr } = await supabase
      .from("travel_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();
    if (fetchErr || !booking) return response({ error: "Booking not found" }, 404);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;
    const origin = req.headers.get("origin") || "https://bridgeforthomes.com";
    const statusUrl = `${origin}/travels/booking/${booking.confirmation_token}`;

    if (action === "update_status") {
      const status = String(body.status ?? "");
      const statusNote = body.status_note ? String(body.status_note).trim().slice(0, 2000) : null;
      if (!ALLOWED_STATUSES.includes(status)) return response({ error: "Invalid status" }, 400);

      const { error: upErr } = await supabase
        .from("travel_bookings")
        .update({ status, status_note: statusNote })
        .eq("id", bookingId);
      if (upErr) throw upErr;

      const label = status === "confirmed" ? "Confirmed ✅"
        : status === "rejected" ? "Rejected"
        : status === "cancelled" ? "Cancelled" : "Received";
      const colour = status === "confirmed" ? "#16a34a"
        : status === "rejected" ? "#dc2626"
        : status === "cancelled" ? "#6b7280" : "#4f46e5";

      if (resend) {
        const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111"><h2 style="color:${colour}">Booking ${label}</h2><p>Hi ${escapeHtml(booking.name.split(" ")[0])}, your Bridgefort Travels booking has been updated.</p><p><strong>Status:</strong> ${escapeHtml(label)}</p>${statusNote ? `<p><strong>Note:</strong> ${escapeHtml(statusNote)}</p>` : ""}<p><a href="${escapeHtml(statusUrl)}" style="display:inline-block;background:${colour};color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">View booking</a></p></div>`;
        const sent = await resend.emails.send({
          from: FROM_EMAIL,
          to: [booking.email],
          subject: `Bridgefort Travels — booking ${label}`,
          html: bridgefortEmail(html),
        });
        if (sent.error) console.error("status email:", sent.error);
      }

      return response({ success: true, status });
    }

    if (action === "send_message") {
      const subject = String(body.subject ?? "").trim().slice(0, 200);
      const message = String(body.message ?? "").trim().slice(0, 10000);
      if (!subject || !message) return response({ error: "Subject and message are required" }, 400);
      if (!resend) return response({ error: "Email is not configured" }, 500);

      const html = `<div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;padding:24px;color:#111"><p>Dear ${escapeHtml(booking.name)},</p><div>${escapeHtml(message).replace(/\n/g, "<br/>")}</div><hr style="margin:24px 0;border:0;border-top:1px solid #ddd"><p style="font-size:12px;color:#666">Bridgefort Travels<br/>travels@bridgeforthomes.com</p></div>`;
      const sent = await resend.emails.send({ from: FROM_EMAIL, to: [booking.email], subject, html: bridgefortEmail(html) });
      if (sent.error) throw new Error(sent.error.message || "Email could not be sent");

      const { error: logErr } = await supabase.from("admin_emails").insert({
        sender_id: userId,
        from_email: "travels@bridgeforthomes.com",
        from_name: "Bridgefort Travels",
        to_email: booking.email,
        to_name: booking.name,
        subject,
        body: message,
        html,
        folder: "sent",
        is_read: true,
        source: "travel_booking",
        external_ref: booking.id,
        account_email: "travels@bridgeforthomes.com",
      });
      if (logErr) console.error("travel sent-mail log:", logErr);

      const { error: activityErr } = await supabase.from("crm_activities").insert({
        lead_id: booking.crm_lead_id,
        journey_id: booking.service_journey_id,
        activity_type: "TRAVEL_BOOKING_EMAIL_SENT",
        subject,
        notes: message,
        created_by: userId,
      });
      if (activityErr) console.error("travel activity log:", activityErr);

      return response({ success: true, sent: true });
    }

    if (action === "resend_confirmation") {
      if (!resend) return response({ error: "Email not configured" }, 500);
      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111"><h2 style="color:#4f46e5">Your Bridgefort Travels booking</h2><p>Hi ${escapeHtml(booking.name.split(" ")[0])}, here is your booking summary (current status: <strong>${escapeHtml(booking.status)}</strong>).</p><ul><li><strong>Package:</strong> ${escapeHtml(booking.package)}</li><li><strong>Destination:</strong> ${escapeHtml(booking.destination || "—")}</li><li><strong>Departure:</strong> ${escapeHtml(booking.departure_date)}</li><li><strong>Return:</strong> ${escapeHtml(booking.return_date)}</li><li><strong>Travelers:</strong> ${booking.travelers}</li></ul><p><a href="${escapeHtml(statusUrl)}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Track your booking</a></p></div>`;
      const sent = await resend.emails.send({ from: FROM_EMAIL, to: [booking.email], subject: "Bridgefort Travels — booking confirmation (resent)", html: bridgefortEmail(html) });
      if (sent.error) throw new Error(sent.error.message || "Email could not be sent");
      return response({ success: true });
    }

    return response({ error: "Unknown action" }, 400);
  } catch (e: any) {
    console.error("manage-travel-booking error:", e);
    return response({ error: e?.message || "Internal error" }, 500);
  }
});
