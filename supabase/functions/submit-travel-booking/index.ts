import { bridgefortEmail } from "../_shared/email-template.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

const escapeHtml = (value: unknown) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const phone = String(body?.phone ?? "").trim();
    const departureDate = String(body?.departure_date ?? "").trim();
    const returnDate = String(body?.return_date ?? "").trim();
    const travelers = Number(body?.travelers);
    const packageName = String(body?.package ?? "").trim();
    const destination = body?.destination ? String(body.destination).trim() : null;
    const notes = body?.notes ? String(body.notes).trim() : null;

    if (!name || name.length < 2 || name.length > 100) return json({ error: "Valid full name is required" }, 400);
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 255) return json({ error: "Valid email is required" }, 400);
    if (phone.length < 7 || phone.length > 20) return json({ error: "Valid phone number is required" }, 400);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(departureDate) || !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) return json({ error: "Valid travel dates are required" }, 400);
    if (returnDate < departureDate) return json({ error: "Return date must be after departure date" }, 400);
    if (!Number.isInteger(travelers) || travelers < 1 || travelers > 50) return json({ error: "Travelers must be between 1 and 50" }, 400);
    if (!packageName || packageName.length > 100) return json({ error: "Travel package is required" }, 400);
    if (destination && destination.length > 120) return json({ error: "Destination is too long" }, 400);
    if (notes && notes.length > 1000) return json({ error: "Notes are too long" }, 400);

    const { data: blackout, error: blackoutError } = await supabase
      .from("travel_package_blackouts")
      .select("package,start_date,end_date,reason")
      .eq("package", packageName)
      .lte("start_date", returnDate)
      .gte("end_date", departureDate)
      .limit(1)
      .maybeSingle();

    if (blackoutError) throw blackoutError;
    if (blackout) {
      return json({
        error: "Selected dates are unavailable",
        message: `The ${packageName} package isn't available between ${blackout.start_date} and ${blackout.end_date}${blackout.reason ? ` — ${blackout.reason}` : ""}.`,
      }, 409);
    }

    const { data: booking, error: insertError } = await supabase
      .from("travel_bookings")
      .insert({
        name,
        email,
        phone,
        departure_date: departureDate,
        return_date: returnDate,
        travelers,
        package: packageName,
        destination,
        notes,
        status: "received",
        confirmation_token: crypto.randomUUID(),
      })
      .select("*")
      .single();

    if (insertError) throw insertError;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendKey ? new Resend(resendKey) : null;
    const from = "Bridgefort Travels <travels@bridgeforthomes.com>";
    const origin = req.headers.get("origin") || "https://bridgeforthomes.com";
    const statusUrl = `${origin}/travels/booking/${booking.confirmation_token}`;

    // Put the booking directly into the admin mail centre so the request is
    // visible even when external mailbox sync is delayed.
    const adminSubject = `New travel booking — ${name} — ${packageName}`;
    const adminBody = [
      `New Bridgefort Travels booking received.`,
      `Customer: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Package: ${packageName}`,
      `Destination: ${destination || "—"}`,
      `Departure: ${departureDate}`,
      `Return: ${returnDate}`,
      `Travelers: ${travelers}`,
      `Notes: ${notes || "—"}`,
      `Booking ID: ${booking.id}`,
    ].join("\n");

    const { error: adminMailError } = await supabase.from("admin_emails").insert({
      from_email: email,
      from_name: name,
      to_email: "travels@bridgeforthomes.com",
      to_name: "Bridgefort Travels",
      subject: adminSubject,
      body: adminBody,
      html: bridgefortEmail(`<div style="font-family:Arial,sans-serif"><h2>New travel booking received</h2><p><strong>Customer:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone)}</p><p><strong>Package:</strong> ${escapeHtml(packageName)}</p><p><strong>Destination:</strong> ${escapeHtml(destination || "—")}</p><p><strong>Departure:</strong> ${escapeHtml(departureDate)}</p><p><strong>Return:</strong> ${escapeHtml(returnDate)}</p><p><strong>Travelers:</strong> ${travelers}</p><p><strong>Notes:</strong> ${escapeHtml(notes || "—")}</p></div>`),
      folder: "inbox",
      is_read: false,
      source: "travel_booking",
      external_ref: booking.id,
      account_email: "travels@bridgeforthomes.com",
    });
    if (adminMailError) console.error("admin inbox insert:", adminMailError);

    if (resend) {
      const customerHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111"><h2 style="color:#4f46e5">Travel enquiry received ✈️</h2><p>Hi ${escapeHtml(name.split(" ")[0])},</p><p>We have received your Bridgefort Travels booking enquiry and our travel team will review it.</p><p><strong>Package:</strong> ${escapeHtml(packageName)}<br/><strong>Destination:</strong> ${escapeHtml(destination || "—")}<br/><strong>Departure:</strong> ${escapeHtml(departureDate)}<br/><strong>Return:</strong> ${escapeHtml(returnDate)}<br/><strong>Travellers:</strong> ${travelers}</p><p><a href="${escapeHtml(statusUrl)}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Track your booking</a></p></div>`;
      await resend.emails.send({
        from,
        to: [email],
        subject: "Bridgefort Travels — enquiry received",
        html: bridgefortEmail(customerHtml),
      }).catch((e) => console.error("customer confirmation:", e));
    }

    return json({
      success: true,
      token: booking.confirmation_token,
      bookingId: booking.id,
      status: booking.status,
    });
  } catch (error: any) {
    console.error("submit-travel-booking error:", error);
    return json({ error: error?.message || "Unable to submit travel booking" }, 500);
  }
});
