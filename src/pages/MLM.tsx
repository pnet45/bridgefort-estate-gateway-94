import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clipboard, Share2, Users } from 'lucide-react';
import { initializePayment } from '@/integrations/paystack/client';
import { mlmPackages, type MlmPackage } from '@/data/mlmPackages';

const packageRank: Record<string, number> = {
  associate: 1,
  gold: 2,
  classic_gold: 3,
};

const MLM = () => {
  const { user, profile, loading } = useAuth();
  const [shareLink, setShareLink] = useState('');
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [pboCount, setPboCount] = useState<number | null>(null);
  const [downlineMembers, setDownlineMembers] = useState<Array<any>>([]);
  const [copyStatus, setCopyStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'pending' | 'error'>('idle');
  const [purchaseError, setPurchaseError] = useState('');
  const [commissionTotals, setCommissionTotals] = useState({ available: 0, locked: 0 });
  const [selectedPackage, setSelectedPackage] = useState<MlmPackage>(mlmPackages[0]);

  const currentPackageCode = profile?.current_package || 'associate';
  const currentPackage = mlmPackages.find((pkg) => pkg.package_code === currentPackageCode) ?? mlmPackages[0];
  const currentPackageLabel = currentPackage.package_name;
  const currentPackagePrice = currentPackage.price;
  const walletBalance = Number(profile?.wallet_balance ?? 0);

  const isEligibleForPurchase = user && packageRank[selectedPackage.package_code] > packageRank[currentPackageCode];
  const amountDue = Math.max(0, selectedPackage.price - currentPackagePrice);

  useEffect(() => {
    const code = profile?.pbo_referral_code || (user ? user.id.slice(0, 8).toUpperCase() : '');
    if (user) {
      setShareLink(`${window.location.origin}/auth?ref=${code}`);
    }
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        const { count: totalCount, error: totalError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        if (!totalError && typeof totalCount === 'number') {
          setMemberCount(totalCount);
        }

        const { count: pboCountResult, error: pboError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('is_pbo', true);

        if (!pboError && typeof pboCountResult === 'number') {
          setPboCount(pboCountResult);
        }

        const { data: commissions = [], error: commissionError } = await supabase
          .from('mlm_commissions')
          .select('commission_amount, status')
          .eq('beneficiary_id', user.id);

        if (!commissionError) {
          const totals = commissions.reduce(
            (acc: { available: number; locked: number }, row: any) => {
              const amount = Number(row.commission_amount ?? 0);
              if (row.status === 'available') acc.available += amount;
              if (row.status === 'locked') acc.locked += amount;
              return acc;
            },
            { available: 0, locked: 0 }
          );
          setCommissionTotals(totals);
        }
      } catch (error) {
        console.error('Error loading MLM stats:', error);
        setErrorMessage('Unable to load MLM statistics right now.');
      }
    };

    loadStats();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadDownline = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, created_at, is_pbo, pbo_referral_code')
          .eq('referred_by_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setDownlineMembers(data || []);
      } catch (error) {
        console.error('Error loading MLM downline:', error);
      }
    };

    loadDownline();
  }, [user]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopyStatus('Referral link copied!');
      window.setTimeout(() => setCopyStatus(''), 2500);
    } catch (error) {
      console.error('Copy failed', error);
      setCopyStatus('Unable to copy link.');
    }
  };

  const handlePackageSelection = (pkg: MlmPackage) => {
    setSelectedPackage(pkg);
    setPurchaseError('');
  };

  const handleMembershipPurchase = async () => {
    if (!user) {
      setPurchaseError('Please sign in to purchase a package.');
      return;
    }

    if (!isEligibleForPurchase) {
      setPurchaseError('Please select a higher package than your current tier.');
      return;
    }

    setPurchaseStatus('pending');
    setPurchaseError('');

    try {
      const fullName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim();
      const paymentData = await initializePayment({
        email: user.email ?? '',
        amount: amountDue,
        currency: 'NGN',
        reference: `mlm-${user.id}-${Date.now()}`,
        callback_url: `${window.location.origin}/payment-success`,
        metadata: {
          customer_name: fullName || 'Bridgefort Member',
          custom_fields: [
            {
              display_name: 'Purchase type',
              variable_name: 'purchase_type',
              value: 'membership',
            },
            {
              display_name: 'Package code',
              variable_name: 'package_code',
              value: selectedPackage.package_code,
            },
            {
              display_name: 'Current package',
              variable_name: 'current_package',
              value: currentPackageCode,
            },
          ],
        },
      });

      if (!paymentData?.data?.authorization_url) {
        throw new Error('Unable to initialize Paystack payment.');
      }

      setPurchaseStatus('idle');
      window.location.href = paymentData.data.authorization_url;
    } catch (error: any) {
      console.error('Membership payment initialization failed:', error);
      setPurchaseStatus('error');
      setPurchaseError(error?.message || 'Failed to initialize membership purchase.');
    }
  };

  const purchaseButtonText = useMemo(() => {
    if (!user) return 'Sign in to purchase';
    if (!isEligibleForPurchase) return 'Select a higher package';
    if (purchaseStatus === 'pending') return 'Redirecting to Paystack...';
    return amountDue > 0 ? `Pay ₦${amountDue.toLocaleString()} via Paystack` : 'Confirm purchase';
  }, [amountDue, isEligibleForPurchase, purchaseStatus, user]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-28 pb-12 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-estate-blue" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] items-start">
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-estate-blue">MLM Dashboard</h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  Manage your Bridgefort MLM membership packages, referral network, wallet, and upgrade path.
                </p>
              </div>

              {user ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 mb-8">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Current MLM rank</p>
                      <p className="mt-2 text-2xl font-semibold text-estate-blue">{currentPackageLabel}</p>
                      <p className="mt-2 text-slate-600">Current package value: ₦{currentPackagePrice.toLocaleString()}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Wallet balance</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">₦{walletBalance.toLocaleString()}</p>
                      <p className="mt-2 text-slate-600">Available commission balance</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 mb-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-estate-blue">Membership packages</h2>
                        <p className="mt-2 text-slate-600">Upgrade your tier to unlock higher earning potential.</p>
                      </div>
                      <div className="text-sm text-slate-600">
                        Current package: <span className="font-semibold text-slate-900">{currentPackageLabel}</span>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                      {mlmPackages.map((pkg) => {
                        const isCurrentOrLower = packageRank[pkg.package_code] <= packageRank[currentPackageCode];
                        const upgradeAmount = Math.max(0, pkg.price - currentPackagePrice);
                        return (
                          <div
                            key={pkg.package_code}
                            className={`rounded-3xl border p-6 shadow-sm ${pkg.package_code === currentPackageCode ? 'border-estate-blue bg-estate-blue/5' : 'border-slate-200 bg-white'}`}
                          >
                            <div className="mb-4">
                              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{pkg.package_name}</p>
                              <p className="mt-3 text-3xl font-bold text-slate-900">₦{pkg.price.toLocaleString()}</p>
                            </div>
                            <p className="text-slate-600 mb-4">{pkg.description}</p>
                            <div className="space-y-2 text-sm text-slate-700 mb-4">
                              <p>Direct commission: {pkg.direct_commission_pct}%</p>
                              <p>2nd-level commission: {pkg.indirect_commission_pct}%</p>
                              <p>{pkg.withdrawable ? 'Withdrawable commissions' : 'Locked until upgrade'}</p>
                            </div>
                            <Button
                              type="button"
                              variant={pkg.package_code === selectedPackage.package_code ? 'secondary' : 'outline'}
                              className="w-full"
                              onClick={() => handlePackageSelection(pkg)}
                            >
                              {pkg.package_code === selectedPackage.package_code ? 'Selected' : 'Select'}
                            </Button>
                            {pkg.package_code !== currentPackageCode && packageRank[pkg.package_code] > packageRank[currentPackageCode] && (
                              <p className="mt-3 text-xs text-slate-500">Upgrade cost: ₦{upgradeAmount.toLocaleString()}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Purchase summary</p>
                      <div className="mt-3 grid gap-2 text-slate-700">
                        <div className="flex items-center justify-between">
                          <span>Selected package</span>
                          <span className="font-semibold">{selectedPackage.package_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Current package</span>
                          <span className="font-semibold">{currentPackageLabel}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Amount due</span>
                          <span className="font-semibold">₦{amountDue.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          type="button"
                          onClick={handleMembershipPurchase}
                          disabled={!isEligibleForPurchase || purchaseStatus === 'pending'}
                          className="w-full"
                        >
                          {purchaseButtonText}
                        </Button>
                        {purchaseError && <p className="mt-3 text-sm text-red-600">{purchaseError}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <h2 className="text-xl font-semibold text-estate-blue">Commission wallet</h2>
                      <div className="mt-4 grid gap-3 text-slate-700">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-sm text-slate-500">Available for use</p>
                          <p className="mt-2 text-2xl font-semibold text-slate-900">₦{commissionTotals.available.toLocaleString()}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-sm text-slate-500">Locked until upgrade</p>
                          <p className="mt-2 text-2xl font-semibold text-slate-900">₦{commissionTotals.locked.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <h2 className="text-xl font-semibold text-estate-blue">Direct referrals</h2>
                      <p className="mt-2 text-slate-600">You currently have {downlineMembers.length} direct referral{downlineMembers.length === 1 ? '' : 's'}.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
                  <p className="text-gray-700 mb-6">
                    Sign in or register to access your MLM referral dashboard. This page will still use the same shared
                    Supabase database as the rest of the app.
                  </p>
                  <Link to="/bridgefort-realtors-login">
                    <Button className="inline-flex items-center gap-2">Go to Bridgefort Realtors Login</Button>
                  </Link>
                </div>
              )}

              {errorMessage && (
                <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {errorMessage}
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-estate-blue">Fast start</h2>
                <p className="mt-3 text-slate-600">
                  Use your referral code on the sign-up page to track new partners. The page reads the same database
                  connection used across the site, so your affiliation stays synced automatically.
                </p>
                <Badge className="mt-4 bg-estate-blue/10 text-estate-blue">Shared database: Supabase</Badge>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-estate-blue">Next steps</h2>
                <ol className="mt-3 space-y-3 text-slate-600 list-decimal list-inside">
                  <li>Complete your profile under Profile.</li>
                  <li>Share your referral link with new members.</li>
                  <li>Ask new signups to enter your code on registration.</li>
                  <li>View shared metrics from the same Supabase DB.</li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MLM;
