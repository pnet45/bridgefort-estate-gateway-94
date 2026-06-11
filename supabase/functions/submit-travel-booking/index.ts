import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface BookingPayload {
  name: string;
  email: string;
  phone: string;
  departure_date: string;
  return_date: string;
  travelers: number;
  package: string;
  destination?: string;
  notes?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(b: any): string | null {
  if (!b || typeof b !== "object") return "Invalid payload";
  if (!b.name || typeof b.name !== "string" || b.name.length < 2 || b.name.length > 100) return "Invalid name";
  if (!b.email || !emailRegex.test(b.email) || b.email.length > 255) return "Invalid email";
  if (!b.phone || typeof b.phone !== "string" || b.phone.length < 7 || b.phone.length > 20) return "Invalid phone";
  if (!b.departure_date || !b.return_date) return "Dates required";
  const dep = new Date(b.departure_date), ret = new Date(b.return_date);
  if (isNaN(dep.getTime()) || isNaN(ret.getTime())) return "Invalid dates";
  if (ret < dep) return "Return must be after departure";
  const t = Number(b.travelers);
  if (!Number.isInteger(t) || t < 1 || t > 50) return "Invalid travelers";
  if (!b.package || typeof b.package !== "string") return "Package required";
  if (b.destination && b.destination.length > 120) return "Destination too long";
  if (b.notes && b.notes.length > 1000) return "Notes too long";
  return null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const err = validate(body);
    if (err) {
      return new Response(JSON.stringify({ error: err }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const payload: BookingPayload = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Availability check vs blackouts
    const { data: blackouts } = await supabase
      .from("travel_package_blackouts")
      .select("start_date,end_date,reason")
      .eq("package", payload.package);

    const dep = new Date(payload.departure_date);
    const ret = new Date(payload.return_date);
    const conflict = (blackouts || []).find((b: any) => {
      const s = new Date(b.start_date), e = new Date(b.end_date);
      return dep <= e && ret >= s;
    });
    if (conflict) {
      return new Response(JSON.stringify({
        error: "unavailable",
        message: `The ${payload.package} package isn't available between ${conflict.start_date} and ${conflict.end_date}${conflict.reason ? ` (${conflict.reason})` : ""}. Please choose different dates.`,
      }), { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("travel_bookings")
      .insert({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        departure_date: payload.departure_date,
        return_date: payload.return_date,
        travelers: payload.travelers,
        package: payload.package,
        destination: payload.destination ?? null,
        notes: payload.notes ?? null,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // Send notification emails (best-effort; do not fail the booking)
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const resend = new Resend(resendKey);
        const from = "Bridgefort Travels <noreply@pwanbridgefort.ng>";

        const customerHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
            <h2 style="color:#4f46e5">Thank you, ${payload.name.split(" ")[0]}!</h2>
            <p>We've received your travel enquiry. A Bridgefort consultant will contact you within 24 hours.</p>
            <h3>Your enquiry</h3>
            <ul>
              <li><strong>Package:</strong> ${payload.package}</li>
              <li><strong>Destination:</strong> ${payload.destination || "—"}</li>
              <li><strong>Departure:</strong> ${payload.departure_date}</li>
              <li><strong>Return:</strong> ${payload.return_date}</li>
              <li><strong>Travelers:</strong> ${payload.travelers}</li>
            </ul>
            <p style="color:#666;font-size:12px">Reference: ${inserted.id}</p>
          </div>`;

        await resend.emails.send({
          from,
          to: [payload.email],
          subject: "Your Bridgefort Travels enquiry — received ✈️",
          html: customerHtml,
        });

        const adminHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
            <h2>New Travel Booking Enquiry</h2>
            <ul>
              <li><strong>Name:</strong> ${payload.name}</li>
              <li><strong>Email:</strong> ${payload.email}</li>
              <li><strong>Phone:</strong> ${payload.phone}</li>
              <li><strong>Package:</strong> ${payload.package}</li>
              <li><strong>Destination:</strong> ${payload.destination || "—"}</li>
              <li><strong>Departure:</strong> ${payload.departure_date}</li>
              <li><strong>Return:</strong> ${payload.return_date}</li>
              <li><strong>Travelers:</strong> ${payload.travelers}</li>
              <li><strong>Notes:</strong> ${(payload.notes || "—").replace(/</g, "&lt;")}</li>
            </ul>
          </div>`;

        await resend.emails.send({
          from,
          to: ["admin@pwanbridgefort.ng"],
          subject: `New Travel Enquiry — ${payload.package} (${payload.name})`,
          html: adminHtml,
        });
      }
    } catch (e) {
      console.error("Email send failed:", e);
    }

    return new Response(JSON.stringify({ success: true, id: inserted.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    console.error("submit-travel-booking error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
