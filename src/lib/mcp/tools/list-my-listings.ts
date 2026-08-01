import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_listings",
  title: "List my listings",
  description:
    "List property listings created by the signed-in user, including pending, approved and rejected ones.",
  inputSchema: {
    moderation_status: z
      .enum(["pending", "approved", "rejected"])
      .optional()
      .describe("Filter by moderation status."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ moderation_status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("listings")
      .select(
        "id,title,city,estate,bedrooms,bathrooms,monthly_rent,annual_rent,moderation_status,rejection_reason,is_published,created_at",
      )
      .eq("created_by", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);

    if (moderation_status) q = q.eq("moderation_status", moderation_status);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { listings: data ?? [] },
    };
  },
});
