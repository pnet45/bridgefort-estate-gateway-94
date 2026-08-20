import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action = 'LOGIN' } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'reCAPTCHA token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // reCAPTCHA is disabled by default during the current stabilization phase.
    // To restore server-side enforcement, set RECAPTCHA_ENFORCED=true and
    // provide RECAPTCHA_SECRET_KEY. The frontend must also set
    // VITE_ENABLE_RECAPTCHA=true and provide its V2 site key.
    const recaptchaEnforced = Deno.env.get('RECAPTCHA_ENFORCED') === 'true'

    if (token === 'recaptcha-disabled') {
      if (!recaptchaEnforced) {
        return new Response(
          JSON.stringify({ success: true, score: 1.0, disabled: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: false, error: 'reCAPTCHA is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!recaptchaEnforced) {
      return new Response(
        JSON.stringify({ success: true, score: 1.0, disabled: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY')
    if (!secretKey) {
      console.error('RECAPTCHA_ENFORCED=true but RECAPTCHA_SECRET_KEY is missing')
      return new Response(
        JSON.stringify({ success: false, error: 'Server reCAPTCHA configuration is incomplete' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify'
    const verifyData = new URLSearchParams({
      secret: secretKey,
      response: token,
    })

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyData,
    })

    const verifyResult = await verifyResponse.json()
    console.log(`reCAPTCHA verification result for ${action}:`, JSON.stringify(verifyResult))

    if (verifyResult.success) {
      return new Response(
        JSON.stringify({ success: true, score: verifyResult.score || 1.0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.error('reCAPTCHA verification failed:', verifyResult['error-codes'])
    return new Response(
      JSON.stringify({
        success: false,
        error: 'reCAPTCHA verification failed',
        errors: verifyResult['error-codes']
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
