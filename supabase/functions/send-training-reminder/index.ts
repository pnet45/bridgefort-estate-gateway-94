import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

interface Registration {
  name: string;
  email: string;
  event_title: string;
  event_date: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date 24 hours from now
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log('Checking for events on:', tomorrowStr);

    // Fetch events happening tomorrow
    const { data: events, error: eventsError } = await supabase
      .from('training_events')
      .select('*')
      .eq('date', tomorrowStr);

    if (eventsError) {
      throw eventsError;
    }

    if (!events || events.length === 0) {
      console.log('No events found for tomorrow');
      return new Response(
        JSON.stringify({ message: 'No events scheduled for tomorrow', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${events.length} event(s) for tomorrow`);

    let totalRemindersSent = 0;

    // For each event, fetch registrations and send reminders
    for (const event of events) {
      const { data: registrations, error: regError } = await supabase
        .from('training_registrations')
        .select('name, email, event_title, event_date')
        .eq('event_title', event.title)
        .eq('need_reminder', true);

      if (regError) {
        console.error('Error fetching registrations:', regError);
        continue;
      }

      if (!registrations || registrations.length === 0) {
        console.log(`No registrations found for event: ${event.title}`);
        continue;
      }

      console.log(`Found ${registrations.length} registration(s) for ${event.title}`);

      // Send email reminders using Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      for (const registration of registrations) {
        console.log(`Sending reminder to: ${registration.email} for event: ${event.title}`);
        
        if (!resendApiKey) {
          console.error('RESEND_API_KEY not configured');
          continue;
        }

        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Bridgefort Homes Development Ltd Training <training@pwanbridgefort.ng>',
              to: [registration.email],
              subject: `Reminder: ${event.title} Tomorrow!`,
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background: linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                      .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                      .event-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                      .detail-row { display: flex; margin: 10px 0; }
                      .detail-label { font-weight: bold; min-width: 100px; color: #1e3a8a; }
                      .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                      .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>🎯 Training Event Reminder</h1>
                      </div>
                      <div class="content">
                        <p>Hi ${registration.name},</p>
                        <p>This is a friendly reminder that you're registered for an exciting training event tomorrow!</p>
                        
                        <div class="event-details">
                          <h2 style="color: #1e3a8a; margin-top: 0;">${event.title}</h2>
                          <div class="detail-row">
                            <span class="detail-label">📅 Date:</span>
                            <span>${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">🕐 Time:</span>
                            <span>${event.time}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">📍 Location:</span>
                            <span>${event.location}</span>
                          </div>
                        </div>

                        <p><strong>What to bring:</strong></p>
                        <ul>
                          <li>Notepad and pen for taking notes</li>
                          <li>Your registration confirmation (this email)</li>
                          <li>An open mind ready to learn!</li>
                        </ul>

                        <p>We're looking forward to seeing you there!</p>
                        
                        <p style="margin-top: 30px;">
                          <strong>Questions?</strong><br>
                          Contact us at: <a href="tel:+2348030624059">+234 803 062 4059</a><br>
                          Email: <a href="mailto:training@pwanbridgefort.ng">training@pwanbridgefort.ng</a>
                        </p>
                      </div>
                      <div class="footer">
                        <p><strong>Bridgefort Homes Development Ltd</strong><br>
                        ...Rebuilding the Future<br>
                        <a href="https://www.pwanbridgefort.ng">www.pwanbridgefort.ng</a></p>
                      </div>
                    </div>
                  </body>
                </html>
              `,
            }),
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error(`Failed to send email to ${registration.email}:`, errorText);
          } else {
            console.log(`Successfully sent reminder to ${registration.email}`);
            totalRemindersSent++;
          }
        } catch (emailError) {
          console.error(`Error sending email to ${registration.email}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reminder check completed',
        eventsFound: events.length,
        remindersSent: totalRemindersSent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in send-training-reminder:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
