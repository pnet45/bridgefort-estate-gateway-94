import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ALLOWED_ACTIONS = new Set(['list','get','list-attachments','get-attachment']);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authed = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authed.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const service = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await service.rpc('has_role', { _user_id: claimsData.claims.sub, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(RESEND_API_KEY);
    const { action, emailId, attachmentId } = await req.json();
    if (!ALLOWED_ACTIONS.has(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const uuidRe = /^[a-zA-Z0-9_-]{1,128}$/;
    if (emailId && !uuidRe.test(emailId)) {
      return new Response(JSON.stringify({ error: 'Invalid emailId' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (attachmentId && !uuidRe.test(attachmentId)) {
      return new Response(JSON.stringify({ error: 'Invalid attachmentId' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let data: any;


    switch (action) {
      case 'list': {
        const result = await resend.emails.get(emailId || '');
        data = result.data;
        break;
      }
      case 'get': {
        if (!emailId) throw new Error('emailId is required for get action');
        // Use the raw API for receiving emails
        const response = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
        });
        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Resend API error [${response.status}]: ${errBody}`);
        }
        data = await response.json();
        break;
      }
      case 'list-attachments': {
        if (!emailId) throw new Error('emailId is required for list-attachments action');
        const response = await fetch(`https://api.resend.com/emails/receiving/${emailId}/attachments`, {
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
        });
        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Resend API error [${response.status}]: ${errBody}`);
        }
        data = await response.json();
        break;
      }
      case 'get-attachment': {
        if (!emailId || !attachmentId) throw new Error('emailId and attachmentId are required');
        
        // Use the Resend receiving attachments API
        const response = await fetch(
          `https://api.resend.com/emails/receiving/${emailId}/attachments/${attachmentId}`,
          {
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` },
          }
        );
        
        if (!response.ok) {
          const errBody = await response.text();
          console.error('Resend attachment API error:', errBody);
          throw new Error(`Resend API error [${response.status}]: ${errBody}`);
        }
        
        // The API returns the attachment data - could be JSON with base64 or binary
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Binary response - convert to base64
          const arrayBuffer = await response.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Content = btoa(binary);
          data = { 
            content: base64Content, 
            content_type: contentType || 'application/octet-stream' 
          };
        }
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in resend-receive-emails:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
