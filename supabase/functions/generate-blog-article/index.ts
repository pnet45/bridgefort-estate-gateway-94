
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { title } = await req.json();
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }
    if (!title) {
      throw new Error("No title provided");
    }
    const systemPrompt =
      "You are an expert Nigerian real estate writer. Write a full 6-8 paragraph article (with h2 subheadings, strong intro, conclusion, and practical tips), in rich HTML format, relevant to Nigerian readers, about the following blog post title: '" +
      title +
      "'. Cover current trends, local context, investment advice, and actionable insights. The article should be over 800 words and useful for both prospective buyers and investors.";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: title },
        ],
        max_tokens: 2048,
        temperature: 0.85,
      }),
    });

    const data = await response.json();
    const generatedArticle =
      data.choices?.[0]?.message?.content ||
      "<p>Sorry, could not generate article at this time.</p>";

    return new Response(JSON.stringify({ generatedArticle }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
