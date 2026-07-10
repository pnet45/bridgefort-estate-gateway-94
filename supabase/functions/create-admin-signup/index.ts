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

    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
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

    // If admins exist, create a pending request (WITHOUT storing the password)
    if (existingAdmins && existingAdmins.length > 0) {
      console.log(`Admins exist - creating pending request for: ${email}`);

      // Check if there's already a pending request for this email
      const { data: existingRequest } = await supabaseAdmin
        .from('pending_admin_requests')
        .select('id, status')
        .eq('email', email.toLowerCase())
        .single();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          return new Response(
            JSON.stringify({ 
              error: 'A request for this email is already pending approval.',
              requiresApproval: true 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (existingRequest.status === 'rejected') {
          const { error: updateError } = await supabaseAdmin
            .from('pending_admin_requests')
            .update({
              first_name: firstName || null,
              last_name: lastName || null,
              // password_hash column removed; credentials live in auth.users
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

          return new Response(
            JSON.stringify({ 
              success: true,
              message: 'Your admin access request has been resubmitted. An existing administrator will review and approve your request. You will receive a password setup email upon approval.',
              requiresApproval: true,
              pendingApproval: true
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Create new pending request - do NOT store password
      const { error: insertError } = await supabaseAdmin
        .from('pending_admin_requests')
        .insert({
          email: email.toLowerCase(),
          first_name: firstName || null,
          last_name: lastName || null,
          // password_hash column removed; credentials live in auth.users
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

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Your admin access request has been submitted. An existing administrator will review and approve your request. You will receive a password setup email upon approval.',
          requiresApproval: true,
          pendingApproval: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No admins exist - create first admin directly
    console.log(`Creating first admin user with email: ${email}`);

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
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
        message: 'Admin account created successfully. Please check your email to verify your account before logging in.',
        requiresEmailVerification: true
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
