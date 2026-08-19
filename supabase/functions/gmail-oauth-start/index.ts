import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireEnv } from "../_shared/gmail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = requireEnv("SUPABASE_URL");
    const anonKey = requireEnv("SUPABASE_ANON_KEY");
    const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const authed = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authed.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const mailboxEmail = String(body?.mailboxEmail || "").trim().toLowerCase();
    if (!mailboxEmail) return json({ error: "mailboxEmail is required" }, 400);

    const svc = createClient(supabaseUrl, serviceKey);
    const { data: canWrite, error: permissionError } = await svc.rpc("user_has_permission", {
      _user_id: userData.user.id,
      _permission_key: "mailbox:write",
    });
    if (permissionError) throw new Error(`Permission check failed: ${permissionError.message}`);
    if (!canWrite) return json({ error: "Forbidden" }, 403);

    const { data: access, error: accessError } = await svc.rpc("user_mailbox_access", {
      _user_id: userData.user.id,
      _mailbox_email: mailboxEmail,
      _provider: "gmail",
    });
    if (accessError) throw new Error(`Mailbox access check failed: ${accessError.message}`);
    if (!access) return json({ error: "Forbidden: mailbox access denied" }, 403);

    // A mailbox may be assigned to more than one administrator. Resolve ALL
    // active Gmail assignments for the selected mailbox instead of using
    // maybeSingle() on one administrator's row.
    const { data: assignments, error: mailboxError } = await svc
      .from("admin_mailboxes")
      .select("id, user_id, mailbox_email, mailbox_provider, provider_account_id, status")
      .ilike("mailbox_email", mailboxEmail)
      .eq("mailbox_provider", "gmail")
      .eq("status", "active");
    if (mailboxError) throw new Error(`Failed to read mailbox assignments: ${mailboxError.message}`);
    if (!assignments?.length) return json({ error: "Gmail mailbox assignment not found" }, 404);

    const assignedAccounts = [...new Set(
      assignments
        .flatMap((row: any) => String(row.provider_account_id || "").split(/[,;\n]+/))
        .map((value: string) => value.trim().toLowerCase())
        .filter(Boolean)
    )];
    if (!assignedAccounts.length) return json({ error: "No Google account has been assigned to this mailbox" }, 400);

    const state = crypto.randomUUID();
    const { error: stateError } = await svc.from("gmail_oauth_state").insert({
      state,
      requested_by: userData.user.id,
      mailbox_email: mailboxEmail,
      used: false,
    });
    if (stateError) throw new Error(`Failed to create OAuth state: ${stateError.message}`);

    const clientId = requireEnv("GOOGLE_CLIENT_ID");
    const redirectUri = `${supabaseUrl}/functions/v1/gmail-oauth-callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/gmail.modify",
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, mailboxEmail, assignedAccounts });
  } catch (error: any) {
    console.error("gmail-oauth-start error:", error);
    return json({ error: error?.message || "Unable to start Gmail connection" }, 500);
  }
});
