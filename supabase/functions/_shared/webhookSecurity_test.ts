import {
  constantTimeEqual,
  readBodyWithLimit,
  verifyPaystackSignature,
  verifySvixSignature,
} from "./webhookSecurity.ts";

const encoder = new TextEncoder();

async function hmac(payload: string, secret: string, hash: "SHA-256" | "SHA-512"): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", key, encoder.encode(payload));
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

Deno.test("readBodyWithLimit accepts a body within the limit", async () => {
  const body = await readBodyWithLimit(new Request("https://example.test", { method: "POST", body: "hello" }), 5);
  if (body !== "hello") throw new Error("Expected request body to be preserved");
});

Deno.test("readBodyWithLimit rejects oversized declared content length", async () => {
  const request = new Request("https://example.test", {
    method: "POST",
    headers: { "content-length": "10" },
    body: "1234567890",
  });
  let rejected = false;
  try { await readBodyWithLimit(request, 5); } catch (error) {
    rejected = error instanceof Error && error.message === "Webhook payload too large";
  }
  if (!rejected) throw new Error("Expected oversized content length to be rejected");
});

Deno.test("readBodyWithLimit rejects streamed bodies that exceed the limit", async () => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode("123"));
      controller.enqueue(encoder.encode("456"));
      controller.close();
    },
  });
  let rejected = false;
  try {
    await readBodyWithLimit(new Request("https://example.test", { method: "POST", body: stream, duplex: "half" } as RequestInit), 5);
  } catch (error) {
    rejected = error instanceof Error && error.message === "Webhook payload too large";
  }
  if (!rejected) throw new Error("Expected oversized streamed body to be rejected");
});

Deno.test("constantTimeEqual matches equal values and rejects mismatches", () => {
  if (!constantTimeEqual("same-value", "same-value")) throw new Error("Expected equal values to match");
  if (constantTimeEqual("same-value", "other-value")) throw new Error("Expected different values not to match");
  if (constantTimeEqual("short", "longer")) throw new Error("Expected different lengths not to match");
});

Deno.test("Paystack signature accepts a valid HMAC-SHA512 signature", async () => {
  const payload = JSON.stringify({ event: "charge.success", data: { reference: "ref-123" } });
  const secret = "test-paystack-secret";
  const signature = toHex(await hmac(payload, secret, "SHA-512"));
  if (!await verifyPaystackSignature(payload, signature, secret)) throw new Error("Valid Paystack signature was rejected");
});

Deno.test("Paystack signature rejects invalid signatures", async () => {
  if (await verifyPaystackSignature('{"event":"charge.success"}', "invalid", "test-paystack-secret")) {
    throw new Error("Invalid Paystack signature was accepted");
  }
});

Deno.test("Svix accepts a valid v1 HMAC-SHA256 signature", async () => {
  const payload = JSON.stringify({ type: "email.received" });
  const id = "msg_test_123";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const secretBytes = crypto.getRandomValues(new Uint8Array(32));
  const secret = `whsec_${toBase64(secretBytes)}`;
  const signed = `${id}.${timestamp}.${payload}`;
  // Build the expected signature using the raw secret bytes.
  const key = await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = toBase64(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(signed))));
  if (!await verifySvixSignature(payload, id, timestamp, `v1,${expected}`, secret)) {
    throw new Error("Valid Svix signature was rejected");
  }
});

Deno.test("Svix rejects unsupported signature versions and malformed secrets", async () => {
  const payload = "{}";
  const id = "msg_test_123";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const secret = `whsec_${toBase64(crypto.getRandomValues(new Uint8Array(32)))}`;
  if (await verifySvixSignature(payload, id, timestamp, "v2,not-a-valid-signature", secret)) {
    throw new Error("Unsupported Svix version was accepted");
  }
  if (await verifySvixSignature(payload, id, timestamp, "v1,invalid", "whsec_not-base64!!!")) {
    throw new Error("Malformed Svix secret was accepted");
  }
});
