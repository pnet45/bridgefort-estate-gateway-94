import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { action, emailId, attachmentId } = await req.json();

    let url: string;
    const baseUrl = 'https://api.resend.com';

    switch (action) {
      case 'list':
        url = `${baseUrl}/emails/receiving`;
        break;
      case 'get':
        if (!emailId) throw new Error('emailId is required for get action');
        url = `${baseUrl}/emails/receiving/${emailId}`;
        break;
      case 'list-attachments':
        if (!emailId) throw new Error('emailId is required for list-attachments action');
        url = `${baseUrl}/emails/receiving/${emailId}/attachments`;
        break;
      case 'get-attachment':
        if (!emailId || !attachmentId) throw new Error('emailId and attachmentId are required');
        url = `${baseUrl}/emails/receiving/${emailId}/attachments/${attachmentId}`;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', JSON.stringify(data));
      throw new Error(`Resend API error [${response.status}]: ${JSON.stringify(data)}`);
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
