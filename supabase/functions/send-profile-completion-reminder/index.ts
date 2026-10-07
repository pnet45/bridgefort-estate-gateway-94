import { bridgefortEmail, escapeHtml } from "../_shared/email-template.ts";
import { sendTrackedEmail } from "../_shared/email-delivery.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileData {
  email: string;
  first_name: string | null;
  completion_percentage: number | null;
}

interface RequestBody {
  profiles: ProfileData[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authed = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authed.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await service.rpc("has_role", { _user_id: claimsData.claims.sub, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { profiles }: RequestBody = await req.json();

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ error: "No profiles provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending profile completion reminders to ${profiles.length} users`);

    const emailPromises = profiles.map(async (profile) => {
      const percentage = profile.completion_percentage || 0;
      const firstName = profile.first_name || "Valued User";

      try {
        const safeFirstName = escapeHtml(firstName);
        const safeEmail = profile.email.trim().toLowerCase();
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(safeEmail));
        const emailKey = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");

        const emailResponse = await sendTrackedEmail({
          supabase: service,
          resend,
          eventKey: `profile_completion_manual:${emailKey}:${new Date().toISOString().slice(0, 10)}`,
          recipientEmail: safeEmail,
          recipientName: firstName,
          templateKey: "profile_completion_reminder",
          sourceFunction: "send-profile-completion-reminder",
          sourceReference: safeEmail,
          metadata: { completion_percentage: percentage, manual: true },
          payload: {
            from: "Bridgefort Homes Development Ltd <noreply@bridgeforthomes.com>",
            to: [safeEmail],
            subject: "Complete Your Profile - Unlock Full Access to Bridgefort Homes Development Ltd",
            html: bridgefortEmail(`
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
              <h2>🏡 Complete Your Bridgefort Homes Profile</h2>
              <p>Dear ${safeFirstName},</p>
              <p>Your profile is currently <strong>${percentage}% complete</strong>. Completing it helps us serve you better and gives you access to more account features.</p>
              <div style="margin:20px 0;padding:16px;background:#f3eef8;border-radius:10px;text-align:center">
                <strong>${percentage}% complete</strong>
              </div>
              <p>Complete your profile today and continue your Bridgefort Homes journey.</p>
              <p><a href="https://www.bridgeforthomes.com/profile" style="display:inline-block;background:#5b2a86;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Complete My Profile</a></p>
              <p style="margin-top:28px">Best regards,<br><strong>The Bridgefort Homes Development Ltd Team</strong><br><em>Bringing your dream home!</em></p>
            `)
          },
        });

        console.log(`Email sent successfully to ${profile.email}:`, emailResponse);
        return { success: true, email: profile.email };
      } catch (error) {
        console.error(`Failed to send email to ${profile.email}:`, error);
        return { success: false, email: profile.email, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Bulk email results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successful} emails successfully`,
        successful,
        failed,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-profile-completion-reminder function:", error);
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
