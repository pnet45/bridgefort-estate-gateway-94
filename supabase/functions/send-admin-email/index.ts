import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  name?: string;
  subject: string;
  body: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-admin-email function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, subject, body }: EmailRequest = await req.json();
    console.log(`Sending email to: ${to}, subject: ${subject}`);

    if (!to || !subject || !body) {
      throw new Error("Missing required fields: to, subject, body");
    }

    const emailResponse = await resend.emails.send({
      from: "PWAN Bridgefort <noreply@pwanbridgefort.ng>",
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">Bridgefort</h1>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px;">
            ${name ? `<p style="font-size: 16px;">Dear ${name},</p>` : ''}
            
            <div style="white-space: pre-wrap; font-size: 16px;">
              ${body}
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #718096; font-size: 14px; margin: 0;">
              Best regards,<br>
              <strong>The Bridgefort Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #a0aec0; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Bridgefort. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This email was sent from Bridgefort Mail Center</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
