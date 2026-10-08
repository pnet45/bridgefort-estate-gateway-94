import { bridgefortEmail } from "../_shared/email-template.ts";
import { sendTrackedEmail } from "../_shared/email-delivery.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

interface EmailAttachmentInput {
  url: string;
  name: string;
  type?: string;
  size?: number;
}

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromMailbox?: string;
  fromName?: string;
  cc?: string;
  bcc?: string;
  eventKey?: string;
  attachments?: EmailAttachmentInput[];
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const parseRecipients = (value?: string) => (value || "").split(/[,\n;]+/).map(v => v.trim()).filter(Boolean);
const validRecipients = (items: string[]) => items.every(email => emailRegex.test(email));

const htmlToText = (html: string) => html
  .replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<br\s*\/?\s*>/gi, "\n").replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
  .replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/[ \t]+\n/g, "\n").trim();

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunkSize, bytes.length)));
  }
  return btoa(binary);
};

const safeFilename = (name: string) =>
  String(name || "attachment").replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 180) || "attachment";

async function prepareAttachments(items: EmailAttachmentInput[] | undefined, supabaseUrl: string) {
  const attachments = Array.isArray(items) ? items : [];
  if (attachments.length > 10) throw new Error("You can attach a maximum of 10 files.");

  const origin = new URL(supabaseUrl).origin;
  let totalBytes = 0;
  const prepared: Array<{ filename: string; content: string; contentType?: string }> = [];
  const metadata: EmailAttachmentInput[] = [];

  for (const item of attachments) {
    if (!item?.url || !item?.name) throw new Error("Invalid email attachment.");
    const url = new URL(item.url);
    if (url.origin !== origin || !url.pathname.startsWith("/storage/v1/object/public/")) {
      throw new Error("Email attachments must come from Bridgefort storage.");
    }

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Unable to read attachment "${safeFilename(item.name)}".`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    totalBytes += bytes.byteLength;
    if (bytes.byteLength > 10 * 1024 * 1024 || totalBytes > 20 * 1024 * 1024) {
      throw new Error("Email attachments must be 10MB or less per file and 20MB or less in total.");
    }

    prepared.push({
      filename: safeFilename(item.name),
      content: toBase64(bytes),
      contentType: item.type || response.headers.get("content-type") || undefined,
    });
    metadata.push({
      url: item.url,
      name: safeFilename(item.name),
      type: item.type,
      size: bytes.byteLength,
    });
  }

  return { prepared, metadata };
}

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

    const { to, subject, html, text, fromMailbox, fromName, cc, bcc, eventKey, attachments }: EmailRequest = await req.json();
    if (!to?.trim() || !subject?.trim() || !html?.trim()) throw new Error("Missing required fields: to, subject, html");

    const toRecipients = parseRecipients(to);
    const ccRecipients = parseRecipients(cc);
    const bccRecipients = parseRecipients(bcc);
    if (!toRecipients.length || !validRecipients(toRecipients)) throw new Error("Invalid recipient email address");
    if (!validRecipients(ccRecipients)) throw new Error("Invalid Cc recipient email address");
    if (!validRecipients(bccRecipients)) throw new Error("Invalid Bcc recipient email address");

    const targetMailbox = (fromMailbox || "info@bridgeforthomes.com").trim().toLowerCase();
    if (!emailRegex.test(targetMailbox)) throw new Error("Invalid from mailbox address");
    const { data: authorized, error: mailboxError } = await serviceClient.rpc("user_mailbox_access", {
      _user_id: userData.user.id, _mailbox_email: targetMailbox, _provider: "resend"
    });
    if (mailboxError || !authorized) throw Object.assign(new Error("Forbidden: mailbox access denied"), { status: 403 });

    const { prepared: resendAttachments, metadata: attachmentMetadata } = await prepareAttachments(attachments, supabaseUrl);
    const senderDisplayName = fromName || "Bridgefort Homes Development Ltd";
    const plainText = text?.trim() || htmlToText(html) || " ";
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${toRecipients.join(",")}|${subject.trim()}|${html}|${JSON.stringify(attachmentMetadata)}|${Math.floor(Date.now() / 600000)}`),
    );
    const contentKey = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const emailResponse = await sendTrackedEmail({
      supabase: serviceClient,
      resend,
      eventKey: eventKey || `manual_email:${userData.user.id}:${contentKey}`,
      recipientEmail: toRecipients[0],
      recipientUserId: null,
      recipientName: null,
      templateKey: "manual_email",
      sourceFunction: "send-email",
      sourceReference: userData.user.id,
      metadata: { sender_id: userData.user.id, to: toRecipients, cc: ccRecipients, bcc: bccRecipients, mailbox: targetMailbox, attachments: attachmentMetadata },
      payload: {
        from: `${senderDisplayName} <${targetMailbox}>`,
        to: toRecipients,
        ...(ccRecipients.length ? { cc: ccRecipients } : {}),
        ...(bccRecipients.length ? { bcc: bccRecipients } : {}),
        ...(resendAttachments.length ? { attachments: resendAttachments } : {}),
        subject: subject.trim(),
        html: bridgefortEmail(html),
        text: plainText,
      },
    });
    if (emailResponse.error) {
      throw new Error(emailResponse.error.message || "Email could not be sent");
    }

    if (emailResponse.duplicate) {
      return new Response(JSON.stringify({ success: true, duplicate: true, data: emailResponse }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const { error: sentInsertError } = await serviceClient.from("admin_emails").insert({
      sender_id: userData.user.id, from_email: targetMailbox, from_name: senderDisplayName,
      to_email: toRecipients.join(", "), cc_email: ccRecipients.join(", ") || null, bcc_email: bccRecipients.join(", ") || null,
      subject: subject.trim(), body: plainText, html, attachments: attachmentMetadata, folder: "sent", source: "resend", is_read: true,
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
