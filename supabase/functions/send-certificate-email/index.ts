import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { attendanceId } = await req.json();

    if (!attendanceId) {
      throw new Error("Attendance ID is required");
    }

    console.log(`Generating certificate for attendance ID: ${attendanceId}`);

    // Fetch attendance record with related data
    const { data: attendance, error: fetchError } = await supabase
      .from("training_attendance")
      .select(`
        *,
        training_events (
          title,
          date,
          location,
          category
        ),
        training_registrations (
          name,
          email
        )
      `)
      .eq("id", attendanceId)
      .single();

    if (fetchError || !attendance) {
      console.error("Error fetching attendance:", fetchError);
      throw new Error("Attendance record not found");
    }

    if (!attendance.completed) {
      throw new Error("Training not completed yet");
    }

    const event = attendance.training_events;
    const registration = attendance.training_registrations;

    if (!event || !registration) {
      throw new Error("Event or registration data not found");
    }

    console.log(`Generating certificate for ${registration.name} - ${event.title}`);

    // Generate certificate HTML
    const certificateHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Georgia', serif;
              margin: 0;
              padding: 40px;
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            }
            .certificate {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 60px;
              border: 20px solid #d4af37;
              box-shadow: 0 0 50px rgba(0,0,0,0.3);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .title {
              font-size: 48px;
              color: #1e3a8a;
              margin: 20px 0;
              text-transform: uppercase;
              letter-spacing: 3px;
            }
            .subtitle {
              font-size: 20px;
              color: #666;
              margin: 10px 0;
            }
            .recipient {
              text-align: center;
              margin: 40px 0;
            }
            .recipient-name {
              font-size: 36px;
              color: #1e3a8a;
              font-weight: bold;
              margin: 20px 0;
              border-bottom: 2px solid #d4af37;
              display: inline-block;
              padding-bottom: 10px;
            }
            .content {
              text-align: center;
              font-size: 18px;
              line-height: 1.8;
              color: #333;
              margin: 30px 0;
            }
            .event-details {
              margin: 30px 0;
              padding: 20px;
              background: #f8f9fa;
              border-left: 4px solid #1e3a8a;
            }
            .event-details p {
              margin: 10px 0;
              font-size: 16px;
              color: #555;
            }
            .footer {
              margin-top: 50px;
              display: flex;
              justify-content: space-around;
              align-items: flex-end;
            }
            .signature {
              text-align: center;
            }
            .signature-line {
              border-top: 2px solid #333;
              width: 200px;
              margin: 10px auto;
            }
            .date {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
            .seal {
              width: 100px;
              height: 100px;
              border: 3px solid #d4af37;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              font-size: 14px;
              color: #1e3a8a;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="seal">PWAN</div>
              <div class="title">Certificate of Completion</div>
              <div class="subtitle">This is to certify that</div>
            </div>
            
            <div class="recipient">
              <div class="recipient-name">${registration.name}</div>
            </div>
            
            <div class="content">
              <p>has successfully completed the training program</p>
            </div>
            
            <div class="event-details">
              <p><strong>Event:</strong> ${event.title}</p>
              <p><strong>Category:</strong> ${event.category}</p>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Location:</strong> ${event.location}</p>
            </div>
            
            <div class="footer">
              <div class="signature">
                <div class="signature-line"></div>
                <p>Training Coordinator</p>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <p>Director</p>
              </div>
            </div>
            
            <div class="date">
              Issued on ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </body>
      </html>
    `;

    console.log(`Sending certificate email to ${registration.email}`);

    // Send email with certificate
    const emailResponse = await resend.emails.send({
      from: "PWAN Training <onboarding@resend.dev>",
      to: [registration.email],
      subject: `Your Certificate of Completion - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e3a8a;">Congratulations ${registration.name}!</h2>
          <p>We are pleased to inform you that you have successfully completed the <strong>${event.title}</strong> training program.</p>
          <p>Please find your Certificate of Completion attached to this email.</p>
          <p>You can also download it anytime from your dashboard.</p>
          <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Training Details:</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Category:</strong> ${event.category}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Location:</strong> ${event.location}</p>
          </div>
          <p>Thank you for your participation and dedication!</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            PWAN Training Team
          </p>
        </div>
        <div style="margin-top: 40px;">
          ${certificateHtml}
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Update the attendance record to mark certificate as issued
    const { error: updateError } = await supabase
      .from("training_attendance")
      .update({
        certificate_issued: true,
        certificate_issued_at: new Date().toISOString(),
      })
      .eq("id", attendanceId);

    if (updateError) {
      console.error("Error updating attendance:", updateError);
      throw new Error("Failed to update attendance record");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Certificate email sent successfully",
        emailId: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-certificate-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
});
