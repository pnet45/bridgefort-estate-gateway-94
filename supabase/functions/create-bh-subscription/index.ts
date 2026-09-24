// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

// Server-side authoritative pricing catalog (mirrors src/data/bhSubscriptionEstates.ts).
// Clients can no longer supply their own amounts.
const ESTATES = {
  'big-league-county-warri': { name: 'The Big League County', location: 'Warri, Delta State', plots: { '225 SQM': 3300000, '232 SQM': 5900000, '450 SQM': 10500000, '464 SQM': 10900000 } },
  'fountains-crest-smart-city': { name: 'Fountains Crest Smart City', location: 'Owode, Ogun State', plots: { '250 SQM': 560000, '300 SQM': 670000, '450 SQM': 1000000, '500 SQM': 1200000, '600 SQM': 1300000 } },
  'bridgefort-crest-ville-isiwo': { name: 'Bridgefort Crest Ville', location: 'Isiwo – Epe, Ogun State', plots: { '250 SQM': 3100000, '300 SQM': 3700000, '450 SQM': 5500000, '500 SQM': 5400000, '600 SQM': 7400000 } },
  'hampton-court-phase-3-agbara': { name: 'Hampton Court Phase 3', location: 'Agbara, Ogun State', plots: { '250 SQM': 1400000, '300 SQM': 1700000, '450 SQM': 2500000, '500 SQM': 2800000, '600 SQM': 3400000 } },
  'hampton-ville-itokin-epe': { name: 'Hampton Ville Estate', location: 'Itokin – Epe, Lagos State', plots: { '250 SQM': 5000000, '300 SQM': 6000000, '450 SQM': 9000000, '500 SQM': 10000000, '600 SQM': 12000000 } },
  'bridgefort-biz-hub-ode-omi': { name: 'Bridgefort Biz Hub', location: 'Ode-Omi, Ogun State', plots: { '250 SQM': 3100000, '300 SQM': 3700000, '450 SQM': 5500000, '500 SQM': 5400000, '600 SQM': 7400000 } },
  'big-league-haven-ogwashi': { name: 'The Big League Haven', location: 'Ogwashi-Uku, Delta State', plots: { '225 SQM': 2750000, '232 SQM': 2900000, '450 SQM': 5500000, '464 SQM': 5800000 } },
  'gateway-mini-golf-owode': { name: 'Gateway Mini-Golf Estate & Resorts', location: 'Owode, Ogun State', plots: { '250 SQM': 1700000, '300 SQM': 2000000, '450 SQM': 3000000, '500 SQM': 3400000, '600 SQM': 4000000 } },
};

const FREQUENCY_INSTALLMENT = { daily: 5000, weekly: 35000, monthly: 150000 };
const FREQUENCY_DAYS = { daily: 1, weekly: 7, monthly: 30 };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return json({ error: 'Invalid authentication' }, 401);
    const userId = claimsData.claims.sub;

    const body = req.headers.get('content-type')?.includes('application/json') ? await req.json() : {};
    const { estate_slug, plot_size, frequency } = body;

    // Validate inputs
    if (!estate_slug || !plot_size || !frequency) return json({ error: 'estate_slug, plot_size, and frequency are required' }, 400);
    const estate = ESTATES[estate_slug];
    if (!estate) return json({ error: 'Invalid estate' }, 400);
    if (!(plot_size in estate.plots)) return json({ error: 'Invalid plot size for this estate' }, 400);
    if (!(frequency in FREQUENCY_INSTALLMENT)) return json({ error: 'Invalid payment frequency' }, 400);

    // Compute all pricing server-side — client never supplies amounts
    const totalAmount = estate.plots[plot_size];
    const installmentAmount = FREQUENCY_INSTALLMENT[frequency];
    const totalInstallments = Math.ceil(totalAmount / installmentAmount);
    const totalDays = totalInstallments * FREQUENCY_DAYS[frequency];
    const expectedEnd = new Date();
    expectedEnd.setDate(expectedEnd.getDate() + totalDays);
    const expectedEndDate = expectedEnd.toISOString().slice(0, 10);

    // Insert with service role — bypasses RLS, no client-controlled fields
    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: created, error: insertError } = await admin.from('bh_subscriptions').insert({
      user_id: userId,
      estate_slug,
      estate_name: `${estate.name}, ${estate.location}`,
      plot_size,
      total_amount: totalAmount,
      frequency,
      installment_amount: installmentAmount,
      total_installments: totalInstallments,
      expected_end_date: expectedEndDate,
      status: 'active',
      paid_amount: 0,
      paid_installments: 0,
    }).select().single();

    if (insertError) throw insertError;
    return json({ subscription: created });
  } catch (error) {
    console.error('create-bh-subscription error:', error);
    return json({ error: 'Failed to create subscription' }, 400);
  }
});
