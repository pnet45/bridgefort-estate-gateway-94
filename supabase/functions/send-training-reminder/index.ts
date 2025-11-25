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

      // TODO: Integrate with your email service (Resend, SendGrid, etc.)
      // For now, we'll just log the reminders that would be sent
      for (const registration of registrations) {
        console.log(`Would send reminder to: ${registration.email} for event: ${event.title}`);
        
        // Example email structure (uncomment and configure when email service is ready):
        /*
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Training <training@yourdomain.com>',
            to: [registration.email],
            subject: `Reminder: ${event.title} Tomorrow!`,
            html: `
              <h1>Training Event Reminder</h1>
              <p>Hi ${registration.name},</p>
              <p>This is a friendly reminder that you're registered for:</p>
              <h2>${event.title}</h2>
              <p><strong>Date:</strong> ${event.date}</p>
              <p><strong>Time:</strong> ${event.time}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p>We look forward to seeing you there!</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email to:', registration.email);
        }
        */

        totalRemindersSent++;
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
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
