import { bridgefortEmail } from "../_shared/email-template.ts";
import { sendTrackedEmail } from "../_shared/email-delivery.ts";
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
  .replace(/"/g, "&quot;")
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

    let customerId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const { data: authData } = await supabase.auth.getUser(authHeader.slice(7));
        customerId = authData.user?.id ?? null;
      } catch (authError) {
        console.warn("travel booking: optional auth lookup failed", authError);
      }
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 16_384) return json({ error: "Enquiry is too large" }, 413);

    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "Invalid enquiry payload" }, 400);
    }

    // Honeypot: real visitors never see or fill this field.
    if (String(body?.website ?? body?.company_website ?? "").trim()) {
      return json({ success: true }, 202);
    }

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

    // Persistent per-IP throttling (15-minute window, 5 attempts). The IP is
    // hashed before storage; raw addresses are never written to the database.
    const forwardedFor = req.headers.get("cf-connecting-ip")
      || req.headers.get("x-real-ip")
      || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || "unknown";
    const rateKeyMaterial = forwardedFor === "unknown" ? `email:${email}` : `ip:${forwardedFor}`;
    const rateLimitKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const rateKeyDigest = await crypto.subtle.sign(
      "HMAC",
      rateLimitKey,
      new TextEncoder().encode(rateKeyMaterial),
    );
    const rateKey = Array.from(new Uint8Array(rateKeyDigest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const { data: allowed, error: rateLimitError } = await supabase.rpc(
      "consume_travel_enquiry_rate_limit",
      { _client_key: rateKey, _window_seconds: 900, _max_requests: 5 },
    );
    if (rateLimitError) {
      console.error("travel enquiry rate-limit check failed", rateLimitError);
      return json({ error: "Enquiry service is temporarily unavailable. Please try again shortly." }, 503);
    }
    if (allowed !== true) {
      return json({ error: "Too many enquiries. Please try again in 15 minutes." }, 429);
    }

    // Optional Cloudflare Turnstile verification. Enforcement is activated only
    // when TURNSTILE_ENABLED=true and TURNSTILE_SECRET_KEY is configured.
    const turnstileEnabled = Deno.env.get("TURNSTILE_ENABLED") === "true";
    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (turnstileEnabled && !turnstileSecret) {
      return json({ error: "Security check is temporarily unavailable. Please try again shortly." }, 503);
    }
    if (turnstileEnabled && turnstileSecret) {
      const captchaToken = String(body?.captcha_token ?? "").trim();
      if (!captchaToken) return json({ error: "Please complete the security check." }, 403);

      const verification = new URLSearchParams({
        secret: turnstileSecret,
        response: captchaToken,
      });
      if (forwardedFor !== "unknown") verification.set("remoteip", forwardedFor);
      const captchaResponse = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        { method: "POST", body: verification },
      );
      const captchaResult = await captchaResponse.json().catch(() => null);
      if (!captchaResponse.ok || captchaResult?.success !== true) {
        return json({ error: "Security check failed. Please try again." }, 403);
      }
    }

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
        customer_id: customerId,
        confirmation_token: crypto.randomUUID(),
      })
      .select("*")
      .single();

    if (insertError) throw insertError;

    // The database BEFORE INSERT trigger is the single authoritative CRM
    // synchronisation path. It creates/links the lead and service journey and
    // writes their IDs onto this booking. Do not repeat those writes here.
    const crmLeadId: string | null = booking.crm_lead_id ?? null;
    const serviceJourneyId: string | null = booking.service_journey_id ?? null;

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
      try {
        await sendTrackedEmail({
          supabase,
          resend,
          eventKey: `travel_booking_received:${booking.id}`,
          recipientEmail: email,
          recipientUserId: null,
          recipientName: name,
          templateKey: "travel_booking_received",
          sourceFunction: "submit-travel-booking",
          sourceReference: booking.id,
          metadata: { booking_id: booking.id, package: packageName, destination, departure_date: departureDate, return_date: returnDate },
          payload: { from, to: [email], subject: "Bridgefort Travels — enquiry received", html: bridgefortEmail(customerHtml) },
        });
      } catch (e) {
        console.error("customer confirmation:", e);
      }
    }

    return json({
      success: true,
      token: booking.confirmation_token,
      bookingId: booking.id,
      status: booking.status,
      crmLeadId: crmLeadId,
      serviceJourneyId: serviceJourneyId,
    });
  } catch (error: any) {
    console.error("submit-travel-booking error:", error);
    return json({ error: error?.message || "Unable to submit travel booking" }, 500);
  }
});
