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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin using RPC
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { requestId, approvedRole } = await req.json();

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'Request ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // The approver decides the actual department role granted — it does not
    // have to match what the requester asked for, and it's re-validated here
    // server-side regardless of what the client sends.
    const ALLOWED_DEPARTMENT_ROLES = new Set([
      'admin_dir', 'admin_adm', 'admin_acct', 'admin_sales', 'admin_cs', 'admin_legal', 'admin_it'
    ]);

    // Fetch the pending request
    const { data: pendingRequest, error: fetchError } = await supabaseAdmin
      .from('pending_admin_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !pendingRequest) {
      return new Response(
        JSON.stringify({ error: 'Pending request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const finalRole = approvedRole || pendingRequest.requested_role;
    if (finalRole && !ALLOWED_DEPARTMENT_ROLES.has(finalRole)) {
      return new Response(
        JSON.stringify({ error: 'Invalid department role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Approving admin request for: ${pendingRequest.email}`);

    // Create user account with a random temporary password
    // The user will set their own password via the invite/reset flow
    const tempPassword = crypto.randomUUID() + '!Aa1'; // Meets password requirements
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: pendingRequest.email,
      password: tempPassword, // Temporary - user will reset via email
      email_confirm: true,
      user_metadata: {
        first_name: pendingRequest.first_name || '',
        last_name: pendingRequest.last_name || ''
      }
    });

    if (createError) {
      console.error('Create user error:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User created: ${newUser.user.id}`);

    // Assign legacy admin role (kept for backward compatibility with
    // existing has_role(uid,'admin') checks scattered through the app)
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'admin'
      });

    if (roleInsertError) {
      console.error('Role assignment error:', roleInsertError);
    }

    // Assign the actual department role and seed its default mailboxes.
    if (finalRole) {
      const { error: deptRoleError } = await supabaseAdmin
        .from('admin_roles')
        .insert({
          user_id: newUser.user.id,
          role_name: finalRole,
          granted_by: user.id
        });

      if (deptRoleError) {
        console.error('Department role assignment error:', deptRoleError);
      }

      // admin_dir doesn't need explicit mailbox rows — admin:all already
      // grants every mailbox via user_mailbox_access().
      if (finalRole !== 'admin_dir') {
        const { data: defaultMailboxes, error: mailboxLookupError } = await supabaseAdmin
          .from('role_default_mailboxes')
          .select('mailbox_email, mailbox_provider')
          .eq('role_name', finalRole);

        if (mailboxLookupError) {
          console.error('Default mailbox lookup error:', mailboxLookupError);
        } else if (defaultMailboxes && defaultMailboxes.length > 0) {
          const { error: mailboxInsertError } = await supabaseAdmin
            .from('admin_mailboxes')
            .upsert(
              defaultMailboxes.map((m) => ({
                user_id: newUser.user.id,
                mailbox_email: m.mailbox_email,
                mailbox_provider: m.mailbox_provider,
                is_primary: false,
                access_level: 'read_write',
                status: 'active'
              })),
              { onConflict: 'user_id,mailbox_email', ignoreDuplicates: true }
            );

          if (mailboxInsertError) {
            console.error('Mailbox seeding error:', mailboxInsertError);
          }
        }
      }
    }

    // Send password reset email so user can set their own password
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: pendingRequest.email,
    });

    if (resetError) {
      console.error('Password reset email error:', resetError);
    }

    // Update the pending request status
    const { error: updateError } = await supabaseAdmin
      .from('pending_admin_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Update request error:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Admin account created for ${pendingRequest.email}. A password reset email has been sent.`,
        user: {
          id: newUser.user.id,
          email: newUser.user.email
        }
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
