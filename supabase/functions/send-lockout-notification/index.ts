import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LockoutNotificationRequest {
  lockedEmail: string;
  attemptCount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lockedEmail, attemptCount }: LockoutNotificationRequest = await req.json();

    console.log(`Sending lockout notification for email: ${lockedEmail}`);

    // Admin email that can unlock accounts
    const adminEmail = "admin@pwanbridgefort.ng";

    // Create Supabase client to get more details
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get failed attempt details
    const { data: attempts } = await supabase
      .from("failed_login_attempts")
      .select("*")
      .eq("email", lockedEmail.toLowerCase())
      .order("attempted_at", { ascending: false })
      .limit(5);

    const attemptDetails = attempts?.map(a => 
      `- ${new Date(a.attempted_at).toLocaleString()} ${a.ip_address ? `(IP: ${a.ip_address})` : ''}`
    ).join('\n') || 'No details available';

    // Send notification to admin
    const emailResponse = await resend.emails.send({
      from: "PWAN Bridgefort Security <noreply@pwanbridgefort.ng>",
      to: [adminEmail],
      subject: `🔒 Account Locked: ${lockedEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f7fafc; padding: 30px; border: 1px solid #e2e8f0; }
            .alert-box { background: #fed7d7; border: 1px solid #fc8181; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0; }
            .footer { text-align: center; padding: 20px; color: #718096; font-size: 12px; }
            .btn { display: inline-block; background: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
            code { background: #edf2f7; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Account Lockout Alert</h1>
              <p>PWAN Bridgefort Admin Security</p>
            </div>
            <div class="content">
              <div class="alert-box">
                <strong>⚠️ Security Alert:</strong> An admin account has been locked due to multiple failed login attempts.
              </div>
              
              <div class="details">
                <h3>Account Details</h3>
                <p><strong>Email:</strong> <code>${lockedEmail}</code></p>
                <p><strong>Failed Attempts:</strong> ${attemptCount}</p>
                <p><strong>Lock Duration:</strong> 15 minutes</p>
                <p><strong>Lock Time:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <div class="details">
                <h3>Recent Failed Attempts</h3>
                <pre style="font-size: 12px; color: #4a5568;">${attemptDetails}</pre>
              </div>

              <div class="details">
                <h3>How to Unlock</h3>
                <p>As the designated admin, you can unlock this account by:</p>
                <ol>
                  <li>Log in to the admin dashboard</li>
                  <li>Go to User Management</li>
                  <li>Find the user and click "Unlock Account"</li>
                </ol>
                <p>Or execute this SQL in Supabase:</p>
                <code>SELECT clear_failed_logins('${lockedEmail}');</code>
              </div>

              <p style="color: #718096; font-size: 14px;">
                This notification was sent because you are the designated admin for account unlock requests.
                If you did not expect this notification, please investigate immediately.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} PWAN Bridgefort Estate and Investment Ltd.</p>
              <p>This is an automated security notification.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Lockout notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-lockout-notification function:", error);
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
