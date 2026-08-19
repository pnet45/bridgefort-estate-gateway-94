import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const GMAIL_API_URL = 'https://gmail.googleapis.com/gmail/v1';

export function requireEnv(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} is not configured`);
  return v;
}

export async function getValidAccessToken(
  svc: ReturnType<typeof createClient>,
  mailboxEmail: string,
  googleAccountEmail?: string,
) {
  let q = svc.from('gmail_oauth_tokens').select('*').eq('email', mailboxEmail).eq('is_active', true);
  if (googleAccountEmail) q = q.ilike('google_account_email', googleAccountEmail);
  const { data: rows, error } = await q.order('updated_at', { ascending: false }).limit(1);
  if (error) throw new Error(`Failed to read Gmail token: ${error.message}`);
  const tokenRow = rows?.[0];
  if (!tokenRow) throw new Error(`Gmail connection for ${mailboxEmail}${googleAccountEmail ? ` (${googleAccountEmail})` : ''} is not connected`);

  const expiresAt = new Date(tokenRow.expires_at as string).getTime();
  if (expiresAt - Date.now() >= 60000) return tokenRow.access_token as string;

  const clientId = requireEnv('GOOGLE_CLIENT_ID');
  const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: tokenRow.refresh_token as string, grant_type: 'refresh_token' }),
  });
  const refreshed = await res.json();
  if (!res.ok) throw new Error(`Failed to refresh Gmail token: ${refreshed.error_description || refreshed.error || res.status}`);
  await svc.from('gmail_oauth_tokens').update({ access_token: refreshed.access_token, expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString() }).eq('id', tokenRow.id as string);
  return refreshed.access_token as string;
}

export async function gmailFetch(
  svc: ReturnType<typeof createClient>,
  mailboxEmail: string,
  path: string,
  init: RequestInit = {},
  googleAccountEmail?: string,
) {
  const accessToken = await getValidAccessToken(svc, mailboxEmail, googleAccountEmail);
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(`${GMAIL_API_URL}${path}`, { ...init, headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`Gmail API [${res.status}]: ${text}`);
  return text ? JSON.parse(text) : {};
}

export function b64UrlDecode(input: string) {
  const s = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b = atob(s + pad);
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

export function b64UrlEncode(bytes: Uint8Array) {
  let b = '';
  bytes.forEach(x => b += String.fromCharCode(x));
  return btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeBody(data?: string) {
  if (!data) return '';
  try { return new TextDecoder().decode(b64UrlDecode(data)); } catch { return ''; }
}

export function walkParts(part: any, out: any[]) {
  if (!part) return;
  out.push({ mimeType: part.mimeType, filename: part.filename, body: part.body });
  if (Array.isArray(part.parts)) part.parts.forEach((p: any) => walkParts(p, out));
}

export function extractEmailAddress(value = '') {
  const match = value.match(/<([^<>\s]+@[^<>\s]+)>/);
  if (match?.[1]) return match[1].trim().toLowerCase();
  const plain = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return plain?.[0]?.trim().toLowerCase() || '';
}

export function extractEmailAddresses(value = '') {
  return value
    .split(',')
    .map(part => extractEmailAddress(part))
    .filter(Boolean);
}

export function stripHtml(value = '') {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .trim();
}

export function gmailLabelsToFolder(labels: string[] = []) {
  if (labels.includes('TRASH')) return 'trash';
  if (labels.includes('SPAM')) return 'spam';
  if (labels.includes('DRAFT')) return 'drafts';
  if (labels.includes('SENT')) return 'sent';
  if (labels.includes('INBOX')) return 'inbox';
  return 'archive';
}

export function parseMessage(msg: any) {
  const h: Record<string, string> = {};
  (msg.payload?.headers || []).forEach((x: any) => h[x.name.toLowerCase()] = x.value);
  const parts: any[] = [];
  walkParts(msg.payload, parts);
  const html = parts.find(p => p.mimeType === 'text/html' && p.body?.data);
  const text = parts.find(p => p.mimeType === 'text/plain' && p.body?.data);
  const htmlBody = decodeBody(html?.body?.data);
  const textBody = decodeBody(text?.body?.data);
  return {
    id: msg.id,
    threadId: msg.threadId,
    labelIds: msg.labelIds || [],
    snippet: msg.snippet || '',
    internalDate: msg.internalDate,
    from: h.from || '',
    to: h.to || '',
    cc: h.cc || '',
    subject: h.subject || '(No Subject)',
    date: h.date || '',
    text: textBody,
    html: htmlBody,
    body: textBody || stripHtml(htmlBody) || msg.snippet || '',
    attachments: parts.filter(p => p.filename && p.body?.attachmentId).map(p => ({ id: p.body.attachmentId, filename: p.filename, content_type: p.mimeType, size: p.body.size || 0 })),
  };
}
