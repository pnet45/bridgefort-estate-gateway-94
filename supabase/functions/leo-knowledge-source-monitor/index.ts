import { createClient } from "npm:@supabase/supabase-js@2.110.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const digest = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const sources = [
    "https://www.bridgeforthomes.com/privacy-policy",
    "https://www.bridgeforthomes.com/NDPP",
    "https://www.bridgeforthomes.com/terms-of-service",
    "https://www.bridgeforthomes.com/sitemap",
  ];

  const results = [];

  for (const source_url of sources) {
    try {
      const response = await fetch(source_url, {
        headers: {
          "User-Agent": "Bridgefort-Leo-Knowledge-Monitor/1.0",
          "Accept": "text/html,application/xhtml+xml",
        },
      });

      if (!response.ok) throw new Error("HTTP " + response.status);

      const html = await response.text();
      const hash = await digest(html);

      const { data: row, error } = await supabase
        .from("leo_knowledge_source_sync")
        .select("*")
        .eq("source_url", source_url)
        .single();

      if (error || !row) {
        results.push({ source_url, status: "not_configured" });
        continue;
      }

      const now = new Date().toISOString();

      if (row.source_hash === hash) {
        await supabase.from("leo_knowledge_source_sync").update({
          last_checked_at: now,
          status: "clean",
          last_error: null,
          updated_at: now,
        }).eq("id", row.id);

        results.push({ source_url, status: "clean" });
        continue;
      }

      if (row.pending_hash === hash) {
        await supabase.from("leo_knowledge_source_sync").update({
          last_checked_at: now,
          status: "pending_review",
          last_error: null,
          updated_at: now,
        }).eq("id", row.id);

        results.push({ source_url, status: "pending_review" });
        continue;
      }

      const titleMatch = html.match(new RegExp("<title[^>]*>([\\s\\S]*?)<\\/title>", "i"));
      const pendingTitle = titleMatch
        ? titleMatch[1].replace(new RegExp("<[^>]*>", "g"), " ").split(" ").filter(Boolean).join(" ").slice(0, 180)
        : source_url;

      await supabase.from("leo_knowledge_source_sync").update({
        last_checked_at: now,
        pending_hash: hash,
        pending_content: null,
        pending_title: pendingTitle,
        pending_detected_at: now,
        status: "pending_review",
        last_error: null,
        updated_at: now,
      }).eq("id", row.id);

      results.push({ source_url, status: "change_detected" });
    } catch (error) {
      const message = String(error);
      const { data: row } = await supabase
        .from("leo_knowledge_source_sync")
        .select("id")
        .eq("source_url", source_url)
        .single();

      if (row) {
        await supabase.from("leo_knowledge_source_sync").update({
          last_checked_at: new Date().toISOString(),
          status: "error",
          last_error: message.slice(0, 500),
          updated_at: new Date().toISOString(),
        }).eq("id", row.id);
      }

      results.push({ source_url, status: "error", error: message });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
