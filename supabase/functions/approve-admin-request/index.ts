import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    let newUserId: string;
    let isLegacyRequestWithNoAccount = false;

    if (pendingRequest.user_id) {
      // The normal path: create-admin-signup already created this account
      // with the password the person actually typed. Approval just grants
      // roles — it must never touch the password, and must never call
      // createUser again (the account already exists).
      newUserId = pendingRequest.user_id;
    } else {
      // A request submitted before this fix existed — no account was ever
      // created for it. Fall back to the old temp-password + recovery-link
      // flow, but actually email the link this time (generateLink() only
      // generates the link; it was never being sent to anyone).
      isLegacyRequestWithNoAccount = true;
      const tempPassword = crypto.randomUUID() + '!Aa1';

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: pendingRequest.email,
        password: tempPassword,
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
      newUserId = newUser.user.id;
      console.log(`User created (legacy fallback): ${newUserId}`);
    }

    // Assign legacy admin role (kept for backward compatibility with
    // existing has_role(uid,'admin') checks scattered through the app)
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUserId,
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
          user_id: newUserId,
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
                user_id: newUserId,
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

    // Notify the approved admin. The two cases genuinely need different
    // emails: the normal case already has a working password (set at
    // signup), so there's nothing to reset — telling them to "reset their
    // password" would be actively wrong. The legacy fallback case has only
    // a random throwaway password nobody has ever seen, so it truly does
    // need a recovery link — and that link has to actually be emailed,
    // not just generated and discarded (generateLink() only creates the
    // link object; it never sends anything on its own, which is why the
    // previous version of this function silently never delivered it).
    if (isLegacyRequestWithNoAccount) {
      const { data: linkData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: pendingRequest.email,
      });

      if (resetError) {
        console.error('Password reset link generation error:', resetError);
      } else {
        const actionLink = linkData?.properties?.action_link;
        try {
          await resend.emails.send({
            from: "Bridgefort Homes Development Ltd <noreply@bridgeforthomes.com>",
            to: [pendingRequest.email],
            subject: "Your Admin Access Has Been Approved — Set Your Password",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 22px;">Admin Access Approved</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p>Hello,</p>
                  <p>Your administrator access request has been approved. Set your password to finish setting up your account:</p>
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${actionLink}" style="background: #1e40af; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Set Your Password</a>
                  </div>
                  <p style="color: #6b7280; font-size: 13px;">If the button doesn't work, copy this link: ${actionLink}</p>
                </div>
              </div>
            `,
          });
        } catch (emailError) {
          console.error('Approval email send error:', emailError);
        }
      }
    } else {
      try {
        await resend.emails.send({
          from: "Bridgefort Homes Development Ltd <noreply@bridgeforthomes.com>",
          to: [pendingRequest.email],
          subject: "Your Admin Access Has Been Approved",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">Admin Access Approved</h1>
              </div>
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Hello,</p>
                <p>Your administrator access request has been approved. You can log in now with the email and password you used when you signed up — no password reset needed.</p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Approval notification email send error:', emailError);
      }
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
        message: isLegacyRequestWithNoAccount
          ? `Admin account created for ${pendingRequest.email}. A password setup email has been sent.`
          : `${pendingRequest.email} is approved and can log in immediately with their existing password.`,
        user: {
          id: newUserId,
          email: pendingRequest.email
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
