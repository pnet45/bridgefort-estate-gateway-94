import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { gmailFetch, b64UrlEncode, parseMessage, stripHtml } from "../_shared/gmail.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const assigned = (v: string | null | undefined) =>
  (v || "").split(/[,;\n]+/).map(x => x.trim().toLowerCase()).filter(Boolean);

function foldHeader(value: string) {
  return value.replace(/\r?\n/g, " ").trim();
}

function wrapBase64(value: string, width = 76) {
  const out: string[] = [];
  for (let i = 0; i < value.length; i += width) out.push(value.slice(i, i + width));
  return out.join("\r\n");
}

function utf8Base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return wrapBase64(btoa(binary));
}

function buildMimeMessage({
  from, to, cc, bcc, subject, html,
}: {
  from: string; to: string; cc?: string; bcc?: string; subject: string; html: string;
}) {
  const boundary = `=_Bridgefort_${crypto.randomUUID().replace(/-/g, "")}`;
  const plain = stripHtml(html) || " ";
  const lines = [
    `From: ${foldHeader(from)}`,
    `To: ${foldHeader(to)}`,
    cc ? `Cc: ${foldHeader(cc)}` : "",
    bcc ? `Bcc: ${foldHeader(bcc)}` : "",
    `Subject: ${foldHeader(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    utf8Base64(plain),
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    utf8Base64(html),
    "",
    `--${boundary}--`,
    "",
  ];
  return lines.join("\r\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) throw Object.assign(new Error("Unauthorized"), { status: 401 });

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const token = auth.slice(7);
    const { data: ud, error: ue } = await userClient.auth.getUser(token);
    if (ue || !ud?.user) throw Object.assign(new Error("Unauthorized"), { status: 401 });

    const svc = createClient(url, service);
    const body = await req.json();
    const action = String(body?.action || "");
    const allowed = new Set(["list-labels","list-messages","get-message","get-attachment","modify-message","trash-message","untrash-message","send-message"]);
    if (!allowed.has(action)) throw Object.assign(new Error("Invalid action"), { status: 400 });

    let mailboxEmail = String(body?.mailboxEmail || "").trim().toLowerCase();
    if (!mailboxEmail) throw Object.assign(new Error("No Gmail mailbox selected"), { status: 400 });

    const { data: access, error: ae } = await svc.rpc("user_mailbox_access", {
      _user_id: ud.user.id, _mailbox_email: mailboxEmail, _provider: "gmail"
    });
    if (ae || !access) throw Object.assign(new Error("Forbidden: mailbox access denied"), { status: 403 });

    const { data: mb, error: me } = await svc.from("admin_mailboxes")
      .select("provider_account_id")
      .eq("mailbox_email", mailboxEmail)
      .eq("mailbox_provider", "gmail")
      .eq("status", "active");
    if (me) throw me;

    const allowedGoogle = [...new Set((mb || []).flatMap((x: any) => assigned(x.provider_account_id)))];
    const requested = String(body?.googleAccountEmail || "").trim().toLowerCase();
    const { data: tokens, error: te } = await svc.from("gmail_oauth_tokens")
      .select("google_account_email,is_active,updated_at")
      .eq("email", mailboxEmail)
      .eq("is_active", true)
      .order("updated_at", { ascending: false });
    if (te) throw te;

    const usable = (tokens || []).filter((t: any) => allowedGoogle.includes(String(t.google_account_email || "").toLowerCase()));
    const googleAccountEmail = requested || String(usable[0]?.google_account_email || "").toLowerCase();
    if (!googleAccountEmail || !allowedGoogle.includes(googleAccountEmail) ||
        !usable.some((t: any) => String(t.google_account_email || "").toLowerCase() === googleAccountEmail)) {
      throw Object.assign(new Error("No active authorized Google account is connected to this mailbox"), { status: 403 });
    }

    let data: any;
    switch (action) {
      case "list-labels":
        data = (await gmailFetch(svc, mailboxEmail, "/users/me/labels", {}, googleAccountEmail)).labels || [];
        break;
      case "list-messages": {
        const max = Math.min(Number(body.maxResults) || 25, 100);
        const p = new URLSearchParams({ maxResults: String(max) });
        if (Array.isArray(body.labelIds)) body.labelIds.forEach((x: string) => p.append("labelIds", x));
        else if (body.labelIds) p.append("labelIds", String(body.labelIds));
        if (body.q) p.set("q", String(body.q));
        if (body.pageToken) p.set("pageToken", String(body.pageToken));
        const list = await gmailFetch(svc, mailboxEmail, `/users/me/messages?${p}`, {}, googleAccountEmail);
        const messages = await Promise.all((list.messages || []).map(async (m: any) => {
          const meta = await gmailFetch(svc, mailboxEmail,
            `/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Cc&metadataHeaders=Bcc&metadataHeaders=Subject&metadataHeaders=Date`,
            {}, googleAccountEmail);
          const h: Record<string,string> = {};
          (meta.payload?.headers || []).forEach((x:any) => h[x.name.toLowerCase()] = x.value);
          return {
            id: meta.id, threadId: meta.threadId, labelIds: meta.labelIds || [],
            snippet: meta.snippet || "", internalDate: meta.internalDate,
            from: h.from || "", to: h.to || "", cc: h.cc || "", bcc: h.bcc || "",
            subject: h.subject || "(No Subject)", date: h.date || "",
            is_unread: (meta.labelIds || []).includes("UNREAD"),
            has_attachments: false,
          };
        }));
        data = { messages, nextPageToken: list.nextPageToken || null, resultSizeEstimate: list.resultSizeEstimate || messages.length };
        break;
      }
      case "get-message":
        if (!body.messageId) throw new Error("messageId required");
        data = parseMessage(await gmailFetch(svc, mailboxEmail, `/users/me/messages/${body.messageId}?format=full`, {}, googleAccountEmail));
        break;
      case "get-attachment": {
        if (!body.messageId || !body.attachmentId) throw new Error("messageId and attachmentId required");
        data = await gmailFetch(svc, mailboxEmail, `/users/me/messages/${body.messageId}/attachments/${body.attachmentId}`, {}, googleAccountEmail);
        break;
      }
      case "modify-message":
        data = await gmailFetch(svc, mailboxEmail, `/users/me/messages/${body.messageId}/modify`,
          { method: "POST", body: JSON.stringify({ addLabelIds: body.addLabelIds || [], removeLabelIds: body.removeLabelIds || [] }) }, googleAccountEmail);
        break;
      case "trash-message":
        data = await gmailFetch(svc, mailboxEmail, `/users/me/messages/${body.messageId}/trash`, { method: "POST" }, googleAccountEmail);
        break;
      case "untrash-message":
        data = await gmailFetch(svc, mailboxEmail, `/users/me/messages/${body.messageId}/untrash`, { method: "POST" }, googleAccountEmail);
        break;
      case "send-message": {
        if (!body.to || !body.subject || !body.html) throw new Error("to, subject, html required");
        const mime = buildMimeMessage({
          from: mailboxEmail,
          to: body.to,
          cc: body.cc,
          bcc: body.bcc,
          subject: body.subject,
          html: body.html,
        });
        const raw = b64UrlEncode(new TextEncoder().encode(mime));
        data = await gmailFetch(svc, mailboxEmail, "/users/me/messages/send",
          { method: "POST", body: JSON.stringify({ raw }) }, googleAccountEmail);

        if (data?.id) {
          await svc.from("admin_emails").upsert({
            from_email: mailboxEmail,
            to_email: body.to,
            subject: body.subject,
            body: stripHtml(body.html).slice(0, 10000),
            html: body.html,
            folder: "sent",
            source: "gmail",
            is_read: true,
            external_ref: data.id,
          }, { onConflict: "source,external_ref" });
        }
        break;
      }
    }

    return new Response(JSON.stringify({ success: true, data, mailboxEmail, googleAccountEmail }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: e?.status || (/Gmail API \[(401|403)\]/.test(msg) ? 403 : 500),
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});
