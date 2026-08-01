import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_listings",
  title: "Search property listings",
  description:
    "Search approved, published residential and commercial property listings by city, price and bedrooms.",
  inputSchema: {
    query: z.string().trim().optional().describe("Free text matched against listing title, city and estate."),
    city: z.string().trim().optional().describe("Filter by city, e.g. 'Lagos'."),
    min_bedrooms: z.number().int().min(0).max(20).optional().describe("Minimum number of bedrooms."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, city, min_bedrooms, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("listings")
      .select(
        "id,title,description,city,address,estate,bedrooms,bathrooms,land_sqm,built_sqm,monthly_rent,annual_rent,is_featured,created_at",
      )
      .eq("moderation_status", "approved")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);

    if (city) q = q.ilike("city", `%${city}%`);
    if (typeof min_bedrooms === "number") q = q.gte("bedrooms", min_bedrooms);
    if (query) q = q.or(`title.ilike.%${query}%,city.ilike.%${query}%,estate.ilike.%${query}%`);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { listings: data ?? [] },
    };
  },
});
