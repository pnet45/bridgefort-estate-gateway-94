import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://www.bridgeforthomes.com",
  "https://bridgeforthomes.com",
]);
const cors = (req: Request) => ({
  "Access-Control-Allow-Origin": allowedOrigins.has(req.headers.get("origin") || "") ? req.headers.get("origin")! : "https://www.bridgeforthomes.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});
const json = (req: Request, body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceKey || !anonKey) return json(req, { error: "Server configuration error" }, 500);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json(req, { error: "Unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } }, auth: { autoRefreshToken: false, persistSession: false } });
  const adminClient = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user: requestingUser }, error: userError } = await userClient.auth.getUser();
  if (userError || !requestingUser) return json(req, { error: "Unauthorized" }, 401);

  // The canonical permission name is deployment-dependent during the RBAC migration.
  // Check the canonical permission first, then the existing administrative role helper
  // so this hardening does not lock out legitimate administrators during the transition.
  const { data: allowedByPermission } = await adminClient.rpc("user_has_permission", { _user_id: requestingUser.id, _permission: "users.create_admin" });
  let allowed = allowedByPermission === true;
  if (!allowed) {
    const { data: legacyAdmin } = await adminClient.rpc("has_role", { _user_id: requestingUser.id, _role: "admin" });
    allowed = legacyAdmin === true;
  }
  if (!allowed) return json(req, { error: "Forbidden" }, 403);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json(req, { error: "Invalid JSON body" }, 400); }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const firstName = String(body.firstName || "").trim().slice(0, 100);
  const lastName = String(body.lastName || "").trim().slice(0, 100);
  const role = String(body.role || "admin").trim().toLowerCase();

  if (!email || !password) return json(req, { error: "Email and password are required" }, 400);
  if (password.length < 12 || password.length > 128) return json(req, { error: "Password must be 12-128 characters" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(req, { error: "Invalid email address" }, 400);
  if (!["admin", "staff", "pbo", "client"].includes(role)) return json(req, { error: "Invalid role" }, 400);

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({ email, password, email_confirm: false, user_metadata: { first_name: firstName, last_name: lastName } });
  if (createError || !newUser.user) return json(req, { error: createError?.message || "User creation failed" }, 400);

  const { error: roleError } = await adminClient.from("user_roles").insert({ user_id: newUser.user.id, role });
  if (roleError) {
    await adminClient.auth.admin.deleteUser(newUser.user.id);
    console.error("admin-user role assignment failed", roleError);
    return json(req, { error: "User creation could not be completed" }, 500);
  }

  return json(req, { success: true, user: { id: newUser.user.id, email: newUser.user.email, role }, message: "User created successfully; email confirmation is required before sign-in." });
});
