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
  captchaToken?: string;
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
  if (!b.captchaToken || typeof b.captchaToken !== "string") return "CAPTCHA required";
  return null;
}

async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = Deno.env.get("RECAPTCHA_SECRET_KEY");
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY missing — failing closed");
    return false;
  }
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const json = await res.json();
    return !!json.success;
  } catch (e) {
    console.error("captcha verify error:", e);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const err = validate(body);
    if (err) {
      return new Response(JSON.stringify({ error: err }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const payload: BookingPayload = body;

    // CAPTCHA
    const ok = await verifyCaptcha(payload.captchaToken!);
    if (!ok) {
      return new Response(JSON.stringify({ error: "captcha_failed", message: "CAPTCHA verification failed. Please try again." }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Rate limiting: max 3 enquiries / 15 min per IP, 2 per email
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const [{ count: ipCount }, { count: emailCount }] = await Promise.all([
      supabase.from("travel_booking_attempts").select("*", { count: "exact", head: true })
        .eq("ip_address", ip).gte("created_at", windowStart),
      supabase.from("travel_booking_attempts").select("*", { count: "exact", head: true })
        .eq("email", payload.email.toLowerCase()).gte("created_at", windowStart),
    ]);

    if ((ipCount || 0) >= 3 || (emailCount || 0) >= 2) {
      return new Response(JSON.stringify({
        error: "rate_limited",
        message: "Too many enquiries from your network. Please wait 15 minutes before trying again.",
      }), { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Log attempt (best effort)
    await supabase.from("travel_booking_attempts").insert({ ip_address: ip, email: payload.email.toLowerCase() });

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
        ip_address: ip,
        status: "received",
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    const origin = req.headers.get("origin") || "https://bridgefort.lovable.app";
    const statusUrl = `${origin}/travels/booking/${inserted.confirmation_token}`;

    // Send notification emails (best-effort)
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const resend = new Resend(resendKey);
        const from = "Bridgefort Travels <noreply@pwanbridgefort.ng>";

        const customerHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
            <h2 style="color:#4f46e5">Thank you, ${payload.name.split(" ")[0]}!</h2>
            <p>We've received your travel enquiry. Status: <strong>Received</strong>.</p>
            <p>A Bridgefort consultant will review and confirm your booking within 24 hours.</p>
            <p><a href="${statusUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Track your booking</a></p>
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
          from, to: [payload.email],
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
          from, to: ["admin@pwanbridgefort.ng"],
          subject: `New Travel Enquiry — ${payload.package} (${payload.name})`,
          html: adminHtml,
        });
      }
    } catch (e) {
      console.error("Email send failed:", e);
    }

    return new Response(JSON.stringify({
      success: true, id: inserted.id, token: inserted.confirmation_token, status: inserted.status,
    }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    console.error("submit-travel-booking error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
