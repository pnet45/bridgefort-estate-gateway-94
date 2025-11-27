import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { attendanceId } = await req.json();

    if (!attendanceId) {
      throw new Error('Attendance ID is required');
    }

    // Get attendance record with related data
    const { data: attendance, error: attendanceError } = await supabase
      .from('training_attendance')
      .select(`
        *,
        training_events!event_id (
          title,
          date,
          location,
          category
        ),
        training_registrations!registration_id (
          name,
          email
        )
      `)
      .eq('id', attendanceId)
      .eq('user_id', user.id)
      .single();

    if (attendanceError || !attendance) {
      throw new Error('Attendance record not found');
    }

    if (!attendance.completed) {
      throw new Error('Training not completed');
    }

    // Generate certificate HTML
    const certificateHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @page { size: landscape; margin: 0; }
            body { 
              margin: 0; 
              padding: 60px;
              font-family: 'Georgia', serif;
              background: linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%);
              color: #1e3a8a;
            }
            .certificate {
              background: white;
              padding: 60px;
              border: 20px solid #d4af37;
              box-shadow: 0 0 50px rgba(0,0,0,0.3);
              text-align: center;
              position: relative;
            }
            .certificate::before {
              content: '';
              position: absolute;
              top: 40px;
              left: 40px;
              right: 40px;
              bottom: 40px;
              border: 2px solid #d4af37;
            }
            h1 {
              font-size: 72px;
              color: #d4af37;
              margin: 20px 0;
              text-transform: uppercase;
              letter-spacing: 4px;
            }
            h2 {
              font-size: 28px;
              color: #1e3a8a;
              margin: 30px 0;
            }
            .recipient {
              font-size: 48px;
              color: #dc2626;
              font-weight: bold;
              margin: 40px 0;
              text-decoration: underline;
              text-decoration-color: #d4af37;
            }
            .details {
              font-size: 20px;
              color: #4b5563;
              margin: 30px 0;
              line-height: 1.8;
            }
            .signature {
              display: flex;
              justify-content: space-around;
              margin-top: 80px;
              padding-top: 40px;
            }
            .signature-line {
              border-top: 2px solid #1e3a8a;
              width: 250px;
              text-align: center;
              padding-top: 10px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #1e3a8a;
              margin-bottom: 20px;
            }
            .date {
              position: absolute;
              top: 60px;
              right: 80px;
              font-size: 16px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div class="logo">PWAN BRIDGEFORT</div>
            <h1>Certificate of Completion</h1>
            <h2>This is to certify that</h2>
            <div class="recipient">${attendance.training_registrations.name}</div>
            <div class="details">
              has successfully completed the training program<br/>
              <strong style="font-size: 24px; color: #1e3a8a;">${attendance.training_events.title}</strong><br/>
              held on ${new Date(attendance.training_events.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
              at ${attendance.training_events.location}
            </div>
            <div class="signature">
              <div class="signature-line">
                <div style="font-weight: bold; margin-bottom: 5px;">Training Coordinator</div>
                <div style="font-size: 14px; color: #6b7280;">PWAN Bridgefort</div>
              </div>
              <div class="signature-line">
                <div style="font-weight: bold; margin-bottom: 5px;">Managing Director</div>
                <div style="font-size: 14px; color: #6b7280;">PWAN Bridgefort</div>
              </div>
            </div>
            <div style="margin-top: 40px; font-size: 14px; color: #6b7280;">
              Certificate ID: ${attendanceId.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </body>
      </html>
    `;

    // Mark certificate as issued
    await supabase
      .from('training_attendance')
      .update({ 
        certificate_issued: true,
        certificate_issued_at: new Date().toISOString()
      })
      .eq('id', attendanceId);

    return new Response(
      JSON.stringify({ 
        success: true,
        certificate: certificateHtml,
        attendeeName: attendance.training_registrations.name,
        eventTitle: attendance.training_events.title
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating certificate:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});