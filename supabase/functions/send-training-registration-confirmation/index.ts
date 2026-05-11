import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

    console.log("Sending training registration confirmation to:", email);

    const emailResponse = await resend.emails.send({
      from: "Bridgefort Homes Development Ltd <noreply@pwanbridgefort.ng>",
      to: [email],
      subject: `Registration Confirmed: ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%);
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
              .event-details {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #2563eb;
              }
              .detail-row {
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .detail-label {
                font-weight: 600;
                color: #1a365d;
                display: inline-block;
                min-width: 120px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
              .button {
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Registration Confirmed! ✓</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1a365d;">Hi ${name},</p>
              
              <p>Thank you for registering for our training event! We're excited to have you join us.</p>
              
              <div class="event-details">
                <h2 style="margin-top: 0; color: #1a365d;">Event Details</h2>
                <div class="detail-row">
                  <span class="detail-label">Event:</span>
                  <span>${eventTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span>${eventDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Your Name:</span>
                  <span>${name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span>${phone}</span>
                </div>
              </div>
              
              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Save this email for your records</li>
                <li>Mark your calendar for ${eventDate}</li>
                <li>You'll receive a reminder 24 hours before the event</li>
                <li>Bring a valid ID and be ready to learn!</li>
              </ul>
              
              <p>If you have any questions or need to make changes to your registration, please contact us.</p>
              
              <div class="footer">
                <p><strong>PwanBridgeFort Training Team</strong></p>
                <p>Building futures through quality training and education</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
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
