import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_STATUSES = ["received", "confirmed", "rejected", "cancelled"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Identify caller
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // Super-admin check
    const { data: isSuper } = await supabase.rpc("is_super_admin", { _user_id: userId });
    if (!isSuper) {
      return new Response(JSON.stringify({ error: "Forbidden — super admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, bookingId } = body;
    if (!bookingId || typeof bookingId !== "string") {
      return new Response(JSON.stringify({ error: "bookingId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: booking, error: fetchErr } = await supabase
      .from("travel_bookings").select("*").eq("id", bookingId).single();
    if (fetchErr || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;
    const from = "Bridgefort Travels <noreply@pwanbridgefort.ng>";
    const origin = req.headers.get("origin") || "https://bridgefort.lovable.app";
    const statusUrl = `${origin}/travels/booking/${booking.confirmation_token}`;

    if (action === "update_status") {
      const { status, status_note } = body;
      if (!ALLOWED_STATUSES.includes(status)) {
        return new Response(JSON.stringify({ error: "Invalid status" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error: upErr } = await supabase
        .from("travel_bookings")
        .update({ status, status_note: status_note || null })
        .eq("id", bookingId);
      if (upErr) throw upErr;

      // Notify customer
      if (resend) {
        const label = status === "confirmed" ? "Confirmed ✅"
                    : status === "rejected" ? "Rejected"
                    : status === "cancelled" ? "Cancelled" : "Received";
        const colour = status === "confirmed" ? "#16a34a"
                     : status === "rejected" ? "#dc2626"
                     : status === "cancelled" ? "#6b7280" : "#4f46e5";
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
            <h2 style="color:${colour}">Booking ${label}</h2>
            <p>Hi ${booking.name.split(" ")[0]}, your travel booking status has been updated.</p>
            <p><strong>Status:</strong> <span style="color:${colour}">${label}</span></p>
            ${status_note ? `<p><strong>Note:</strong> ${String(status_note).replace(/</g, "&lt;")}</p>` : ""}
            <p><a href="${statusUrl}" style="display:inline-block;background:${colour};color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">View booking</a></p>
          </div>`;
        await resend.emails.send({
          from, to: [booking.email],
          subject: `Bridgefort Travels — booking ${label}`,
          html,
        }).catch((e) => console.error("status email:", e));
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "resend_confirmation") {
      if (!resend) {
        return new Response(JSON.stringify({ error: "Email not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
          <h2 style="color:#4f46e5">Your Bridgefort Travels booking</h2>
          <p>Hi ${booking.name.split(" ")[0]}, here is your booking summary (current status: <strong>${booking.status}</strong>).</p>
          <ul>
            <li><strong>Package:</strong> ${booking.package}</li>
            <li><strong>Destination:</strong> ${booking.destination || "—"}</li>
            <li><strong>Departure:</strong> ${booking.departure_date}</li>
            <li><strong>Return:</strong> ${booking.return_date}</li>
            <li><strong>Travelers:</strong> ${booking.travelers}</li>
          </ul>
          <p><a href="${statusUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Track your booking</a></p>
        </div>`;
      await resend.emails.send({
        from, to: [booking.email],
        subject: "Bridgefort Travels — booking confirmation (resent)",
        html,
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("manage-travel-booking error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
