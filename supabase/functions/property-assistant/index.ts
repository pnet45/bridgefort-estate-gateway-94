import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1500),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(10),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const parsed = RequestSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid chat request" }, 400);
    if (parsed.data.messages.at(-1)?.role !== "user") {
      return json({ error: "A user message is required" }, 400);
    }

    const baseUrl = Deno.env.get("OLLAMA_BASE_URL")?.trim();
    const model = Deno.env.get("OLLAMA_MODEL")?.trim() || "qwen2.5:7b";
    if (!baseUrl) return json({ error: "AI assistant is not configured" }, 503);

    let endpoint: URL;
    try {
      endpoint = new URL(baseUrl);
      if (!["http:", "https:"].includes(endpoint.protocol) || endpoint.username || endpoint.password) {
        return json({ error: "Invalid AI service configuration" }, 500);
      }
      endpoint.pathname = `${endpoint.pathname.replace(/\/+$/, "")}/api/chat`;
      endpoint.search = "";
      endpoint.hash = "";
    } catch {
      return json({ error: "Invalid AI service configuration" }, 500);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const headers = new Headers({ "Content-Type": "application/json" });
      const apiKey = Deno.env.get("OLLAMA_API_KEY")?.trim();
      if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model,
          stream: false,
          messages: [
            {
              role: "system",
              content:
                "You are the Bridgefort Homes website assistant. Help visitors with general questions about the company's real-estate properties and services. Be concise, welcoming, and clear. Do not invent current property availability, prices, legal advice, or company policies; if a detail is not supplied in the conversation, say you cannot verify it and direct the visitor to the Properties or Contact page. Do not claim to have searched live listings.",
            },
            ...parsed.data.messages,
          ],
          options: { num_predict: 500 },
        }),
      });

      if (!response.ok) {
        console.error("property-assistant: Ollama request failed", response.status);
        return json({ error: "AI service request failed" }, 502);
      }

      const result: unknown = await response.json();
      const reply =
        typeof result === "object" &&
        result !== null &&
        "message" in result &&
        typeof result.message === "object" &&
        result.message !== null &&
        "content" in result.message &&
        typeof result.message.content === "string"
          ? result.message.content.trim()
          : "";
      if (!reply) return json({ error: "AI service returned no response" }, 502);

      return json({ reply: reply.slice(0, 6000) });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return json({ error: "AI service timed out" }, 504);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("property-assistant", error);
    return json({ error: "Unable to respond to the message" }, 500);
  }
});
