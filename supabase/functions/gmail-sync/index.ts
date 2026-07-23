import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

const ALLOWED_ACTIONS = new Set([
  "list-labels",
  "list-messages",
  "get-message",
  "get-attachment",
  "modify-message",
  "trash-message",
  "untrash-message",
  "send-message",
]);

function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

async function gmailFetch(path: string, init: RequestInit = {}) {
  const LOVABLE_API_KEY = requireEnv("LOVABLE_API_KEY");
  const GMAIL_API_KEY = requireEnv("GOOGLE_MAIL_API_KEY");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${LOVABLE_API_KEY}`);
  headers.set("X-Connection-Api-Key", GMAIL_API_KEY);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${GATEWAY_URL}${path}`, { ...init, headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Gmail API [${res.status}]: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

function b64UrlDecode(input: string): Uint8Array {
  const s = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const binary = atob(s + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function b64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBody(data?: string): string {
  if (!data) return "";
  try {
    return new TextDecoder("utf-8").decode(b64UrlDecode(data));
  } catch {
    return "";
  }
}

interface FlatPart {
  mimeType: string;
  filename?: string;
  body?: { data?: string; attachmentId?: string; size?: number };
}

function walkParts(part: any, out: FlatPart[]) {
  if (!part) return;
  out.push({ mimeType: part.mimeType, filename: part.filename, body: part.body });
  if (Array.isArray(part.parts)) part.parts.forEach((p: any) => walkParts(p, out));
}

function parseMessage(msg: any) {
  const headers: Record<string, string> = {};
  (msg.payload?.headers || []).forEach((h: any) => {
    headers[h.name.toLowerCase()] = h.value;
  });
  const parts: FlatPart[] = [];
  walkParts(msg.payload, parts);
  const htmlPart = parts.find((p) => p.mimeType === "text/html" && p.body?.data);
  const textPart = parts.find((p) => p.mimeType === "text/plain" && p.body?.data);
  const attachments = parts
    .filter((p) => p.filename && p.body?.attachmentId)
    .map((p) => ({
      id: p.body!.attachmentId!,
      filename: p.filename!,
      content_type: p.mimeType,
      size: p.body!.size || 0,
    }));
  return {
    id: msg.id,
    threadId: msg.threadId,
    labelIds: msg.labelIds || [],
    snippet: msg.snippet || "",
    internalDate: msg.internalDate,
    from: headers["from"] || "",
    to: headers["to"] || "",
    cc: headers["cc"] || "",
    subject: headers["subject"] || "(No Subject)",
    date: headers["date"] || "",
    text: decodeBody(textPart?.body?.data),
    html: decodeBody(htmlPart?.body?.data),
    attachments,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Admin JWT check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authed = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await authed.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const svc = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await svc.rpc("has_role", {
      _user_id: claims.claims.sub,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body || {};
    if (!ALLOWED_ACTIONS.has(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let data: any;
    switch (action) {
      case "list-labels": {
        const res = await gmailFetch(`/users/me/labels`);
        data = res.labels || [];
        break;
      }
      case "list-messages": {
        const { labelIds, q, pageToken, maxResults } = body;
        const buildParams = (includeQuery: boolean) => {
          const params = new URLSearchParams();
          params.set("maxResults", String(Math.min(Number(maxResults) || 25, 100)));
          if (labelIds && Array.isArray(labelIds)) {
            labelIds.forEach((id: string) => params.append("labelIds", id));
          } else if (typeof labelIds === "string" && labelIds) {
            params.append("labelIds", labelIds);
          }
          if (includeQuery && q) params.set("q", String(q));
          if (pageToken) params.set("pageToken", String(pageToken));
          return params;
        };

        let list: any;
        let searchDegraded = false;
        try {
          list = await gmailFetch(`/users/me/messages?${buildParams(true).toString()}`);
        } catch (err: any) {
          // The connected Gmail account only granted the restricted
          // "metadata" scope, which doesn't support the `q` search
          // parameter at all (a hard Google API limitation, not something
          // we can work around) — fall back to an unfiltered list rather
          // than failing the whole request, and let the frontend know
          // search isn't available until Gmail is reconnected with fuller
          // permissions.
          if (q && /metadata scope/i.test(String(err.message))) {
            searchDegraded = true;
            list = await gmailFetch(`/users/me/messages?${buildParams(false).toString()}`);
          } else {
            throw err;
          }
        }

        const ids: { id: string; threadId: string }[] = list.messages || [];
        // Batch fetch metadata for list preview
        const detailed = await Promise.all(
          ids.map(async (m) => {
            const meta = await gmailFetch(
              `/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`
            );
            const headers: Record<string, string> = {};
            (meta.payload?.headers || []).forEach((h: any) => {
              headers[h.name.toLowerCase()] = h.value;
            });
            return {
              id: meta.id,
              threadId: meta.threadId,
              labelIds: meta.labelIds || [],
              snippet: meta.snippet || "",
              internalDate: meta.internalDate,
              from: headers["from"] || "",
              to: headers["to"] || "",
              subject: headers["subject"] || "(No Subject)",
              date: headers["date"] || "",
              is_unread: (meta.labelIds || []).includes("UNREAD"),
              has_attachments: false,
            };
          })
        );
        data = {
          messages: detailed,
          nextPageToken: list.nextPageToken || null,
          resultSizeEstimate: list.resultSizeEstimate || detailed.length,
          searchDegraded,
        };
        break;
      }
      case "get-message": {
        const { messageId } = body;
        if (!messageId) throw new Error("messageId required");
        try {
          const msg = await gmailFetch(`/users/me/messages/${messageId}?format=full`);
          data = parseMessage(msg);
        } catch (err: any) {
          // Same restricted-scope situation: metadata scope can list emails
          // and show headers/snippets, but Google will never allow it to
          // return the full body, no matter how this is called — reading,
          // deleting, forwarding and replying all need the full message.
          // Return what IS available (headers/snippet) plus a clear flag
          // the UI can use to explain why the body is missing, instead of
          // throwing an unhandled error that blanks the whole page.
          if (/metadata scope/i.test(String(err.message))) {
            const meta = await gmailFetch(
              `/users/me/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`
            );
            const headers: Record<string, string> = {};
            (meta.payload?.headers || []).forEach((h: any) => {
              headers[h.name.toLowerCase()] = h.value;
            });
            data = {
              id: meta.id,
              threadId: meta.threadId,
              labelIds: meta.labelIds || [],
              from: headers["from"] || "",
              to: headers["to"] || "",
              subject: headers["subject"] || "(No Subject)",
              date: headers["date"] || "",
              text: meta.snippet || "",
              html: null,
              attachments: [],
              scopeRestricted: true,
              scopeRestrictedMessage:
                "This Gmail connection only has limited (metadata) access, so the full message body can't be shown. Reconnect Gmail with full mail access to read, delete, forward or reply to messages.",
            };
          } else {
            throw err;
          }
        }
        break;
      }
      case "get-attachment": {
        const { messageId, attachmentId } = body;
        if (!messageId || !attachmentId) throw new Error("messageId and attachmentId required");
        const att = await gmailFetch(
          `/users/me/messages/${messageId}/attachments/${attachmentId}`
        );
        // Convert base64url to standard base64 for browser downloadBlob helper
        const bytes = b64UrlDecode(att.data || "");
        let binary = "";
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        data = { content: btoa(binary), size: att.size };
        break;
      }
      case "modify-message": {
        const { messageId, addLabelIds, removeLabelIds } = body;
        if (!messageId) throw new Error("messageId required");
        data = await gmailFetch(`/users/me/messages/${messageId}/modify`, {
          method: "POST",
          body: JSON.stringify({
            addLabelIds: addLabelIds || [],
            removeLabelIds: removeLabelIds || [],
          }),
        });
        break;
      }
      case "trash-message": {
        const { messageId } = body;
        if (!messageId) throw new Error("messageId required");
        data = await gmailFetch(`/users/me/messages/${messageId}/trash`, { method: "POST" });
        break;
      }
      case "untrash-message": {
        const { messageId } = body;
        if (!messageId) throw new Error("messageId required");
        data = await gmailFetch(`/users/me/messages/${messageId}/untrash`, { method: "POST" });
        break;
      }
      case "send-message": {
        const { to, subject, html, cc, bcc } = body;
        if (!to || !subject || !html) throw new Error("to, subject, html required");
        const lines = [
          `To: ${to}`,
          cc ? `Cc: ${cc}` : "",
          bcc ? `Bcc: ${bcc}` : "",
          `Subject: ${subject}`,
          "MIME-Version: 1.0",
          'Content-Type: text/html; charset="UTF-8"',
          "",
          html,
        ].filter(Boolean);
        const raw = b64UrlEncode(new TextEncoder().encode(lines.join("\r\n")));
        data = await gmailFetch(`/users/me/messages/send`, {
          method: "POST",
          body: JSON.stringify({ raw }),
        });
        break;
      }
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("gmail-sync error:", err);
    let msg = err?.message || String(err);
    const isScopeRestricted = /metadata scope/i.test(msg);
    if (isScopeRestricted) {
      msg =
        "This Gmail connection only has limited (metadata) access, which Google does not allow to read, search, delete, forward, reply to, or send messages — only list basic headers. Reconnect Gmail with full mail access (not metadata-only) to use these features.";
    }
    const status = /\[401\]|\[403\]/.test(err?.message || "") ? 403 : 500;
    return new Response(JSON.stringify({ success: false, error: msg, scopeRestricted: isScopeRestricted }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
