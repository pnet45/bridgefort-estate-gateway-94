import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─────────────────────────────────────────────────────────────────────────
// WHY INBOUND MAIL WASN'T ARRIVING — the full picture
//
// Getting mail INTO Resend at all requires three things to be true, in
// order, before a single line of application code ever runs:
//
//   1. MX records. Resend only receives mail for domains/subdomains that
//      have an MX record pointing at Resend's mail servers (Dashboard →
//      Domains → your domain → Receiving, or Dashboard → Emails → Receiving
//      for the exact record to add). Without this, mail sent to your
//      address never reaches Resend in the first place — nothing on our
//      side, no webhook, no API, can "catch" mail that was never routed
//      there. This is almost certainly the actual blocker if mail still
//      isn't showing up after the previous fix.
//   2. A registered webhook endpoint (Dashboard → Webhooks → Add Endpoint →
//      event `email.received`, pointed at this function's URL). Resend has
//      no bulk "list received emails" API — receiving is push-only.
//   3. RESEND_WEBHOOK_SECRET set as a Supabase secret, so this function can
//      verify the request really came from Resend.
//
// Once mail is actually routed to Resend and the webhook is registered,
// THIS function does the rest: verifies the webhook, fetches the full email
// body, downloads every attachment and stores it in Supabase Storage (so
// download links don't expire the way Resend's own signed URLs do after an
// hour), and inserts everything into admin_emails, which the inbox UI
// already renders and subscribes to in real time.
// ─────────────────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

async function verifySvixSignature(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string
): Promise<boolean> {
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
      console.warn('RESEND_WEBHOOK_SECRET is not set — accepting webhook without signature verification.');
    }

    const event = JSON.parse(rawBody);

    if (event?.type !== 'email.received') {
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

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let subject = event.data?.subject || '(No Subject)';
    let from = event.data?.from || '';
    let to = Array.isArray(event.data?.to) ? event.data.to[0] : (event.data?.to || 'admin@bridgeforthomes.com');
    let text = '';
    let html: string | undefined;
    let attachmentMeta: any[] = event.data?.attachments || [];
    const createdAt = event.data?.created_at || event.created_at || new Date().toISOString();

    if (RESEND_API_KEY) {
      // Full body — GET /emails/receiving/{id}
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
          if (Array.isArray(detail.attachments)) attachmentMeta = detail.attachments;
        } else {
          console.error('Failed to fetch full inbound email body:', detailResp.status, await detailResp.text());
        }
      } catch (fetchErr) {
        console.error('Error fetching inbound email detail:', fetchErr);
      }

      // Attachments — GET /emails/receiving/{id}/attachments (gives download_url,
      // valid for 1 hour, so we pull each one down and re-host it in Storage).
      if (attachmentMeta.length > 0) {
        try {
          const attResp = await fetch(`https://api.resend.com/emails/receiving/${emailId}/attachments`, {
            headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
          });
          if (attResp.ok) {
            const attJson = await attResp.json();
            const attachmentsWithUrls: any[] = Array.isArray(attJson) ? attJson : (attJson?.data || []);
            const stored: any[] = [];

            for (const att of attachmentsWithUrls) {
              try {
                if (!att.download_url) continue;
                const fileResp = await fetch(att.download_url);
                if (!fileResp.ok) {
                  console.error('Failed to download attachment', att.filename, fileResp.status);
                  continue;
                }
                const fileBuffer = new Uint8Array(await fileResp.arrayBuffer());
                const storagePath = `${emailId}/${att.id}-${att.filename || 'attachment'}`;

                const { error: uploadError } = await supabase.storage
                  .from('email-attachments')
                  .upload(storagePath, fileBuffer, {
                    contentType: att.content_type || 'application/octet-stream',
                    upsert: true,
                  });

                if (uploadError) {
                  console.error('Error uploading attachment to storage:', uploadError);
                  continue;
                }

                const { data: publicUrlData } = supabase.storage
                  .from('email-attachments')
                  .getPublicUrl(storagePath);

                stored.push({
                  id: att.id,
                  filename: att.filename || 'attachment',
                  content_type: att.content_type || 'application/octet-stream',
                  content_disposition: att.content_disposition,
                  size: fileBuffer.byteLength,
                  storage_path: storagePath,
                  url: publicUrlData?.publicUrl,
                });
              } catch (attErr) {
                console.error('Error processing attachment', att?.filename, attErr);
              }
            }
            attachmentMeta = stored;
          } else {
            console.error('Failed to list attachments:', attResp.status, await attResp.text());
          }
        } catch (attListErr) {
          console.error('Error fetching attachment list:', attListErr);
        }
      }
    } else {
      console.warn('RESEND_API_KEY is not set — inbound email will be saved with metadata only, no body or attachments.');
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
      attachments: attachmentMeta,
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

    return new Response(JSON.stringify({ received: true, inserted: true, attachments: attachmentMeta.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in resend-inbound-webhook:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ received: true, error: message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
