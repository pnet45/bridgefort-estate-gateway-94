import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-email function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: require valid JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = userData.user.id;

    // Verify admin role
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await serviceClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const targetMailbox = "admin@pwanbridgefort.ng";
    const { data: isMailboxAuthorized, error: mailboxError } = await serviceClient.rpc("user_mailbox_access", {
      _user_id: userId,
      _mailbox_email: targetMailbox,
      _provider: "resend",
    });

    if (mailboxError || !isMailboxAuthorized) {
      return new Response(JSON.stringify({ error: "Forbidden: mailbox access denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { to, subject, html, text }: EmailRequest = await req.json();
    console.log(`Admin ${userId} sending email to: ${to}, subject: ${subject}`);

    if (!to || !subject || !html) {
      throw new Error("Missing required fields: to, subject, html");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid recipient email address");
    }

    const emailResponse = await resend.emails.send({
      from: "Bridgefort Homes Development Ltd <noreply@bridgeforthomes.com>",
      to: [to],
      subject: subject,
      html: html,
      ...(text && { text }),
    });

    console.log("Email sent successfully:", emailResponse);

    // Without this, "Sent" was permanently empty for Resend — nothing ever
    // recorded that a message went out, only that it arrived (via the
    // inbound webhook). service role bypasses RLS since this is a
    // system-of-record write, not something the admin's own session needs
    // direct insert rights for.
    const adminClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error: sentInsertError } = await adminClient.from("admin_emails").insert({
      sender_id: userId,
      from_email: "noreply@bridgeforthomes.com",
      from_name: "Bridgefort Homes Development Ltd",
      to_email: to,
      subject,
      body: text || html,
      html,
      folder: "sent",
      source: "resend",
      is_read: true,
      external_ref: (emailResponse as any)?.data?.id || (emailResponse as any)?.id || null,
    });
    if (sentInsertError) {
      console.error("Failed to record sent email:", sentInsertError);
    }

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
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
