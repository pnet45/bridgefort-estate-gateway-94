// Shared Gmail helpers used by both gmail-sync (live API passthrough for the
// UI) and gmail-sync-to-db (pulls messages into admin_emails). Keeping this
// in one place means a fix or change only has to happen once.
//
// This talks to Google's Gmail API directly using OAuth tokens stored in
// public.gmail_oauth_tokens (see migration 20260801000000 and the
// gmail-oauth-callback function) — it no longer depends on Lovable's
// connector gateway, which only ever had metadata-scope access and can't be
// reconnected without Lovable platform access.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const GMAIL_API_URL = "https://gmail.googleapis.com/gmail/v1";

export function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

/**
 * Returns a currently-valid access token for the given Gmail mailbox,
 * refreshing it first if it's expired (or about to expire). Throws a clear
 * "not connected" error if that specific mailbox hasn't been connected yet,
 * so callers can surface a "Connect Gmail" prompt instead of a cryptic API
 * error.
 *
 * `mailboxEmail` is required and always filtered on — there is no "just
 * give me a token" fallback. Silently picking "whichever token exists" is
 * exactly the bug that let one admin's sync request use a completely
 * different mailbox's credentials.
 */
export async function getValidAccessToken(
  svc: ReturnType<typeof createClient>,
  mailboxEmail: string
): Promise<string> {
  const { data: tokenRow, error } = await svc
    .from("gmail_oauth_tokens")
    .select("*")
    .eq("email", mailboxEmail)
    .maybeSingle();

  if (error) throw new Error(`Failed to read Gmail token: ${error.message}`);
  if (!tokenRow) throw new Error(`Gmail account ${mailboxEmail} is not connected yet. Connect it first.`);

  const expiresAt = new Date(tokenRow.expires_at as string).getTime();
  const isExpiringSoon = expiresAt - Date.now() < 60_000; // refresh a minute early

  if (!isExpiringSoon) {
    return tokenRow.access_token as string;
  }

  // Refresh it.
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokenRow.refresh_token as string,
      grant_type: "refresh_token",
    }),
  });
  const refreshed = await res.json();
  if (!res.ok) {
    throw new Error(
      `Failed to refresh Gmail token: ${refreshed.error_description || refreshed.error || res.status}`
    );
  }

  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  const { error: updateError } = await svc
    .from("gmail_oauth_tokens")
    .update({ access_token: refreshed.access_token, expires_at: newExpiresAt })
    .eq("id", tokenRow.id as string);
  if (updateError) {
    console.error("Failed to persist refreshed Gmail token:", updateError);
  }

  return refreshed.access_token as string;
}

/**
 * Calls the Gmail API directly, using the token for `mailboxEmail`
 * specifically. `svc` must be a service-role Supabase client (needed to
 * read/refresh the stored token — gmail_oauth_tokens has no
 * client-accessible RLS policies by design).
 */
export async function gmailFetch(
  svc: ReturnType<typeof createClient>,
  mailboxEmail: string,
  path: string,
  init: RequestInit = {}
) {
  const accessToken = await getValidAccessToken(svc, mailboxEmail);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${GMAIL_API_URL}${path}`, { ...init, headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Gmail API [${res.status}]: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

export function b64UrlDecode(input: string): Uint8Array {
  const s = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const binary = atob(s + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function b64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBody(data?: string): string {
  if (!data) return "";
  try {
    return new TextDecoder("utf-8").decode(b64UrlDecode(data));
  } catch {
    return "";
  }
}

export interface FlatPart {
  mimeType: string;
  filename?: string;
  body?: { data?: string; attachmentId?: string; size?: number };
}

export function walkParts(part: any, out: FlatPart[]) {
  if (!part) return;
  out.push({ mimeType: part.mimeType, filename: part.filename, body: part.body });
  if (Array.isArray(part.parts)) part.parts.forEach((p: any) => walkParts(p, out));
}

export function parseMessage(msg: any) {
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

/** Maps Gmail's labelIds to this project's single folder value. */
export function gmailLabelsToFolder(labelIds: string[]): string {
  if (labelIds.includes("TRASH")) return "trash";
  if (labelIds.includes("SPAM")) return "spam";
  if (labelIds.includes("DRAFT")) return "drafts";
  if (labelIds.includes("SENT")) return "sent";
  if (labelIds.includes("INBOX")) return "inbox";
  // Present in Gmail but not in any of the above (e.g. archived: removed
  // from Inbox without being trashed).
  return "archive";
}
