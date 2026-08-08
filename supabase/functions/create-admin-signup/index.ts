import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, password, firstName, lastName, requestedRole } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Server-side allow-list — the UI limits the dropdown to these seven
    // department roles, but a direct API call must be rejected too if it
    // tries to request anything else.
    const ALLOWED_DEPARTMENT_ROLES = new Set([
      'admin_dir', 'admin_adm', 'admin_acct', 'admin_sales', 'admin_cs', 'admin_legal', 'admin_it'
    ]);
    if (requestedRole && !ALLOWED_DEPARTMENT_ROLES.has(requestedRole)) {
      return new Response(
        JSON.stringify({ error: 'Invalid department role requested' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if any admins already exist
    const { data: existingAdmins, error: adminCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (adminCheckError) {
      console.error('Error checking existing admins:', adminCheckError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If admins exist, create the REAL auth account now — with the
    // password this person actually typed — but grant no roles yet. An
    // account with no admin_roles/user_roles row can't pass has_role()
    // anywhere, so "pending approval" is enforced by the total absence of
    // privileges, not by withholding the account itself.
    //
    // The previous version of this function never called createUser here
    // at all — it only wrote a pending_admin_requests row and discarded
    // the password outright (the password the person typed was never
    // stored anywhere). Approval then created the account with a random
    // throwaway password nobody ever saw, which is the direct cause of
    // "invalid password or credential" after approval.
    if (existingAdmins && existingAdmins.length > 0) {
      console.log(`Admins exist - creating account + pending request for: ${email}`);

      const { data: existingRequest } = await supabaseAdmin
        .from('pending_admin_requests')
        .select('id, status, user_id')
        .eq('email', email.toLowerCase())
        .single();

      if (existingRequest?.status === 'pending') {
        return new Response(
          JSON.stringify({ 
            error: 'A request for this email is already pending approval.',
            requiresApproval: true 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create the auth account with the real password. If one already
      // exists for this email (a resubmission after rejection, or a
      // legacy request from before this fix that has no user_id on
      // record), update that existing account's password instead of
      // failing outright.
      let accountUserId: string | null = existingRequest?.user_id || null;
      const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name: firstName || '', last_name: lastName || '' },
      });

      if (createUserError) {
        const alreadyRegistered = /already.*registered|already.*exists/i.test(createUserError.message || '');
        if (!alreadyRegistered) {
          console.error('Create user error:', createUserError);
          return new Response(
            JSON.stringify({ error: createUserError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Already exists — find it (by our own record if we have it, else
        // by email) and update its password to the one just typed.
        if (!accountUserId) {
          const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          if (listError) {
            console.error('List users error:', listError);
            return new Response(
              JSON.stringify({ error: 'Failed to locate existing account' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          const match = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
          accountUserId = match?.id || null;
        }

        if (!accountUserId) {
          return new Response(
            JSON.stringify({ error: 'An account with this email exists but could not be located. Contact support.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(accountUserId, {
          password,
          email_confirm: true,
          user_metadata: { first_name: firstName || '', last_name: lastName || '' },
        });
        if (updateUserError) {
          console.error('Update existing user error:', updateUserError);
          return new Response(
            JSON.stringify({ error: updateUserError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        accountUserId = createdUser.user.id;
      }

      if (existingRequest) {
        const { error: updateError } = await supabaseAdmin
          .from('pending_admin_requests')
          .update({
            first_name: firstName || null,
            last_name: lastName || null,
            requested_role: requestedRole || null,
            user_id: accountUserId,
            status: 'pending',
            requested_at: new Date().toISOString(),
            reviewed_at: null,
            reviewed_by: null,
            rejection_reason: null
          })
          .eq('id', existingRequest.id);

        if (updateError) {
          console.error('Error updating request:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to submit request' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('pending_admin_requests')
          .insert({
            email: email.toLowerCase(),
            first_name: firstName || null,
            last_name: lastName || null,
            requested_role: requestedRole || null,
            user_id: accountUserId,
            status: 'pending'
          });

        if (insertError) {
          console.error('Error creating pending request:', insertError);
          if (insertError.code === '23505') {
            return new Response(
              JSON.stringify({ error: 'A request for this email already exists' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          return new Response(
            JSON.stringify({ error: 'Failed to submit request' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Your account has been created with the password you set. An existing administrator will review your access request — once approved, you can log in immediately with that same password.',
          requiresApproval: true,
          pendingApproval: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No admins exist - create first admin directly. email_confirm: true
    // because there's no separate "send a verification email" step
    // anywhere in this flow — this used to be false with a message
    // claiming a verification email was on its way, but nothing ever sent
    // one, which would have blocked this exact account from logging in
    // depending on the project's email-confirmation setting.
    console.log(`Creating first admin user with email: ${email}`);

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || ''
      }
    });

    if (createError) {
      console.error('Create user error:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User created successfully: ${newUser.user.id}`);

    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'admin'
      });

    // The very first admin is always Admin-Dir (unrestricted) — there's no
    // one else yet to approve a narrower department, and the console
    // needs at least one fully-privileged account to bootstrap from.
    const { error: deptRoleInsertError } = await supabaseAdmin
      .from('admin_roles')
      .insert({
        user_id: newUser.user.id,
        role_name: 'admin_dir'
      });

    if (deptRoleInsertError) {
      console.error('Department role assignment error:', deptRoleInsertError);
    }

    if (roleInsertError) {
      console.error('Role assignment error:', roleInsertError);
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { id: newUser.user.id, email: newUser.user.email },
          warning: 'User created but admin role assignment failed. Please contact support.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin role assigned to user ${newUser.user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: newUser.user.id, 
          email: newUser.user.email,
          role: 'admin'
        },
        message: 'Admin account created successfully. You can log in now.',
        requiresEmailVerification: false
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
