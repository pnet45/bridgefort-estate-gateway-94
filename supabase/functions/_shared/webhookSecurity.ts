export async function readBodyWithLimit(req: Request, maxBytes = 1024 * 1024): Promise<string> {
  const declaredLength = Number(req.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) throw new Error("Webhook payload too large");
  if (!req.body) return "";

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error("Webhook payload too large");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

export function constantTimeEqual(left: string, right: string): boolean {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyPaystackSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"],
    );
    const digest = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
    return constantTimeEqual(digest, signature.toLowerCase());
  } catch {
    return false;
  }
}

export async function verifySvixSignature(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string,
): Promise<boolean> {
  if (!svixId || !svixTimestamp || !svixSignature || !secret) return false;
  try {
    const encodedSecret = secret.replace(/^whsec_/, "");
    const secretBytes = Uint8Array.from(atob(encodedSecret), (character) => character.charCodeAt(0));
    const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedContent));
    const expected = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    return svixSignature.split(" ").some((part) => {
      const separator = part.indexOf(",");
      if (separator <= 0) return false;
      const version = part.slice(0, separator);
      const value = part.slice(separator + 1);
      return version === "v1" && value.length > 0 && constantTimeEqual(value, expected);
    });
  } catch {
    return false;
  }
}

export function isFreshWebhookTimestamp(timestamp: string, nowMs = Date.now(), toleranceSeconds = 300): boolean {
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  const nowSeconds = Math.floor(nowMs / 1000);
  return Math.abs(nowSeconds - timestampSeconds) <= toleranceSeconds;
}
