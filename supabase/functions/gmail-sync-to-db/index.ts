import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { gmailFetch, parseMessage, gmailLabelsToFolder } from "../_shared/gmail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// One Gmail label per folder we care about. Some messages carry more than
// one of these (e.g. a message can be both SENT and in a custom label) —
// gmailLabelsToFolder() resolves that with a fixed priority order, and the
// (source, external_ref) unique index means syncing the same message twice
// under different label queries just updates it in place rather than
// duplicating it.
const LABELS_TO_SYNC = ["INBOX", "SENT", "DRAFT", "TRASH", "SPAM"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.replace("Bearer ", "");

    const svc = createClient(supabaseUrl, serviceKey);

    // Two ways in: an interactive admin session (checked via their own JWT
    // + has_role), or a trusted machine caller presenting the service-role
    // key directly — this is Supabase's own documented pattern for
    // pg_cron-scheduled edge functions, since a cron job has no user session
    // to authenticate. Only something that already has the service-role key
    // (the database itself, via pg_net) could present it here.
    const isTrustedMachineCaller = token === serviceKey;

    if (!isTrustedMachineCaller) {
      const authed = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData, error: userError } = await authed.auth.getUser(token);
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: isAdmin } = await svc.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: connectedGmail, error: gmailLookupError } = await svc
        .from("gmail_oauth_tokens")
        .select("email")
        .eq("connected_by", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const targetMailbox = connectedGmail?.email || "admin@pwanbridgefort.ng";
      const { data: isAuthorizedMailbox, error: mailboxError } = await svc.rpc("user_mailbox_access", {
        _user_id: userData.user.id,
        _mailbox_email: targetMailbox,
        _provider: "gmail",
      });

      if (gmailLookupError || mailboxError || !isAuthorizedMailbox) {
        return new Response(JSON.stringify({ error: "Forbidden: mailbox access denied" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json().catch(() => ({}));
    const maxPerLabel = Math.min(Number(body?.maxPerLabel) || 25, 100);

    let synced = 0;
    let scopeRestricted = false;
    const errors: string[] = [];

    for (const label of LABELS_TO_SYNC) {
      try {
        const list = await gmailFetch(svc,
          `/users/me/messages?maxResults=${maxPerLabel}&labelIds=${label}`
        );
        const ids: { id: string }[] = list.messages || [];

        for (const { id } of ids) {
          try {
            const full = await gmailFetch(svc, `/users/me/messages/${id}?format=full`);
            const parsed = parseMessage(full);
            const folder = gmailLabelsToFolder(parsed.labelIds);

            const { error: upsertError } = await svc.from("admin_emails").upsert(
              {
                from_email: parsed.from || "unknown@gmail.com",
                from_name: null,
                to_email: parsed.to || "",
                subject: parsed.subject,
                body: parsed.text || parsed.snippet,
                html: parsed.html || null,
                folder,
                source: "gmail",
                is_read: !parsed.labelIds.includes("UNREAD"),
                is_starred: parsed.labelIds.includes("STARRED"),
                external_ref: parsed.id,
              },
              { onConflict: "source,external_ref" }
            );
            if (upsertError) {
              errors.push(`${id}: ${upsertError.message}`);
            } else {
              synced++;
            }
          } catch (msgErr: any) {
            if (/metadata scope/i.test(String(msgErr.message))) {
              scopeRestricted = true;
            } else {
              errors.push(`${id}: ${msgErr.message}`);
            }
          }
        }
      } catch (labelErr: any) {
        errors.push(`label ${label}: ${labelErr.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, synced, scopeRestricted, errors: errors.slice(0, 10) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("gmail-sync-to-db error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
