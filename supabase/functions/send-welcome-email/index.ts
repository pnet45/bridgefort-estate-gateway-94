
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { email, firstName, lastName } = await req.json()

  const welcomeEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PWAN Bridgefort</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 10px; margin-bottom: 30px;">
        <img src="https://xyvspvtdaacqfmfocvhw.supabase.co/storage/v1/object/public/public/lovable-uploads/pwanlogo.png" alt="PWAN Bridgefort Logo" style="max-width: 200px; height: auto; margin-bottom: 20px;">
        <h1 style="color: #1e40af; margin: 0;">Welcome to PWAN Bridgefort!</h1>
    </div>
    
    <div style="padding: 0 20px;">
        <h2 style="color: #1e40af;">Dear ${firstName || ''} ${lastName || ''},</h2>
        
        <p>Welcome to the PWAN Bridgefort family! We're thrilled to have you join our community of smart property investors and homeowners.</p>
        
        <p><strong>What's Next?</strong></p>
        <ul>
            <li>Complete your profile to unlock all features</li>
            <li>Browse our exclusive property listings</li>
            <li>Take advantage of our flexible payment plans</li>
            <li>Schedule property inspections</li>
            <li>Access our documentation services</li>
        </ul>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
            <h3 style="color: #1e40af; margin-top: 0;">Why Choose PWAN Bridgefort?</h3>
            <ul style="margin: 0; padding-left: 20px;">
                <li>✅ Verified and titled properties</li>
                <li>✅ Flexible payment options</li>
                <li>✅ Professional documentation services</li>
                <li>✅ Expert guidance throughout your journey</li>
                <li>✅ Excellent customer support</li>
            </ul>
        </div>
        
        <p><strong>Need Help?</strong></p>
        <p>Our team is always ready to assist you:</p>
        <ul>
            <li>📞 Call/WhatsApp: +2348030624059</li>
            <li>✉️ Email: info@pwanbridgefort.com</li>
            <li>🌐 Website: www.pwanbridgefort.com</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #1e40af; border-radius: 8px;">
            <a href="https://pwanbridgefort.com/properties" style="color: white; text-decoration: none; font-weight: bold; font-size: 18px;">🏡 Explore Properties Now</a>
        </div>
        
        <p>Thank you for choosing PWAN Bridgefort. We look forward to helping you achieve your property investment goals!</p>
        
        <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The PWAN Bridgefort Team</strong><br>
            <em>...Rebuilding the Future!</em>
        </p>
    </div>
    
    <footer style="text-align: center; padding: 20px; margin-top: 40px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p><strong>PWAN Bridgefort Estates & Investment Ltd</strong></p>
        <p>Building Legacies, Creating Wealth</p>
        <p>📍 Lagos, Nigeria | 📞 +2348030624059</p>
        <p>💳 Zenith Bank - Account: 1310762860</p>
        <p style="margin-top: 15px;">
            <a href="https://pwanbridgefort.com" style="color: #1e40af; text-decoration: none;">www.pwanbridgefort.com</a> |
            <a href="https://pwanbridgefort.com/privacy" style="color: #1e40af; text-decoration: none;">Privacy Policy</a> |
            <a href="https://pwanbridgefort.com/terms" style="color: #1e40af; text-decoration: none;">Terms of Service</a>
        </p>
        <p style="margin-top: 10px; font-size: 10px;">
            This email was sent to ${email}. If you no longer wish to receive emails from us, you can unsubscribe at any time.
        </p>
    </footer>
</body>
</html>
  `

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY is not set' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'PWAN Bridgefort <welcome@pwanbridgefort.com>',
        to: [email],
        subject: '🏡 Welcome to PWAN Bridgefort - Your Property Journey Starts Here!',
        html: welcomeEmailHtml,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      const error = await res.text()
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
