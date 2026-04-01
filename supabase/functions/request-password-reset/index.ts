import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Rate limit: max 3 OTPs per email in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("password_reset_otps")
      .select("*", { count: "exact", head: true })
      .eq("email", email.toLowerCase())
      .gte("created_at", tenMinutesAgo);

    if (count && count >= 3) {
      // Return success to prevent enumeration, but don't send
      return new Response(
        JSON.stringify({ success: true, message: "If this email exists, an OTP was sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate cryptographically secure OTP
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const otpCode = String(100000 + (array[0] % 900000));

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store OTP with service role (bypasses RLS)
    const { error: insertError } = await supabase
      .from("password_reset_otps")
      .insert({
        email: email.toLowerCase(),
        otp_code: otpCode,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Failed to store OTP:", insertError);
      throw new Error("Failed to generate reset code");
    }

    // Send OTP email
    await resend.emails.send({
      from: "PWAN Bridgefort <noreply@pwanbridgefort.ng>",
      to: [email],
      subject: "Your Password Reset Code - PWAN Bridgefort",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hello,</p>
              <p>We received a request to reset your PWAN Bridgefort account password. Use the code below:</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #1e40af;">
                <p style="margin: 0 0 10px 0; color: #6b7280;">Your verification code is:</p>
                <div style="font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 8px;">${otpCode}</div>
              </div>
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>This code expires in 10 minutes</li>
                  <li>Never share this code with anyone</li>
                </ul>
              </div>
              <p>If you didn't request this, please ignore this email.</p>
              <div style="text-align: center; padding: 20px; color: #a0aec0; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
                <p><strong>PWAN Bridgefort</strong></p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Always return same response to prevent email enumeration
    return new Response(
      JSON.stringify({ success: true, message: "If this email exists, an OTP was sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in request-password-reset:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
