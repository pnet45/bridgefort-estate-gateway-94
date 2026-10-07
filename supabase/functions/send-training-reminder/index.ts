import { bridgefortEmail, escapeHtml } from "../_shared/email-template.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  event_title: string;
  event_date: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Internal scheduler authentication uses the existing hashed cron-token
  // record. The raw token is never stored in the database.
  const providedCron = req.headers.get("x-bridgefort-cron-token")?.trim() ?? "";
  const authorized = await (async () => {
    if (!providedCron) return false;
    const { data, error } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    ).from("automation_secrets")
      .select("secret_hash")
      .eq("secret_name", "inactive_account_reminders")
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data?.secret_hash) return false;
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(providedCron));
    const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return hex === data.secret_hash;
  })();

  if (!authorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase service configuration is missing");
    }
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Training dates are stored as YYYY-MM-DD. Use the project/server date
    // calculation already used by this function so the existing schedule
    // semantics remain unchanged.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: events, error: eventsError } = await supabase
      .from("training_events")
      .select("id, title, date, time, location")
      .eq("date", tomorrowStr);

    if (eventsError) throw eventsError;

    if (!events?.length) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No events scheduled for tomorrow",
          eventsFound: 0,
          remindersSent: 0,
          duplicatesSkipped: 0,
          failures: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    let remindersSent = 0;
    let duplicatesSkipped = 0;
    let failures = 0;

    for (const event of events as TrainingEvent[]) {
      const { data: registrations, error: registrationError } = await supabase
        .from("training_registrations")
        .select("id, name, email, event_title, event_date")
        .eq("event_title", event.title)
        .eq("event_date", event.date)
        .eq("need_reminder", true);

      if (registrationError) {
        console.error("Error fetching registrations:", registrationError);
        failures++;
        continue;
      }

      for (const registration of (registrations ?? []) as Registration[]) {
        const email = registration.email?.trim().toLowerCase();
        if (!email) continue;

        const eventKey = `training_reminder:${event.id}:${registration.id}:${event.date}`;
        const subject = `Reminder: ${event.title} Tomorrow!`;
        const sourceReference = `${event.id}:${registration.id}`;
        const templateKey = "training_reminder";
        const { data: trainingAllowed, error: preferenceError } = await supabase.rpc("email_preference_enabled", {
          p_user_id: null,
          p_category: "training",
        });
        if (preferenceError) {
          console.error("Failed to evaluate training email preference:", preferenceError);
          failures++;
          continue;
        }
        // Registration records currently do not carry a linked auth user ID.
        // Preference enforcement for anonymous registration emails is therefore
        // deferred to the registration/user-linking flow; do not suppress a
        // required reminder based on a null user ID.
        void trainingAllowed;
        const metadata = {
          event_id: event.id,
          event_title: event.title,
          event_date: event.date,
          event_time: event.time,
          event_location: event.location,
          registration_id: registration.id,
          reminder_date: tomorrowStr,
        };

        const { data: existing, error: existingError } = await supabase
          .from("email_delivery_events")
          .select("id, status, attempt_count")
          .eq("event_key", eventKey)
          .maybeSingle();

        if (existingError) {
          console.error("Failed to check delivery ledger:", existingError);
          failures++;
          continue;
        }

        if (existing?.status === "sent") {
          duplicatesSkipped++;
          continue;
        }

        const nextAttempt = (existing?.attempt_count ?? 0) + 1;

        const { data: queuedEvent, error: queueError } = await supabase
          .from("email_delivery_events")
          .upsert(
            {
              event_key: eventKey,
              recipient_email: email,
              recipient_name: registration.name,
              subject,
              provider: "resend",
              sender_email: "noreply@bridgeforthomes.com",
              sender_name: "Bridgefort Homes Development Ltd",
              template_key: templateKey,
              source_function: "send-training-reminder",
              source_reference: sourceReference,
              status: "queued",
              attempt_count: nextAttempt,
              error_message: null,
              metadata,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "event_key" },
          )
          .select("id")
          .single();

        if (queueError || !queuedEvent) {
          console.error("Failed to queue reminder:", queueError);
          failures++;
          continue;
        }

        try {
          const safeName = escapeHtml(registration.name);
          const safeTitle = escapeHtml(event.title);
          const safeDate = escapeHtml(
            new Date(`${event.date}T12:00:00`).toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          );
          const safeTime = escapeHtml(event.time);
          const safeLocation = escapeHtml(event.location);

          const html = bridgefortEmail(
            `
              <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.65;color:#25212b;">
                <h1 style="margin:0 0 16px;font-size:28px;color:#5b2a86;">Training Event Reminder</h1>
                <p>Hi ${safeName},</p>
                <p>This is a friendly reminder that you're registered for <strong>${safeTitle}</strong>, happening tomorrow.</p>
                <div style="margin:24px 0;padding:20px;background:#f7f3fa;border-left:4px solid #5b2a86;border-radius:8px;">
                  <p style="margin:0 0 10px;"><strong>Date:</strong> ${safeDate}</p>
                  <p style="margin:0 0 10px;"><strong>Time:</strong> ${safeTime}</p>
                  <p style="margin:0;"><strong>Location:</strong> ${safeLocation}</p>
                </div>
                <p><strong>What to bring:</strong></p>
                <ul>
                  <li>Notepad and pen</li>
                  <li>Your registration confirmation</li>
                  <li>An open mind ready to learn</li>
                </ul>
                <p>We're looking forward to seeing you there.</p>
                <p style="margin-top:28px;">
                  <strong>Questions?</strong><br>
                  Call +234 803 062 4059 or +234 807 071 0688<br>
                  Email <a href="mailto:info@bridgeforthomes.com">info@bridgeforthomes.com</a>
                </p>
              </div>
            `,
            {
              preheader: `Reminder: ${event.title} is tomorrow`,
              ctaLabel: "Visit Bridgefort Homes",
              ctaUrl: "https://www.bridgeforthomes.com",
            },
          );

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Bridgefort Homes Development Ltd <noreply@bridgeforthomes.com>",
              to: [email],
              subject,
              html,
            }),
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            const errorMessage = errorText.slice(0, 2000);

            await supabase
              .from("email_delivery_events")
              .update({
                status: "failed",
                error_message: errorMessage,
                updated_at: new Date().toISOString(),
              })
              .eq("id", queuedEvent.id);

            failures++;
            console.error(`Failed to send reminder to ${email}:`, errorText);
            continue;
          }

          const resendResult = await emailResponse.json().catch(() => ({}));
          const providerMessageId =
            typeof resendResult?.id === "string" ? resendResult.id : null;

          await supabase
            .from("email_delivery_events")
            .update({
              status: "sent",
              provider_message_id: providerMessageId,
              sent_at: new Date().toISOString(),
              error_message: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", queuedEvent.id);

          remindersSent++;
        } catch (emailError) {
          const errorMessage =
            emailError instanceof Error ? emailError.message : "Unknown email error";

          await supabase
            .from("email_delivery_events")
            .update({
              status: "failed",
              error_message: errorMessage.slice(0, 2000),
              updated_at: new Date().toISOString(),
            })
            .eq("id", queuedEvent.id);

          failures++;
          console.error(`Error sending reminder to ${email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: failures === 0,
        message: "Reminder check completed",
        eventsFound: events.length,
        remindersSent,
        duplicatesSkipped,
        failures,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: failures === 0 ? 200 : 207,
      },
    );
  } catch (error) {
    console.error("Error in send-training-reminder:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
