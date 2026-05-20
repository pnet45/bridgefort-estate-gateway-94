
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const authenticatedUserId = claimsData.claims.sub;

    const body = req.headers.get('content-type')?.includes('application/json') ? await req.json() : {};
    const reference = body.reference || (new URL(req.url)).pathname.split('/').pop();

    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack secret key not configured');
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    // If payment is successful, update order, payment, and any membership purchase records
    if (data.status && data.data.status === 'success') {
      const supabaseAdmin = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Update orders table if this payment belongs to an order
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('payment_reference', reference);

      // Update payments table using authenticated user_id
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString()
        })
        .eq('paystack_reference', reference)
        .eq('user_id', authenticatedUserId); // Use authenticated user, not client-supplied

      const purchaseResult = await supabaseAdmin
        .from('mlm_membership_purchases')
        .select('*')
        .eq('paystack_reference', reference)
        .limit(1)
        .single();

      if (!purchaseResult.error && purchaseResult.data) {
        const purchase = purchaseResult.data;
        const purchaseAmount = Number(purchase.amount ?? 0);

        if (purchase.status === 'pending') {
          await supabaseAdmin
            .from('mlm_membership_purchases')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', purchase.id)
            .eq('status', 'pending');

          const profileResult = await supabaseAdmin
            .from('profiles')
            .select('id, referred_by_id, current_package, wallet_balance, total_commissions, total_personal_volume, is_pbo')
            .eq('id', purchase.user_id)
            .single();

          if (!profileResult.error && profileResult.data) {
            const purchaserProfile = profileResult.data;
            const packageResult = await supabaseAdmin
              .from('mlm_packages')
              .select('package_code, package_name')
              .eq('package_code', purchase.package_code)
              .single();

            if (!packageResult.error && packageResult.data) {
              await supabaseAdmin
                .from('profiles')
                .update({
                  current_package: packageResult.data.package_code,
                  current_rank: packageResult.data.package_name,
                  total_personal_volume: Number(purchaserProfile.total_personal_volume ?? 0) + purchaseAmount,
                  is_active: true,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', purchase.user_id);
            }

            const createSponsorCommission = async (beneficiaryId: string, sponsorLevel: number) => {

        if (!profileResult.error && profileResult.data) {
          const purchaserProfile = profileResult.data;
          const packageResult = await supabaseAdmin
            .from('mlm_packages')
            .select('package_code, package_name')
            .eq('package_code', purchase.package_code)
            .single();

          if (!packageResult.error && packageResult.data) {
            await supabaseAdmin
              .from('profiles')
              .update({
                current_package: packageResult.data.package_code,
                current_rank: packageResult.data.package_name,
                updated_at: new Date().toISOString(),
              })
              .eq('id', purchase.user_id);
          }

          const createSponsorCommission = async (beneficiaryId: string, sponsorLevel: number) => {
            const sponsorResult = await supabaseAdmin
              .from('profiles')
              .select('id, current_package, wallet_balance, total_commissions, is_pbo')
              .eq('id', beneficiaryId)
              .single();

            if (sponsorResult.error || !sponsorResult.data || !sponsorResult.data.is_pbo) {
              return;
            }

            const sponsorProfile = sponsorResult.data;
            const sponsorPackageResult = await supabaseAdmin
              .from('mlm_packages')
              .select('package_code, direct_commission_pct, indirect_commission_pct, withdrawable')
              .eq('package_code', sponsorProfile.current_package)
              .single();

            if (!sponsorPackageResult.error && sponsorPackageResult.data) {
              const sponsorPackage = sponsorPackageResult.data;
              const commissionRate = sponsorLevel === 1
                ? Number(sponsorPackage.direct_commission_pct ?? 0)
                : Number(sponsorPackage.indirect_commission_pct ?? 0);

              if (commissionRate <= 0) {
                return;
              }

              const commissionAmount = Number((purchaseAmount * commissionRate) / 100);
              const commissionStatus = sponsorPackage.withdrawable ? 'available' : 'locked';

              await supabaseAdmin.from('mlm_commissions').insert([{
                source_purchase_id: purchase.id,
                beneficiary_id: beneficiaryId,
                sponsor_level: sponsorLevel,
                commission_rate: commissionRate,
                commission_amount: commissionAmount,
                status: commissionStatus,
                description: sponsorLevel === 1
                  ? 'Direct sponsor commission for membership purchase'
                  : 'Indirect sponsor commission for membership purchase',
              }]);

              const profileUpdates: Record<string, unknown> = {
                total_commissions: Number(sponsorProfile.total_commissions ?? 0) + commissionAmount,
              };
              if (commissionStatus === 'available') {
                profileUpdates.wallet_balance = Number(sponsorProfile.wallet_balance ?? 0) + commissionAmount;
              }

              await supabaseAdmin
                .from('profiles')
                .update(profileUpdates)
                .eq('id', beneficiaryId);
            }
          };

          if (purchaserProfile.referred_by_id) {
            await createSponsorCommission(purchaserProfile.referred_by_id, 1);

            const uplineResult = await supabaseAdmin
              .from('profiles')
              .select('referred_by_id')
              .eq('id', purchaserProfile.referred_by_id)
              .single();

            if (!uplineResult.error && uplineResult.data?.referred_by_id) {
              await createSponsorCommission(uplineResult.data.referred_by_id, 2);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      },
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'An error occurred verifying your payment' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
