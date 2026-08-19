import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

interface EmailRequest { to: string; subject: string; html: string; text?: string; fromMailbox?: string; fromName?: string; cc?: string; bcc?: string; }
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const parseRecipients = (value?: string) => (value || "").split(/[,\n;]+/).map(v => v.trim()).filter(Boolean);
const validRecipients = (items: string[]) => items.every(email => emailRegex.test(email));

const htmlToText = (html: string) => html
  .replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
  .replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/[ \t]+\n/g, "\n").trim();

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw Object.assign(new Error("Unauthorized"), { status: 401 });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.slice(7);
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) throw Object.assign(new Error("Unauthorized"), { status: 401 });

    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await serviceClient.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) throw Object.assign(new Error("Forbidden: admin access required"), { status: 403 });

    const { to, subject, html, text, fromMailbox, fromName, cc, bcc }: EmailRequest = await req.json();
    if (!to?.trim() || !subject?.trim() || !html?.trim()) throw new Error("Missing required fields: to, subject, html");

    const toRecipients = parseRecipients(to);
    const ccRecipients = parseRecipients(cc);
    const bccRecipients = parseRecipients(bcc);
    if (!toRecipients.length || !validRecipients(toRecipients)) throw new Error("Invalid recipient email address");
    if (!validRecipients(ccRecipients)) throw new Error("Invalid Cc recipient email address");
    if (!validRecipients(bccRecipients)) throw new Error("Invalid Bcc recipient email address");

    const targetMailbox = (fromMailbox || "admin@pwanbridgefort.ng").trim().toLowerCase();
    if (!emailRegex.test(targetMailbox)) throw new Error("Invalid from mailbox address");
    const { data: authorized, error: mailboxError } = await serviceClient.rpc("user_mailbox_access", {
      _user_id: userData.user.id, _mailbox_email: targetMailbox, _provider: "resend"
    });
    if (mailboxError || !authorized) throw Object.assign(new Error("Forbidden: mailbox access denied"), { status: 403 });

    const senderDisplayName = fromName || "Bridgefort Homes Development Ltd";
    const plainText = text?.trim() || htmlToText(html) || " ";
    const emailResponse = await resend.emails.send({
      from: `${senderDisplayName} <${targetMailbox}>`,
      to: toRecipients,
      ...(ccRecipients.length ? { cc: ccRecipients } : {}),
      ...(bccRecipients.length ? { bcc: bccRecipients } : {}),
      subject: subject.trim(),
      html,
      text: plainText,
    });

    const { error: sentInsertError } = await serviceClient.from("admin_emails").insert({
      sender_id: userData.user.id, from_email: targetMailbox, from_name: senderDisplayName,
      to_email: toRecipients.join(", "), cc_email: ccRecipients.join(", ") || null, bcc_email: bccRecipients.join(", ") || null,
      subject: subject.trim(), body: plainText, html, folder: "sent", source: "resend", is_read: true,
      external_ref: (emailResponse as any)?.data?.id || (emailResponse as any)?.id || null,
    });
    if (sentInsertError) console.error("Failed to record sent email:", sentInsertError);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || "Email could not be sent" }), {
      status: error?.status || 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
