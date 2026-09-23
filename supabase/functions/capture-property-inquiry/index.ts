import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.110.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";

const InquirySchema = z.object({
  listingId: z.string().uuid(),
  actionType: z.enum(["call", "email", "whatsapp", "information_request"]),
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().min(7).max(30).optional(),
}).refine((value) => value.email || value.phone, {
  message: "Email or phone is required for guest inquiries",
});

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const raw = await req.json();
    const parsed = InquirySchema.safeParse(raw);
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceKey || !anonKey) return json({ error: "Service configuration is incomplete" }, 500);

    const authHeader = req.headers.get("Authorization");
    let authenticatedUserId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error } = await authClient.auth.getUser(authHeader.slice(7));
      if (error || !data.user) return json({ error: "Invalid session" }, 401);
      authenticatedUserId = data.user.id;
    }

    if (!authenticatedUserId && !parsed.data.email && !parsed.data.phone) {
      return json({ error: "Email or phone is required" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data, error } = await admin.rpc("capture_property_inquiry", {
      _listing_id: parsed.data.listingId,
      _action_type: parsed.data.actionType,
      _name: parsed.data.name ?? null,
      _email: parsed.data.email ?? null,
      _phone: parsed.data.phone ?? null,
      _authenticated_user_id: authenticatedUserId,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ success: true, leadId: data });
  } catch (error) {
    console.error("capture-property-inquiry", error);
    return json({ error: "Unable to record inquiry" }, 500);
  }
});