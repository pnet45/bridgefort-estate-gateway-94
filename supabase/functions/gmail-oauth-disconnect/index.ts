import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, corsJson } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const cors = corsHeaders(req, "POST, OPTIONS");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return corsJson(req, { error: "Method not allowed" }, 405);
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return corsJson(req, { error: "Unauthorized" }, 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authed = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userError } = await authed.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !userData?.user) return corsJson(req, { error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const mailbox = String(body?.mailboxEmail || "").trim().toLowerCase();
    const googleAccountEmail = String(body?.googleAccountEmail || "").trim().toLowerCase();
    if (!mailbox) return corsJson(req, { error: "mailboxEmail is required" }, 400);

    const svc = createClient(supabaseUrl, serviceKey);
    const { data: canWrite } = await svc.rpc("user_has_permission", { _user_id: userData.user.id, _permission_key: "mailbox:write" });
    if (!canWrite) return corsJson(req, { error: "Forbidden" }, 403);
    const { data: access, error: accessError } = await svc.rpc("user_mailbox_access", { _user_id: userData.user.id, _mailbox_email: mailbox, _provider: "gmail" });
    if (accessError || !access) return corsJson(req, { error: "Forbidden: mailbox access denied" }, 403);

    let query = svc.from("gmail_oauth_tokens").delete().eq("email", mailbox);
    if (googleAccountEmail) query = query.ilike("google_account_email", googleAccountEmail);
    const { error: deleteError } = await query;
    if (deleteError) return corsJson(req, { error: "Unable to disconnect Gmail" }, 500);
    return corsJson(req, { success: true, mailboxEmail: mailbox, googleAccountEmail: googleAccountEmail || null });
  } catch (error: any) {
    console.error("gmail-oauth-disconnect error:", error);
    return corsJson(req, { error: "Unable to disconnect Gmail" }, 500);
  }
});
