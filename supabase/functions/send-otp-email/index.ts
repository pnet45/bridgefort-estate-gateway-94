import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPEmailRequest {
  email: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp }: OTPEmailRequest = await req.json();

    console.log(`Sending OTP to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Bridgefort Homes Development Ltd <noreply@pwanbridgefort.ng>",
      to: [email],
      subject: "Your Password Reset Code - Bridgefort Homes Development Ltd",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .otp-box {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
                border: 2px dashed #1e40af;
              }
              .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #1e40af;
                letter-spacing: 8px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              .warning {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              
              <p>We received a request to reset your Bridgefort Homes Development Ltd account password. Use the code below to complete the process:</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #6b7280;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>This code expires in 10 minutes</li>
                  <li>Never share this code with anyone</li>
                  <li>Bridgefort Homes Development Ltd staff will never ask for this code</li>
                </ul>
              </div>
              
              <p>If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>
              
              <div class="footer">
                <p><strong>Bridgefort Homes Development Ltd</strong></p>
                <p>...Rebuilding the Future</p>
                <p style="margin-top: 10px;">
                  Need help? Contact us at <a href="mailto:support@pwanbridgefort.ng" style="color: #1e40af;">support@pwanbridgefort.ng</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "OTP sent successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
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
