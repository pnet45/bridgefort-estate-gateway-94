import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, corsJson } from "../_shared/cors.ts";
import { encryptGmailToken, requireEnv } from "../_shared/gmail.ts";

const BATCH_SIZE = 25;

Deno.serve(async (req) => {
  const cors = corsHeaders(req, "POST, OPTIONS");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return corsJson(req, { error: "Method not allowed" }, 405, "POST, OPTIONS");

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return corsJson(req, { error: "Unauthorized" }, 401);

    const supabaseUrl = requireEnv("SUPABASE_URL");
    const anonKey = requireEnv("SUPABASE_ANON_KEY");
    const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

    // Validate the caller with the user's JWT, then use service role only for the
    // narrowly scoped migration after authorization has succeeded.
    const authed = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: userError } = await authed.auth.getUser();
    if (userError || !user) return corsJson(req, { error: "Unauthorized" }, 401);

    const svc = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: allowed, error: permissionError } = await svc.rpc("user_has_permission", {
      _user_id: user.id,
      _permission_key: "admin:all",
    });
    if (permissionError) throw new Error("Permission check failed");
    if (allowed !== true) return corsJson(req, { error: "Forbidden" }, 403);

    // Refuse to proceed if the encryption key is absent or malformed. The helper
    // validates the 32-byte key when encryption is attempted.
    requireEnv("GMAIL_TOKEN_ENCRYPTION_KEY");

    const { data: rows, error: readError } = await svc
      .from("gmail_oauth_tokens")
      .select("id, encrypted_access_token, encrypted_refresh_token, access_token, refresh_token")
      .eq("is_active", true)
      .limit(BATCH_SIZE);
    if (readError) throw new Error("Unable to read Gmail credential migration batch");

    let migrated = 0;
    let skipped = 0;

    for (const row of rows || []) {
      // Already encrypted records are left untouched; this makes the endpoint
      // safely repeatable if a batch is interrupted.
      if (row.encrypted_access_token && row.encrypted_refresh_token) {
        skipped++;
        continue;
      }
      if (!row.access_token || !row.refresh_token) {
        throw new Error(`Credential ${row.id} is incomplete; migration stopped without modifying it`);
      }

      const encryptedAccessToken = await encryptGmailToken(row.access_token);
      const encryptedRefreshToken = await encryptGmailToken(row.refresh_token);
      const { error: updateError } = await svc
        .from("gmail_oauth_tokens")
        .update({
          encrypted_access_token: encryptedAccessToken,
          encrypted_refresh_token: encryptedRefreshToken,
          access_token: null,
          refresh_token: null,
        })
        .eq("id", row.id)
        .eq("is_active", true);
      if (updateError) throw new Error("Credential migration update failed");
      migrated++;
    }

    const { count: remainingPlaintext, error: verifyError } = await svc
      .from("gmail_oauth_tokens")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .or("access_token.not.is.null,refresh_token.not.is.null");
    if (verifyError) throw new Error("Credential migration verification failed");

    return corsJson(req, {
      success: remainingPlaintext === 0,
      migrated,
      skipped,
      remaining_plaintext: remainingPlaintext ?? 0,
      next: remainingPlaintext && remainingPlaintext > 0 ? "repeat the migration request to process the next batch" : "migration complete; verify encrypted credentials before dropping plaintext columns",
    });
  } catch (error) {
    console.error("gmail-token-migrate failed", error instanceof Error ? error.message : "unknown error");
    return corsJson(req, { error: "Gmail credential migration failed" }, 500);
  }
});
