import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { gmailFetch, parseMessage, gmailLabelsToFolder, extractEmailAddress } from "../_shared/gmail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYNC_SOURCES = [
  { name: "INBOX", path: (max: number) => `/users/me/messages?maxResults=${max}&labelIds=INBOX` },
  { name: "SENT", path: (max: number) => `/users/me/messages?maxResults=${max}&labelIds=SENT` },
  { name: "DRAFT", path: (max: number) => `/users/me/messages?maxResults=${max}&labelIds=DRAFT` },
  { name: "TRASH", path: (max: number) => `/users/me/messages?maxResults=${max}&labelIds=TRASH&includeSpamTrash=true` },
  { name: "SPAM", path: (max: number) => `/users/me/messages?maxResults=${max}&labelIds=SPAM&includeSpamTrash=true` },
  // Gmail does not have an ARCHIVE system label. Archived mail is simply a
  // message that has none of INBOX/SENT/DRAFT/TRASH/SPAM, so use Gmail's
  // search syntax to retrieve it explicitly.
  { name: "ARCHIVE", path: (max: number) => `/users/me/messages?maxResults=${max}&q=${encodeURIComponent("-in:inbox -in:sent -in:drafts -in:trash -in:spam")}` },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.replace("Bearer ", "");
    const svc = createClient(supabaseUrl, serviceKey);
    const body = await req.json().catch(() => ({}));
    const maxPerLabel = Math.min(Number(body?.maxPerLabel) || 25, 100);
    const isTrustedMachineCaller = token === serviceKey;
    let mailboxEmail: string | undefined = body?.mailboxEmail;

    if (!isTrustedMachineCaller) {
      const authed = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
      const { data: userData, error: userError } = await authed.auth.getUser(token);
      if (userError || !userData?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data: isAdmin } = await svc.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
      if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      if (!mailboxEmail) {
        const { data: connectedGmail } = await svc.from("gmail_oauth_tokens").select("email").eq("connected_by", userData.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
        mailboxEmail = connectedGmail?.email || "admin@pwanbridgefort.ng";
      }

      const { data: isAuthorizedMailbox, error: mailboxError } = await svc.rpc("user_mailbox_access", { _user_id: userData.user.id, _mailbox_email: mailboxEmail, _provider: "gmail" });
      if (mailboxError || !isAuthorizedMailbox) return new Response(JSON.stringify({ error: "Forbidden: mailbox access denied" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!mailboxEmail) return new Response(JSON.stringify({ error: "mailboxEmail is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    mailboxEmail = mailboxEmail.trim().toLowerCase();

    let synced = 0;
    let scopeRestricted = false;
    const errors: string[] = [];

    for (const source of SYNC_SOURCES) {
      try {
        const list = await gmailFetch(svc, mailboxEmail, source.path(maxPerLabel));
        const ids: { id: string }[] = list.messages || [];

        for (const { id } of ids) {
          try {
            const full = await gmailFetch(svc, mailboxEmail, `/users/me/messages/${id}?format=full`);
            const parsed = parseMessage(full);
            const labels = parsed.labelIds || [];
            const folder = source.name === "ARCHIVE" ? "archive" : gmailLabelsToFolder(labels);
            const isSent = labels.includes("SENT") || folder === "sent";
            const sender = extractEmailAddress(parsed.from);
            const recipient = extractEmailAddress(parsed.to);

            // admin_emails is mailbox-scoped through from/to. Normalize the
            // company mailbox to the exact email address so the frontend can
            // reliably place messages in the selected mailbox's folders even
            // when Gmail returns headers such as "Name <sales@...>".
            const fromEmail = isSent ? mailboxEmail : (sender || mailboxEmail);
            const toEmail = isSent ? (recipient || mailboxEmail) : mailboxEmail;

            const { error: upsertError } = await svc.from("admin_emails").upsert(
              {
                from_email: fromEmail,
                from_name: null,
                to_email: toEmail,
                to_name: null,
                subject: parsed.subject,
                body: parsed.body || parsed.text || parsed.snippet,
                html: parsed.html || null,
                folder,
                source: "gmail",
                is_read: !labels.includes("UNREAD"),
                is_starred: labels.includes("STARRED"),
                external_ref: parsed.id,
              },
              { onConflict: "source,external_ref" },
            );

            if (upsertError) errors.push(`${id}: ${upsertError.message}`);
            else synced++;
          } catch (msgErr: any) {
            if (/metadata scope/i.test(String(msgErr.message))) scopeRestricted = true;
            else errors.push(`${id}: ${msgErr.message}`);
          }
        }
      } catch (sourceErr: any) {
        errors.push(`source ${source.name}: ${sourceErr.message}`);
      }
    }

    return new Response(JSON.stringify({ success: true, mailboxEmail, synced, scopeRestricted, errors: errors.slice(0, 10) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("gmail-sync-to-db error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
