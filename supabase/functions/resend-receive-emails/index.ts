import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(RESEND_API_KEY);
    const { action, emailId, attachmentId } = await req.json();

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
