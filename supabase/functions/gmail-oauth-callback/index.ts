import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireEnv } from "../_shared/gmail.ts";

const accounts = (v: string | null | undefined) => [...new Set((v || "").split(/[,;\n]+/).map((x) => x.trim().toLowerCase()).filter(Boolean))];
const redirect = (app: string, params: Record<string, string>) => {
  const url = new URL(`${app}/admin-console`);
  url.searchParams.set("tab", "emails");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return new Response(null, { status: 302, headers: { Location: url.toString() } });
};

Deno.serve(async (req) => {
  const q = new URL(req.url).searchParams;
  const code = q.get("code");
  const state = q.get("state");
  const oauthError = q.get("error");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const appUrl = Deno.env.get("APP_URL") || "https://www.bridgeforthomes.com";

  if (!supabaseUrl || !serviceKey) return redirect(appUrl, { gmail_error: "server_configuration_error" });
  const svc = createClient(supabaseUrl, serviceKey);

  if (oauthError) return redirect(appUrl, { gmail_error: oauthError });
  if (!code || !state) return redirect(appUrl, { gmail_error: "missing_code_or_state" });

  try {
    const { data: oauthState, error: stateError } = await svc
      .from("gmail_oauth_state")
      .select("state, requested_by, mailbox_email, created_at, used")
      .eq("state", state)
      .eq("used", false)
      .maybeSingle();

    if (stateError || !oauthState) return redirect(appUrl, { gmail_error: "invalid_or_expired_state" });
    if (Date.now() - new Date(oauthState.created_at).getTime() > 10 * 60 * 1000) return redirect(appUrl, { gmail_error: "expired_state" });

    const mailboxEmail = String(oauthState.mailbox_email || "").trim().toLowerCase();
    if (!mailboxEmail) return redirect(appUrl, { gmail_error: "mailbox_missing_from_state" });
    await svc.from("gmail_oauth_state").update({ used: true }).eq("state", state);

    const { data: access, error: accessError } = await svc.rpc("user_mailbox_access", {
      _user_id: oauthState.requested_by,
      _mailbox_email: mailboxEmail,
      _provider: "gmail",
    });
    if (accessError || !access) return redirect(appUrl, { gmail_error: "mailbox_not_authorized" });

    // A company mailbox can be assigned to several administrators. Google
    // identities are therefore collected from every active Gmail assignment
    // for this mailbox, rather than only from the administrator who clicked
    // Connect. This also supports global/department-level mailbox access.
    const { data: assignments, error: mailboxError } = await svc
      .from("admin_mailboxes")
      .select("id, user_id, provider_account_id")
      .ilike("mailbox_email", mailboxEmail)
      .ilike("mailbox_provider", "gmail")
      .eq("status", "active");
    if (mailboxError) return redirect(appUrl, { gmail_error: "assignment_lookup_failed" });
    if (!assignments?.length) return redirect(appUrl, { gmail_error: "gmail_mailbox_assignment_not_found" });

    const assignedByMailbox = assignments.map((row: any) => ({ id: row.id, accounts: accounts(row.provider_account_id) }));
    const assignedAccounts = [...new Set(assignedByMailbox.flatMap((row) => row.accounts))];
    if (!assignedAccounts.length) return redirect(appUrl, { gmail_error: "google_account_not_assigned" });

    const clientId = requireEnv("GOOGLE_CLIENT_ID");
    const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
    const redirectUri = `${supabaseUrl}/functions/v1/gmail-oauth-callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) return redirect(appUrl, { gmail_error: "token_exchange_failed" });

    const profileResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileResponse.json();
    const googleEmail = String(profile.emailAddress || "").trim().toLowerCase();
    if (!profileResponse.ok || !googleEmail) return redirect(appUrl, { gmail_error: "profile_fetch_failed" });
    if (!assignedAccounts.includes(googleEmail)) {
      return redirect(appUrl, { gmail_error: "google_account_not_assigned", gmail_attempted_email: googleEmail });
    }

    // Bind the token to an assignment that explicitly contains the Google
    // identity. If multiple admins share that identity, the first matching
    // active assignment is sufficient because access is mailbox-scoped.
    const matchingAssignment = assignedByMailbox.find((row) => row.accounts.includes(googleEmail));
    const mailboxId = matchingAssignment?.id || assignments[0].id;

    const { data: existingRows, error: existingError } = await svc
      .from("gmail_oauth_tokens")
      .select("id, refresh_token")
      .eq("mailbox_id", mailboxId)
      .ilike("google_account_email", googleEmail)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (existingError) return redirect(appUrl, { gmail_error: "token_lookup_failed" });

    const existing = existingRows?.[0];
    const refreshToken = tokenData.refresh_token || existing?.refresh_token;
    if (!refreshToken) return redirect(appUrl, { gmail_error: "no_refresh_token", gmail_attempted_email: googleEmail });

    const payload = {
      email: mailboxEmail,
      mailbox_id: mailboxId,
      google_account_email: googleEmail,
      access_token: tokenData.access_token,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + Number(tokenData.expires_in || 3600) * 1000).toISOString(),
      connected_by: oauthState.requested_by,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const save = existing
      ? await svc.from("gmail_oauth_tokens").update(payload).eq("id", existing.id)
      : await svc.from("gmail_oauth_tokens").insert(payload);

    if (save.error) {
      console.error("gmail-oauth-callback storage", save.error);
      return redirect(appUrl, { gmail_error: "storage_failed" });
    }

    return redirect(appUrl, { gmail_connected: "1", gmail_email: mailboxEmail, gmail_google_account: googleEmail });
  } catch (error) {
    console.error("gmail-oauth-callback", error);
    return redirect(appUrl, { gmail_error: "unexpected_error" });
  }
});
