import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireEnv } from "../_shared/gmail.ts";

// Deliberately public — Google's redirect is a plain browser GET request
// with no Authorization header, so this can't require a Supabase JWT the
// way every other function here does. Security instead comes from the
// one-time `state` token (see gmail-oauth-start and the gmail_oauth_state
// table): only a request carrying a state value that was just issued to an
// authenticated admin, and not already used, is accepted.

function redirectTo(appUrl: string, params: Record<string, string>) {
  const url = new URL(`${appUrl}/admin-console`);
  url.searchParams.set("tab", "emails");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Response(null, { status: 302, headers: { Location: url.toString() } });
}

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const appUrl = Deno.env.get("APP_URL") || "https://www.bridgeforthomes.com";
  const svc = createClient(supabaseUrl, serviceKey);

  if (oauthError) {
    return redirectTo(appUrl, { gmail_error: oauthError });
  }
  if (!code || !state) {
    return redirectTo(appUrl, { gmail_error: "missing_code_or_state" });
  }

  try {
    // Consume the state exactly once. If it's missing, already used, or
    // older than 10 minutes, reject — this is what stops a stray or
    // malicious hit on this URL from storing tokens for the wrong account.
    const { data: stateRow, error: stateError } = await svc
      .from("gmail_oauth_state")
      .select("*")
      .eq("state", state)
      .eq("used", false)
      .maybeSingle();

    if (stateError || !stateRow) {
      return redirectTo(appUrl, { gmail_error: "invalid_or_expired_state" });
    }
    const ageMs = Date.now() - new Date(stateRow.created_at as string).getTime();
    if (ageMs > 10 * 60 * 1000) {
      return redirectTo(appUrl, { gmail_error: "expired_state" });
    }

    await svc.from("gmail_oauth_state").update({ used: true }).eq("state", state);

    const clientId = requireEnv("GOOGLE_CLIENT_ID");
    const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
    const redirectUri = `${supabaseUrl}/functions/v1/gmail-oauth-callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Gmail token exchange failed:", tokenData);
      return redirectTo(appUrl, { gmail_error: "token_exchange_failed" });
    }

    // Need the actual Gmail address this token belongs to, since
    // gmail_oauth_tokens.email is the unique key (supports multiple
    // connected accounts down the line without a schema change).
    const profileRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileRes.json();
    const email = profileData.emailAddress;
    if (!profileRes.ok || !email) {
      console.error("Failed to fetch connected Gmail profile:", profileData);
      return redirectTo(appUrl, { gmail_error: "profile_fetch_failed" });
    }

    if (!tokenData.refresh_token) {
      // Happens if this exact Google account already granted consent
      // before and Google decided not to re-issue a refresh_token. Since
      // gmail-oauth-start always sends prompt=consent specifically to avoid
      // this, seeing it anyway usually means Google is not honoring that —
      // rare, but surfacing it clearly is better than silently storing a
      // token that will stop working the moment the access token expires.
      return redirectTo(appUrl, { gmail_error: "no_refresh_token" });
    }

    // The admin picked which Google account to authorize on Google's own
    // consent screen — we never controlled that choice. This is the actual
    // enforcement point: if the resulting address isn't one this admin is
    // permitted to use, the token is discarded rather than stored. Without
    // this, any admin could connect (and thereby read/send from) any
    // department's mailbox just by signing into that Google account.
    const { data: isAuthorizedMailbox, error: mailboxAccessError } = await svc.rpc("user_mailbox_access", {
      _user_id: stateRow.requested_by,
      _mailbox_email: email,
      _provider: "gmail",
    });
    if (mailboxAccessError || !isAuthorizedMailbox) {
      return redirectTo(appUrl, { gmail_error: "mailbox_not_authorized", gmail_attempted_email: email });
    }

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    const { error: upsertError } = await svc.from("gmail_oauth_tokens").upsert(
      {
        email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        connected_by: stateRow.requested_by,
      },
      { onConflict: "email" }
    );
    if (upsertError) {
      console.error("Failed to store Gmail tokens:", upsertError);
      return redirectTo(appUrl, { gmail_error: "storage_failed" });
    }

    return redirectTo(appUrl, { gmail_connected: "1", gmail_email: email });
  } catch (error: any) {
    console.error("gmail-oauth-callback error:", error);
    return redirectTo(appUrl, { gmail_error: "unexpected_error" });
  }
});
