// Shared Gmail helpers used by both gmail-sync (live API passthrough for the
// UI) and gmail-sync-to-db (pulls messages into admin_emails). Keeping this
// in one place means a fix or change only has to happen once.

export const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

export function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

export async function gmailFetch(path: string, init: RequestInit = {}) {
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
