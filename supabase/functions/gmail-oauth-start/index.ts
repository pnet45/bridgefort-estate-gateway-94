import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireEnv } from "../_shared/gmail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authed = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authed.auth.getUser(token);
    if (userError || !userData?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const mailboxEmail = String(body?.mailboxEmail || "").trim().toLowerCase();
    if (!mailboxEmail) return new Response(JSON.stringify({ error: "mailboxEmail is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const svc = createClient(supabaseUrl, serviceKey);
    const { data: canWrite } = await svc.rpc("user_has_permission", { _user_id: userData.user.id, _permission_key: "mailbox:write" });
    if (!canWrite) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // IMPORTANT: resolve the mailbox assignment for the signed-in administrator.
    // Do not select an arbitrary assignment when multiple administrators share
    // the same company mailbox with different Google identities.
    const { data: access, error: accessError } = await svc.rpc("user_mailbox_access", { _user_id: userData.user.id, _mailbox_email: mailboxEmail, _provider: "gmail" });
    if (accessError || !access) return new Response(JSON.stringify({ error: "Forbidden: mailbox access denied" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: mailbox, error: mailboxError } = await svc
      .from("admin_mailboxes")
      .select("id, user_id, mailbox_email, mailbox_provider, provider_account_id, status")
      .eq("user_id", userData.user.id)
      .eq("mailbox_email", mailboxEmail)
      .eq("mailbox_provider", "gmail")
      .eq("status", "active")
      .maybeSingle();
    if (mailboxError || !mailbox) return new Response(JSON.stringify({ error: "Gmail mailbox assignment not found for this administrator" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const assignedAccounts = String(mailbox.provider_account_id || "").split(/[,;\n]+/).map((value) => value.trim().toLowerCase()).filter(Boolean);
    if (!assignedAccounts.length) return new Response(JSON.stringify({ error: "No Google account has been assigned to this mailbox" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const state = crypto.randomUUID();
    const { error: stateError } = await svc.from("gmail_oauth_state").insert({ state, requested_by: userData.user.id, mailbox_email: mailboxEmail, used: false });
    if (stateError) throw new Error(`Failed to create OAuth state: ${stateError.message}`);

    const clientId = requireEnv("GOOGLE_CLIENT_ID");
    const redirectUri = `${supabaseUrl}/functions/v1/gmail-oauth-callback`;
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", scope: "https://www.googleapis.com/auth/gmail.modify", access_type: "offline", prompt: "consent", state });

    return new Response(JSON.stringify({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("gmail-oauth-start error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unable to start Gmail connection" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
