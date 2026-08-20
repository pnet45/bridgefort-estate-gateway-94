import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const ALLOWED_DEPARTMENT_ROLES = new Set(["admin_dir", "admin_adm", "admin_acct", "admin_sales", "admin_cs", "admin_legal", "admin_it"]);
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceKey || !anonKey) return json({ error: "Server configuration is incomplete" }, 500);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Authorization header required" }, 401);
    const token = authHeader.slice(7).trim();
    if (!token) return json({ error: "Authorization token required" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Invalid authentication" }, 401);

    const { data: canApprove, error: permissionError } = await admin.rpc("can_approve_admin_request", { _user_id: user.id });
    if (permissionError || canApprove !== true) return json({ error: "Only Super_Admin, Admin-Dir or Admin-IT can approve admin requests" }, 403);

    const body = await req.json().catch(() => ({}));
    const requestId = typeof body.requestId === "string" ? body.requestId : "";
    const approvedRole = typeof body.approvedRole === "string" ? body.approvedRole : null;
    if (!requestId) return json({ error: "Request ID is required" }, 400);

    const { data: pendingRequest, error: fetchError } = await admin.from("pending_admin_requests").select("*").eq("id", requestId).eq("status", "pending").single();
    if (fetchError || !pendingRequest) return json({ error: "Pending request not found" }, 404);
    const finalRole = approvedRole || pendingRequest.requested_role || null;
    if (finalRole && !ALLOWED_DEPARTMENT_ROLES.has(finalRole)) return json({ error: "Invalid department role" }, 400);

    if (finalRole === "admin_dir") {
      const [{ data: isSuper, error: superError }, { data: isDirector, error: directorError }] = await Promise.all([
        admin.rpc("has_role", { _user_id: user.id, _role: "super_admin" }),
        admin.rpc("has_role", { _user_id: user.id, _role: "admin_dir" }),
      ]);
      if (superError || directorError || (isSuper !== true && isDirector !== true)) return json({ error: "Only Super_Admin or Admin-Dir can grant Admin-Dir" }, 403);
    }

    let newUserId: string;
    let legacyRequest = false;
    if (pendingRequest.user_id) {
      newUserId = pendingRequest.user_id;
    } else {
      legacyRequest = true;
      const { data: created, error: createError } = await admin.auth.admin.createUser({ email: pendingRequest.email, password: `${crypto.randomUUID()}!Aa1`, email_confirm: true, user_metadata: { first_name: pendingRequest.first_name || "", last_name: pendingRequest.last_name || "" } });
      if (createError || !created.user) return json({ error: createError?.message || "Unable to create admin account" }, 400);
      newUserId = created.user.id;
    }

    const { error: legacyRoleError } = await admin.from("user_roles").upsert({ user_id: newUserId, role: "admin" }, { onConflict: "user_id,role" });
    if (legacyRoleError) return json({ error: `Unable to assign admin access: ${legacyRoleError.message}` }, 500);

    if (finalRole) {
      const { error: deptRoleError } = await admin.from("admin_roles").upsert({ user_id: newUserId, role_name: finalRole, granted_by: user.id }, { onConflict: "user_id,role_name" });
      if (deptRoleError) return json({ error: `Unable to assign department role: ${deptRoleError.message}` }, 500);
      if (finalRole !== "admin_dir") {
        const { data: defaults, error: lookupError } = await admin.from("role_default_mailboxes").select("mailbox_email, mailbox_provider").eq("role_name", finalRole);
        if (lookupError) return json({ error: `Unable to load default mailboxes: ${lookupError.message}` }, 500);
        if (defaults?.length) {
          const { error: mailboxError } = await admin.from("admin_mailboxes").upsert(defaults.map((m) => ({ user_id: newUserId, mailbox_email: m.mailbox_email, mailbox_provider: m.mailbox_provider, is_primary: false, access_level: "read_write", status: "active" })), { onConflict: "user_id,mailbox_email", ignoreDuplicates: true });
          if (mailboxError) return json({ error: `Unable to seed mailboxes: ${mailboxError.message}` }, 500);
        }
      }
    }

    const reviewedAt = new Date().toISOString();
    const { error: updateError } = await admin.from("pending_admin_requests").update({ status: "approved", reviewed_at: reviewedAt, reviewed_by: user.id }).eq("id", requestId).eq("status", "pending");
    if (updateError) return json({ error: `Unable to finalize approval: ${updateError.message}` }, 500);

    try {
      if (legacyRequest) {
        const { data: linkData } = await admin.auth.admin.generateLink({ type: "recovery", email: pendingRequest.email });
        const actionLink = linkData?.properties?.action_link;
        if (actionLink) await resend.emails.send({ from: "Bridgefort Homes Development Ltd <noreply@bridgeforthomes.com>", to: [pendingRequest.email], subject: "Your Admin Access Has Been Approved — Set Your Password", html: `<p>Your Bridgefort Homes administrator access has been approved.</p><p><a href="${actionLink}">Set your password</a> to complete your account setup.</p>` });
      } else {
        await resend.emails.send({ from: "Bridgefort Homes Development Ltd <noreply@bridgeforthomes.com>", to: [pendingRequest.email], subject: "Your Admin Access Has Been Approved", html: `<p>Your Bridgefort Homes administrator access has been approved. You can now sign in using the email and password you used during signup.</p>` });
      }
    } catch (emailError) { console.error("Approval notification email failed", emailError); }

    return json({ success: true, message: legacyRequest ? `Admin account created for ${pendingRequest.email}. A password setup email has been sent.` : `${pendingRequest.email} is approved and can log in with the password used at signup.`, user: { id: newUserId, email: pendingRequest.email, role: finalRole } });
  } catch (error) {
    console.error("Unexpected approval error", error);
    return json({ error: "An unexpected error occurred" }, 500);
  }
});
