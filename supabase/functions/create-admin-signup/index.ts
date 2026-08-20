import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) return json({ error: 'Server configuration is incomplete' }, 500);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const { email, password, firstName, lastName, requestedRole } = await req.json();
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
    if (!normalizedEmail || !password) return json({ error: 'Email and password are required' }, 400);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) return json({ error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' }, 400);

    if (requestedRole) {
      const { data: department, error: departmentError } = await supabaseAdmin.from('admin_departments').select('id, name, role_name, is_active').eq('role_name', requestedRole).eq('is_active', true).maybeSingle();
      if (departmentError) return json({ error: 'Unable to validate the requested department' }, 500);
      if (!department) return json({ error: 'The selected department is not available for administrator signup' }, 400);
      if (requestedRole === 'admin_dir') return json({ error: 'Admin-Dir access can only be granted by Super_Admin or Admin-Dir. Please request another department.' }, 403);
    }

    const { data: existingAdmins, error: adminCheckError } = await supabaseAdmin.from('user_roles').select('id').eq('role', 'admin').limit(1);
    if (adminCheckError) return json({ error: 'Failed to verify admin status' }, 500);

    if (existingAdmins && existingAdmins.length > 0) {
      const { data: existingRequest } = await supabaseAdmin.from('pending_admin_requests').select('id, status, user_id').eq('email', normalizedEmail).maybeSingle();
      if (existingRequest?.status === 'pending') return json({ error: 'A request for this email is already pending approval.', requiresApproval: true }, 400);

      let accountUserId: string | null = existingRequest?.user_id || null;
      const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({ email: normalizedEmail, password, email_confirm: true, user_metadata: { first_name: firstName || '', last_name: lastName || '' } });
      if (createUserError) {
        const alreadyRegistered = /already.*registered|already.*exists/i.test(createUserError.message || '');
        if (!alreadyRegistered) return json({ error: createUserError.message }, 400);
        if (!accountUserId) {
          const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          if (listError) return json({ error: 'Failed to locate existing account' }, 500);
          accountUserId = listData.users.find((u) => u.email?.toLowerCase() === normalizedEmail)?.id || null;
        }
        if (!accountUserId) return json({ error: 'An account with this email exists but could not be located. Contact support.' }, 500);
        const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(accountUserId, { password, email_confirm: true, user_metadata: { first_name: firstName || '', last_name: lastName || '' } });
        if (updateUserError) return json({ error: updateUserError.message }, 400);
      } else {
        accountUserId = createdUser.user.id;
      }

      const requestPayload = { first_name: firstName || null, last_name: lastName || null, requested_role: requestedRole || null, user_id: accountUserId, status: 'pending', requested_at: new Date().toISOString(), reviewed_at: null, reviewed_by: null, rejection_reason: null };
      if (existingRequest) {
        const { error } = await supabaseAdmin.from('pending_admin_requests').update(requestPayload).eq('id', existingRequest.id);
        if (error) return json({ error: 'Failed to submit request' }, 500);
      } else {
        const { error } = await supabaseAdmin.from('pending_admin_requests').insert({ ...requestPayload, email: normalizedEmail });
        if (error) return json({ error: error.code === '23505' ? 'A request for this email already exists' : 'Failed to submit request' }, 500);
      }
      return json({ success: true, message: 'Your account has been created with the password you set. An existing administrator will review your access request; once approved, you can log in with the same password.', requiresApproval: true, pendingApproval: true });
    }

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({ email: normalizedEmail, password, email_confirm: true, user_metadata: { first_name: firstName || '', last_name: lastName || '' } });
    if (createError) return json({ error: createError.message }, 400);
    const { error: roleInsertError } = await supabaseAdmin.from('user_roles').insert({ user_id: newUser.user.id, role: 'admin' });
    const { error: deptRoleInsertError } = await supabaseAdmin.from('admin_roles').insert({ user_id: newUser.user.id, role_name: 'admin_dir' });
    if (roleInsertError || deptRoleInsertError) return json({ success: true, user: { id: newUser.user.id, email: newUser.user.email }, warning: 'User created but admin role assignment failed. Please contact support.' });
    return json({ success: true, user: { id: newUser.user.id, email: newUser.user.email, role: 'admin' }, message: 'Admin account created successfully. You can log in now.', requiresEmailVerification: false });
  } catch (error) {
    console.error('Unexpected error:', error);
    return json({ error: 'An unexpected error occurred' }, 500);
  }
});
