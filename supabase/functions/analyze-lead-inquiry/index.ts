import { createClient } from "npm:@supabase/supabase-js@2.110.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { NoObjectGeneratedError, Output, streamText } from "npm:ai";
import { z } from "npm:zod@3.25.76";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const AnalysisSchema = z.object({
  intent_summary: z.string(),
  intent_category: z.enum(["outright_purchase", "installment_plan", "inspection_request", "rental_or_lease", "investment_inquiry", "documentation", "general_information", "complaint", "other"]),
  recommended_priority: z.enum(["low", "medium", "high", "urgent"]),
  priority_reason: z.string(),
  key_details: z.object({
    budget: z.string().nullable(), timeline: z.string().nullable(),
    location: z.string().nullable(), concerns: z.string().nullable(),
  }),
  next_steps: z.array(z.object({
    action: z.string(),
    action_type: z.enum(["call", "email", "meeting", "whatsapp", "site_visit", "other"]),
    due_in_hours: z.number(),
  })),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Sign in required" }, 401);
    const url = Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !anon) return json({ error: "Service configuration is incomplete" }, 500);
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

    let gatewayRunId = req.headers.get("X-Lovable-AIG-Run-ID")?.trim() || undefined;
    const gatewayFetch: typeof fetch = async (input, init) => {
      const headers = new Headers(init?.headers);
      if (gatewayRunId) headers.set("X-Lovable-AIG-Run-ID", gatewayRunId);
      const response = await fetch(input, { ...init, headers });
      gatewayRunId ??= response.headers.get("X-Lovable-AIG-Run-ID")?.trim() || undefined;
      return response;
    };
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: gatewayFetch,
    });
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system: "You are a sales assistant for PWAN Bridgefort, a Nigerian real estate and land banking company. Analyze a property lead's inquiry. Summarize intent in 1-2 sentences, recommend a priority (urgent = ready to pay/visit within days, high = clear intent and budget, medium = interested but vague, low = casual), and suggest 2-4 concrete next steps for the sales agent. Keep it concise. Never invent facts not present in the inquiry; use null for unknown details.",
      messages: [{ role: "user", content: `${context ? `Lead context: ${context}\n\n` : ""}Inquiry:\n${inquiry}` }],
      output: Output.object({ schema: AnalysisSchema }),
      abortSignal: req.signal,
      providerOptions: { openai: {
        forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto",
        store: false, include: ["reasoning.encrypted_content"],
      } },
    });
    try {
      const analysis = await result.output;
      if (!analysis) return json({ error: "The AI returned no result" }, 502);
      const headers = new Headers({ ...corsHeaders, "Content-Type": "application/json" });
      if (gatewayRunId) headers.set("X-Lovable-AIG-Run-ID", gatewayRunId);
      headers.set("Access-Control-Expose-Headers", "X-Lovable-AIG-Run-ID");
      return new Response(JSON.stringify({ analysis }), { headers });
    } catch (error) {
      if (req.signal.aborted) return json({ error: "Analysis cancelled" }, 499);
      if (NoObjectGeneratedError.isInstance(error)) return json({ error: "The AI could not produce a valid analysis." }, 502);
      if (typeof error === "object" && error !== null && "statusCode" in error) {
        const status = Number((error as { statusCode?: number }).statusCode) || 500;
        const message = "message" in error && typeof error.message === "string" ? error.message : "AI analysis failed";
        return json({ error: message }, status);
      }
      throw error;
    }
  } catch (e) {
    console.error("analyze-lead-inquiry", e);
    return json({ error: "Unable to analyze inquiry" }, 500);
  }
});
