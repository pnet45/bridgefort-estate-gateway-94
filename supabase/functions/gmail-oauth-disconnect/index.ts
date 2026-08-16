import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authed = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userError } = await authed.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !userData?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const mailbox = String(body?.mailboxEmail || "").trim().toLowerCase();
    const googleAccountEmail = String(body?.googleAccountEmail || "").trim().toLowerCase();
    if (!mailbox) return new Response(JSON.stringify({ error: "mailboxEmail is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const svc = createClient(supabaseUrl, serviceKey);
    const { data: canWrite } = await svc.rpc("user_has_permission", { _user_id: userData.user.id, _permission_key: "mailbox:write" });
    if (!canWrite) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: access, error: accessError } = await svc.rpc("user_mailbox_access", { _user_id: userData.user.id, _mailbox_email: mailbox, _provider: "gmail" });
    if (accessError || !access) return new Response(JSON.stringify({ error: "Forbidden: mailbox access denied" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // If a Google account is supplied, disconnect only that session. This is
    // important when several approved Google accounts share one company mailbox.
    let query = svc.from("gmail_oauth_tokens").delete().eq("email", mailbox);
    if (googleAccountEmail) query = query.ilike("google_account_email", googleAccountEmail);
    const { error: deleteError } = await query;
    if (deleteError) return new Response(JSON.stringify({ error: deleteError.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true, mailboxEmail: mailbox, googleAccountEmail: googleAccountEmail || null }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("gmail-oauth-disconnect error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unable to disconnect Gmail" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
