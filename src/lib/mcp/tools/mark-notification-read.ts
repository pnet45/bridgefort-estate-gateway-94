import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "mark_notification_read",
  title: "Mark notification read",
  description: "Mark one of the signed-in user's in-app notifications as read.",
  inputSchema: {
    notification_id: z.string().uuid().describe("ID of the notification to mark as read."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ notification_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_notifications")
      .update({ is_read: true })
      .eq("id", notification_id)
      .eq("user_id", ctx.getUserId())
      .select("id,title,is_read");

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data || data.length === 0) {
      return { content: [{ type: "text", text: "Notification not found for this account." }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data[0], null, 2) }],
      structuredContent: { notification: data[0] },
    };
  },
});
