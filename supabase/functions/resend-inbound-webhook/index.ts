import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Resend's "Inbound" feature is push-based, not pollable: whenever an email
// arrives, Resend sends a POST webhook (type "email.received") to whatever
// endpoint you register for it in the Resend dashboard, signed with Svix.
// There is no bulk "list all received emails" REST endpoint — the previous
// implementation (resend-receive-emails "list"/"sync" actions) was calling
// a URL that doesn't exist, which is why incoming mail never synced even
// though outgoing mail worked fine (sending uses a real, different endpoint).
//
// This function is the correct replacement: register its URL as a webhook
// endpoint in Resend (Dashboard → Webhooks → Add Endpoint → select the
// "email.received" event), copy the signing secret it gives you, and set it
// as the Supabase Edge Function secret RESEND_WEBHOOK_SECRET. From then on,
// every inbound email lands in `admin_emails` automatically and shows up in
// the admin inbox in real time via the existing Postgres realtime
// subscription — no manual "sync" button required.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

// Verifies a Svix-signed webhook body without pulling in the full svix SDK.
// See https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests
async function verifySvixSignature(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string
): Promise<boolean> {
  // Secrets are given as "whsec_<base64>"
  const secretBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, '')), (c) => c.charCodeAt(0));
  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));

  // svix-signature header can contain multiple space-separated "v1,<sig>" values
  const candidates = svixSignature.split(' ').map((s) => s.split(',')[1]).filter(Boolean);
  return candidates.includes(expected);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    const svixId = req.headers.get('svix-id') || '';
    const svixTimestamp = req.headers.get('svix-timestamp') || '';
    const svixSignature = req.headers.get('svix-signature') || '';

    if (webhookSecret) {
      const valid = svixId && svixTimestamp && svixSignature
        ? await verifySvixSignature(rawBody, svixId, svixTimestamp, svixSignature, webhookSecret)
        : false;
      if (!valid) {
        console.error('Resend webhook signature verification failed');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      // No secret configured yet — accept but log loudly so this is easy to
      // notice and fix, rather than silently dropping every inbound email.
      console.warn('RESEND_WEBHOOK_SECRET is not set — accepting webhook without signature verification.');
    }

    const event = JSON.parse(rawBody);

    if (event?.type !== 'email.received') {
      // Ignore any other event types (sent/delivered/bounced/etc) — those
      // are handled elsewhere. Acknowledge quickly either way.
      return new Response(JSON.stringify({ received: true, ignored: event?.type }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailId = event.data?.email_id;
    if (!emailId) {
      return new Response(JSON.stringify({ error: 'Missing email_id in webhook payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Avoid duplicate inserts on webhook retries.
    const { data: existing } = await supabase
      .from('admin_emails')
      .select('id')
      .eq('external_ref', emailId)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // The webhook payload only carries metadata — fetch the full body via
    // the Received Emails API using the same email_id.
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let subject = event.data?.subject || '(No Subject)';
    let from = event.data?.from || '';
    let to = Array.isArray(event.data?.to) ? event.data.to[0] : (event.data?.to || 'admin@bridgeforthomes.com');
    let text = '';
    let html: string | undefined;
    const createdAt = event.data?.created_at || event.created_at || new Date().toISOString();

    if (RESEND_API_KEY) {
      try {
        const detailResp = await fetch(`https://api.resend.com/emails/receiving/${emailId}`, {
          headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
        });
        if (detailResp.ok) {
          const detail = await detailResp.json();
          subject = detail.subject || subject;
          from = detail.from || from;
          to = detail.to || to;
          text = detail.text || '';
          html = detail.html || undefined;
        } else {
          console.error('Failed to fetch full inbound email body:', await detailResp.text());
        }
      } catch (fetchErr) {
        console.error('Error fetching inbound email detail:', fetchErr);
      }
    }

    const fromName = typeof from === 'string' ? from : Array.isArray(from) ? from[0] : String(from || '');

    const { error: insertError } = await supabase.from('admin_emails').insert({
      from_email: fromName,
      from_name: fromName,
      to_email: Array.isArray(to) ? to[0] : String(to),
      to_name: 'Admin',
      subject,
      body: text || html || '',
      html,
      folder: 'inbox',
      source: 'resend',
      external_ref: emailId,
      created_at: createdAt,
      updated_at: createdAt,
    });

    if (insertError) {
      console.error('Error inserting inbound email:', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Also drop it into contact_messages so it shows up alongside contact
    // form submissions, matching prior behavior.
    await supabase.from('contact_messages').insert({
      name: fromName || 'Unknown',
      email: fromName || 'unknown@bridgeforthomes.com',
      phone: '',
      subject,
      message: text || html || '',
      responded: false,
      responded_at: null,
      responded_by: null,
      created_at: createdAt,
    });

    return new Response(JSON.stringify({ received: true, inserted: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in resend-inbound-webhook:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Still return 200 for malformed/unexpected payloads so Resend doesn't
    // endlessly retry something we'll never be able to process — but log
    // loudly so it's visible in function logs.
    return new Response(JSON.stringify({ received: true, error: message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
