import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
        const emailResponse = await resend.emails.send({
          from: "PWAN Bridgefort <noreply@pwanbridgefort.ng>",
          to: [profile.email],
          subject: "Complete Your Profile - Unlock Full Access to PWAN Bridgefort",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                  .progress-bar { background: #e5e7eb; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
                  .progress-fill { background: linear-gradient(90deg, #3b82f6, #1e40af); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
                  .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                  .benefit-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                  .benefit-item:last-child { border-bottom: none; }
                  .cta-button { display: inline-block; background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                  .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🏡 Complete Your PWAN Bridgefort Profile</h1>
                  </div>
                  <div class="content">
                    <p>Dear ${firstName},</p>
                    
                    <p>We noticed that your profile is currently <strong>${percentage}% complete</strong>. You're so close to unlocking the full benefits of your PWAN Bridgefort account!</p>
                    
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${percentage}%">
                        ${percentage}%
                      </div>
                    </div>
                    
                    <div class="benefits">
                      <h3 style="margin-top: 0;">🎁 Benefits of Completing Your Profile (70%+):</h3>
                      <div class="benefit-item">✅ <strong>Purchase Properties</strong> - Buy your dream home or investment property</div>
                      <div class="benefit-item">✅ <strong>Access Documentation Services</strong> - Process all property paperwork seamlessly</div>
                      <div class="benefit-item">✅ <strong>Exclusive Deals</strong> - Get notified about special property offers</div>
                      <div class="benefit-item">✅ <strong>Priority Support</strong> - Receive dedicated assistance from our team</div>
                      <div class="benefit-item">✅ <strong>Training Certificates</strong> - Download your certificates after attending events</div>
                    </div>
                    
                    <p><strong>Complete your profile today and start enjoying these amazing benefits!</strong></p>
                    
                    <center>
                      <a href="https://pwanbridgefort.ng/profile" class="cta-button">
                        Complete My Profile Now
                      </a>
                    </center>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                      Need help? Our support team is here to assist you at any time.
                    </p>
                    
                    <p style="margin-top: 20px;">
                      Best regards,<br>
                      <strong>The PWAN Bridgefort Team</strong><br>
                      <em>Rebuilding the future, one property at a time</em>
                    </p>
                  </div>
                  <div class="footer">
                    <p>© 2025 PWAN Bridgefort. All rights reserved.</p>
                    <p>You received this email because you have an account with PWAN Bridgefort.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
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
