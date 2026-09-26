import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_URL") || "https://www.bridgeforthomes.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceKey || !anonKey) return json({ error: "Server configuration error" }, 500);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { user: requestingUser }, error: userError } = await userClient.auth.getUser();
  if (userError || !requestingUser) return json({ error: "Unauthorized" }, 401);

  // Prefer the canonical permission boundary. Keep the legacy role fallback out of
  // this endpoint so privileged account creation cannot depend on an obsolete role.
  const { data: allowed, error: permissionError } = await adminClient.rpc("user_has_permission", {
    _user_id: requestingUser.id,
    _permission: "users.create_admin",
  });
  if (permissionError || allowed !== true) return json({ error: "Forbidden" }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const firstName = String(body.firstName || "").trim().slice(0, 100);
  const lastName = String(body.lastName || "").trim().slice(0, 100);
  const role = String(body.role || "admin").trim().toLowerCase();

  if (!email || !password) return json({ error: "Email and password are required" }, 400);
  if (password.length < 12 || password.length > 128) return json({ error: "Password must be 12-128 characters" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Invalid email address" }, 400);

  // Only explicitly supported staff roles may be provisioned here. High-risk roles
  // should be granted through the audited RBAC administration workflow after creation.
  const validRoles = ["admin", "staff", "pbo", "client"];
  if (!validRoles.includes(role)) return json({ error: "Invalid role" }, 400);

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (createError || !newUser.user) return json({ error: createError?.message || "User creation failed" }, 400);

  const { error: roleError } = await adminClient.from("user_roles").insert({
    user_id: newUser.user.id,
    role,
  });

  if (roleError) {
    // Avoid leaving a privileged orphan account if role provisioning fails.
    await adminClient.auth.admin.deleteUser(newUser.user.id);
    console.error("admin-user role assignment failed", roleError);
    return json({ error: "User creation could not be completed" }, 500);
  }

  return json({
    success: true,
    user: { id: newUser.user.id, email: newUser.user.email, role },
    message: "User created successfully; email confirmation is required before sign-in.",
  });
});
