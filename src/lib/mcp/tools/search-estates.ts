import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_estates",
  title: "Search estates",
  description:
    "Search Bridgefort land estates by name, location, or availability. Returns pricing, plot sizes and stock.",
  inputSchema: {
    query: z.string().trim().optional().describe("Free text matched against estate name, title and location."),
    location: z.string().trim().optional().describe("Filter by location, e.g. 'Asaba' or 'Ibeju-Lekki'."),
    available_only: z.boolean().optional().describe("Exclude sold-out estates. Defaults to true."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, location, available_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("estate")
      .select(
        "id,name,title,location,description,property_category,type,size,size_unit,actual_price,promo_price,prelaunch_price,total_plots,sold_plots,is_sold_out,is_for_sale,is_for_rent",
      )
      .limit(limit ?? 10);

    if (available_only !== false) q = q.or("is_sold_out.is.null,is_sold_out.eq.false");
    if (location) q = q.ilike("location", `%${location}%`);
    if (query) q = q.or(`name.ilike.%${query}%,title.ilike.%${query}%,location.ilike.%${query}%`);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { estates: data ?? [] },
    };
  },
});
