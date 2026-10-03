import { createClient } from "npm:@supabase/supabase-js@2.110.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["intent_summary", "intent_category", "recommended_priority", "priority_reason", "key_details", "next_steps"],
  properties: {
    intent_summary: { type: "string" },
    intent_category: { type: "string", enum: ["outright_purchase", "installment_plan", "inspection_request", "rental_or_lease", "investment_inquiry", "documentation", "general_information", "complaint", "other"] },
    recommended_priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
    priority_reason: { type: "string" },
    key_details: {
      type: "object", additionalProperties: false,
      required: ["budget", "timeline", "location", "concerns"],
      properties: {
        budget: { type: ["string", "null"] }, timeline: { type: ["string", "null"] },
        location: { type: ["string", "null"] }, concerns: { type: ["string", "null"] },
      },
    },
    next_steps: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["action", "action_type", "due_in_hours"],
        properties: {
          action: { type: "string" },
          action_type: { type: "string", enum: ["call", "email", "meeting", "whatsapp", "site_visit", "other"] },
          due_in_hours: { type: "number" },
        },
      },
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Sign in required" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: u, error: ue } = await userClient.auth.getUser(authHeader.slice(7));
    if (ue || !u.user) return json({ error: "Invalid session" }, 401);
    const { data: allowed } = await userClient.rpc("is_crm_operator", { _user_id: u.user.id });
    if (!allowed) return json({ error: "Only admin staff can use this tool" }, 403);

    const body = await req.json().catch(() => ({}));
    const inquiry = typeof body.inquiry === "string" ? body.inquiry.trim() : "";
    const context = typeof body.context === "string" ? body.context.slice(0, 500) : "";
    if (inquiry.length < 5) return json({ error: "Please provide the inquiry text" }, 400);
    if (inquiry.length > 8000) return json({ error: "Inquiry text is too long (max 8000 characters)" }, 400);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI is not configured" }, 500);

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions:
          "You are a sales assistant for PWAN Bridgefort, a Nigerian real estate and land banking company. Analyze a property lead's inquiry. Summarize intent in 1-2 sentences, recommend a priority (urgent = ready to pay/visit within days, high = clear intent and budget, medium = interested but vague, low = casual), and suggest 2-4 concrete next steps for the sales agent. Keep it concise. Never invent facts not present in the inquiry; use null for unknown details.",
        input: [{ role: "user", content: `${context ? `Lead context: ${context}\n\n` : ""}Inquiry:\n${inquiry}` }],
        text: { format: { type: "json_schema", name: "lead_analysis", strict: true, schema: SCHEMA } },
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      let message = "AI analysis failed";
      try { message = JSON.parse(text)?.error?.message || JSON.parse(text)?.message || message; } catch { /* ignore */ }
      if (upstream.status === 402) message = message || "AI credits are exhausted";
      if (upstream.status === 429) message = "AI is busy, please try again in a moment";
      return json({ error: message }, upstream.status);
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", output = "", failure = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta") output += evt.delta;
          if (evt.type === "response.failed" || evt.type === "error") failure = evt.response?.error?.message || evt.message || "AI analysis failed";
          if (evt.type === "response.refusal.delta") failure = "The AI declined to analyze this inquiry";
        } catch { /* partial */ }
      }
    }
    if (failure) return json({ error: failure }, 502);
    if (!output) return json({ error: "The AI returned no result" }, 502);
    return json({ analysis: JSON.parse(output) });
  } catch (e) {
    console.error("analyze-lead-inquiry", e);
    return json({ error: "Unable to analyze inquiry" }, 500);
  }
});
