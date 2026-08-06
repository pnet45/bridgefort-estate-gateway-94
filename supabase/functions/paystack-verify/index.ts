
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
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

      // ---- Amount verification -------------------------------------------
      // Paystack reports the amount actually charged, in kobo. We must compare
      // it to the authoritative price stored server-side before marking
      // anything as paid; otherwise a caller can initialize a ₦1 charge for a
      // real order/membership reference and have it recorded as fully paid.
      const paidAmount = Number(data.data.amount ?? 0) / 100;
      const currency = String(data.data.currency ?? 'NGN');

      const expectedAmounts: number[] = [];

      const orderLookup = await supabaseAdmin
        .from('orders')
        .select('id, total_amount')
        .eq('payment_reference', reference)
        .maybeSingle();
      if (!orderLookup.error && orderLookup.data?.total_amount != null) {
        expectedAmounts.push(Number(orderLookup.data.total_amount));
      }

      const pendingPurchase = await supabaseAdmin
        .from('mlm_membership_purchases')
        .select('id, package_code')
        .eq('paystack_reference', reference)
        .maybeSingle();
      if (!pendingPurchase.error && pendingPurchase.data?.package_code) {
        const pkg = await supabaseAdmin
          .from('mlm_packages')
          .select('price')
          .eq('package_code', pendingPurchase.data.package_code)
          .maybeSingle();
        if (!pkg.error && pkg.data?.price != null) {
          expectedAmounts.push(Number(pkg.data.price));
        }
      }

      const tolerance = 1; // allow ₦1 of rounding slack
      const underpaid = expectedAmounts.some(
        (expected) => expected > 0 && paidAmount + tolerance < expected
      );

      if (currency !== 'NGN' || underpaid) {
        console.error('Payment amount mismatch', { reference, paidAmount, expectedAmounts, currency });

        await supabaseAdmin
          .from('payments')
          .update({ status: 'amount_mismatch' })
          .eq('paystack_reference', reference);

        return new Response(
          JSON.stringify({ status: false, message: 'Payment amount does not match the amount owed. Please contact support.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      // ---------------------------------------------------------------------


      // ---- 5K Daily Promo savings plans -----------------------------------
      // These used to be created/credited by the browser after redirect, with
      // the target price and installment taken from client metadata. Both are
      // now derived server-side from the estate record and the amount Paystack
      // confirms was paid.
      const fields: Record<string, string> = {};
      (data.data?.metadata?.custom_fields || []).forEach((f: any) => {
        if (f?.variable_name) fields[f.variable_name] = f.value;
      });

      if (String(reference).startsWith('STARTPLAN_') && fields.payment_type === 'promo_start_plan') {
        const estateId = fields.estate_id;
        const frequency = ['daily', 'weekly', 'monthly'].includes(fields.frequency) ? fields.frequency : 'daily';

        const { data: existingPlan } = await supabaseAdmin
          .from('payments')
          .select('id')
          .eq('user_id', authenticatedUserId)
          .eq('promo_estate_slug', estateId)
          .eq('plan_type', frequency)
          .maybeSingle();

        const { data: estateRow } = estateId
          ? await supabaseAdmin.from('estate').select('name, promo_price, actual_price').eq('id', estateId).maybeSingle()
          : { data: null };

        const targetPrice = Number(estateRow?.promo_price ?? estateRow?.actual_price ?? 0);

        if (!existingPlan && targetPrice > 0) {
          const installmentAmount = paidAmount;
          const { data: createdPlan } = await supabaseAdmin
            .from('payments')
            .insert({
              user_id: authenticatedUserId,
              property_id: estateId,
              plan_type: frequency,
              months: 0,
              principal_amount: targetPrice,
              interest_percent: 0,
              interest_amount: 0,
              total_amount: targetPrice,
              amount_paid: paidAmount,
              balance: Math.max(0, targetPrice - paidAmount),
              status: 'pending',
              promo_estate_slug: estateId,
              promo_installment_amount: installmentAmount,
            })
            .select()
            .single();

          if (createdPlan) {
            await supabaseAdmin.from('payment_requests').insert({
              user_id: authenticatedUserId,
              type: '5k_daily_promo',
              amount: paidAmount,
              reference,
              related_payment_id: createdPlan.id,
              description: `5K Daily Promo — ${estateRow?.name ?? estateId} (${frequency}) — first installment`,
              status: 'pending',
            });
          }
        }
      }

      if (String(reference).startsWith('PROMO_')) {
        const planId = String(reference).split('_')[1];
        const { data: plan } = planId
          ? await supabaseAdmin
              .from('payments')
              .select('id, user_id, total_amount, amount_paid')
              .eq('id', planId)
              .maybeSingle()
          : { data: null };

        // Only the plan owner may credit their own plan, and only once per
        // reference (guarded by the transaction row below).
        if (plan && plan.user_id === authenticatedUserId) {
          const { data: alreadyCredited } = await supabaseAdmin
            .from('payment_transactions')
            .select('id')
            .eq('payment_id', plan.id)
            .eq('notes', `5K Daily Promo installment (${reference})`)
            .maybeSingle();

          if (!alreadyCredited) {
            const newAmountPaid = Number(plan.amount_paid ?? 0) + paidAmount;
            const newBalance = Math.max(0, Number(plan.total_amount ?? 0) - newAmountPaid);
            await supabaseAdmin
              .from('payments')
              .update({
                amount_paid: newAmountPaid,
                balance: newBalance,
                status: newBalance <= 0 ? 'completed' : 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('id', plan.id);

            await supabaseAdmin.from('payment_transactions').insert({
              payment_id: plan.id,
              user_id: plan.user_id,
              amount: paidAmount,
              channel: 'paystack',
              notes: `5K Daily Promo installment (${reference})`,
            });
          }
        }
      }
      // ---------------------------------------------------------------------

      // Update orders table if this payment belongs to an order
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
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
        // Commissions must be based on the amount Paystack confirms was paid,
        // never the client-supplied amount recorded at initialization time.
        const purchaseAmount = paidAmount > 0 ? paidAmount : Number(purchase.amount ?? 0);

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
