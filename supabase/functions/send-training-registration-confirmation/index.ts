import { bridgefortEmail } from "../_shared/email-template.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FROM_EMAIL = "noreply@bridgeforthomes.com";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RegistrationConfirmationRequest {
  name: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  phone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, eventTitle, eventDate, phone }: RegistrationConfirmationRequest = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // This endpoint may only confirm a registration that actually exists —
    // otherwise it can be abused as an open mail relay to send templated
    // mail with attacker-controlled content to arbitrary addresses.
    const svc = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const { data: registration, error: regError } = await svc
      .from("training_registrations")
      .select("id, name, email, phone")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (regError) {
      console.error("Registration lookup failed:", regError);
    }
    if (!registration) {
      return new Response(
        JSON.stringify({ error: "No matching registration found for this email" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Only trusted, stored values are echoed back into the email body.
    const safeName = registration.name || name || "there";
    const safePhone = registration.phone || phone || "";

    const confirmationHtml = bridgefortEmail(`
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
          <h2 style="color:#5b2a86">Registration Confirmed! ✓</h2>
          <p style="font-size:18px;color:#3b2057">Hi ${safeName},</p>
          <p>Thank you for registering for our training event! We're excited to have you join us.</p>
          <div style="background:#fff;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #5b2a86">
            <h3 style="margin-top:0;color:#3b2057">Event Details</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Date:</strong> ${eventDate}</p>
            <p><strong>Your Name:</strong> ${safeName}</p>
            <p><strong>Phone:</strong> ${safePhone}</p>
          </div>
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Save this email for your records</li>
            <li>Mark your calendar for ${eventDate}</li>
            <li>You'll receive a reminder 24 hours before the event</li>
            <li>Bring a valid ID and be ready to learn!</li>
          </ul>
          <p>If you have any questions or need to make changes to your registration, please contact us.</p>
          <p style="margin-top:28px">Best regards,<br><strong>Bridgefort Homes Training Team</strong><br>Bringing your dream home!</p>
        </div>
      `);
    const eventKey = `training_registration_confirmation:${registration.id}:${eventTitle}:${eventDate}`;
    const { data: existingEvent } = await svc.from("email_delivery_events").select("status, provider_message_id, attempt_count").eq("event_key", eventKey).maybeSingle();
    if (existingEvent?.status === "sent") {
      return new Response(JSON.stringify({ success: true, duplicate: true, resend_id: existingEvent.provider_message_id }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    await svc.from("email_delivery_events").upsert({ event_key: eventKey, recipient_email: email, recipient_name: safeName, subject: `Registration Confirmed: ${eventTitle}`, provider: "resend", sender_email: FROM_EMAIL, sender_name: "Bridgefort Homes Development Ltd.", template_key: "training_registration_confirmation", source_function: "send-training-registration-confirmation", source_reference: registration.id, status: "queued", attempt_count: (existingEvent?.attempt_count || 0) + 1, metadata: { eventTitle, eventDate, registration_id: registration.id },
    retryable: true,
    payload: { from: `Bridgefort Homes Development Ltd <${FROM_EMAIL}>`, to: [email], subject: `Registration Confirmed: ${eventTitle}`, html: confirmationHtml }, updated_at: new Date().toISOString() }, { onConflict: "event_key" });

    console.log("Sending training registration confirmation to:", email);


    const emailResponse = await resend.emails.send({
      from: `Bridgefort Homes Development Ltd <${FROM_EMAIL}>`,
      to: [email],
      subject: `Registration Confirmed: ${eventTitle}`,
      html: confirmationHtml,
    });

    if (emailResponse?.error) {
      const message = emailResponse.error.message || "Training confirmation email failed";
      await svc.from("email_delivery_events").update({
        status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      }).eq("event_key", eventKey);
      return new Response(JSON.stringify({ success: false, error: message }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resendId = emailResponse?.data?.id || null;
    await svc.from("email_delivery_events").update({ status: "sent", provider_message_id: resendId, sent_at: new Date().toISOString(), updated_at: new Date().toISOString(), error_message: null }).eq("event_key", eventKey);
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Training registration confirmation failed:", error);
    console.error("Error in send-training-registration-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
