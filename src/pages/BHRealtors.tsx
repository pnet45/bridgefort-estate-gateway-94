import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Loader2, Clipboard, Share2, Users, Trophy, Gift, Handshake, Target,
  Sparkles, Star, TrendingUp, Award, X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { bhRealtorsPackages, type BhRealtorsPackage } from '@/data/bhRealtorsPackages';
import RealtorsRegistrationForm from '@/components/bhRealtors/RealtorsRegistrationForm';

const packageRank: Record<string, number> = {
  associate: 1,
  gold: 2,
  classic_gold: 3,
};

const BHRealtors = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [shareLink, setShareLink] = useState('');
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [pboCount, setPboCount] = useState<number | null>(null);
  const [downlineMembers, setDownlineMembers] = useState<Array<any>>([]);
  const [copyStatus, setCopyStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [commissionTotals, setCommissionTotals] = useState({ available: 0, locked: 0 });
  const [freeUpgradeModalOpen, setFreeUpgradeModalOpen] = useState(false);
  const [freeUpgradeMessage, setFreeUpgradeMessage] = useState('');
  const [registrationFormOpen, setRegistrationFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<BhRealtorsPackage>(bhRealtorsPackages[0]);

  const currentPackageCode = profile?.current_package || 'associate';
  const currentPackage = bhRealtorsPackages.find((pkg) => pkg.package_code === currentPackageCode) ?? bhRealtorsPackages[0];
  const currentPackageLabel = currentPackage.package_name;
  const currentPackagePrice = currentPackage.price;
  const walletBalance = Number(profile?.wallet_balance ?? 0);

  const isEligibleForPurchase = user && packageRank[selectedPackage.package_code] > packageRank[currentPackageCode];
  // Registration is now free for every package — the original price is kept
  // around only to render the struck-through "was ₦X" reference.
  const amountDue = 0;

  useEffect(() => {
    if (!user) return;
    const code = profile?.pbo_referral_code;
    const link = code
      ? `${window.location.origin}/bridgefort-realtors-login?ref=${code}`
      : `${window.location.origin}/bridgefort-realtors-login`;
    setShareLink(link);
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
        console.error('Error loading BHRealtors stats:', error);
        setErrorMessage('Unable to load BHRealtors statistics right now.');
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
        console.error('Error loading BHRealtors downline:', error);
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

  const handlePackageSelection = (pkg: BhRealtorsPackage) => {
    setSelectedPackage(pkg);
    setPurchaseError('');
  };

  const handleRegisterClick = (pkg: BhRealtorsPackage) => {
    if (!user) {
      setPurchaseError('Please sign in to register for a package.');
      return;
    }

    if (packageRank[pkg.package_code] <= packageRank[currentPackageCode]) {
      setPurchaseError('Please select a higher package than your current tier.');
      return;
    }

    setSelectedPackage(pkg);
    setPurchaseError('');
    setRegistrationFormOpen(true);
  };

  const handleRegistrationComplete = () => {
    setRegistrationFormOpen(false);
    setFreeUpgradeMessage(
      `Your BHRealtors registration on the ${selectedPackage.package_name} package is complete — at no cost to you!`
    );
    setFreeUpgradeModalOpen(true);
    window.setTimeout(() => setFreeUpgradeModalOpen(false), 8000);
  };

  const purchaseButtonText = useMemo(() => {
    if (!user) return 'Sign in to register';
    if (!isEligibleForPurchase) return 'Select a higher package';
    return `Submit and Complete Registration with \u20a60`;
  }, [isEligibleForPurchase, user]);

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

  const rewardCategories = [
    { icon: Trophy, title: 'Top Sales Achiever', desc: 'Monthly reward for the highest sales performer.' },
    { icon: TrendingUp, title: 'Most Promising Performer', desc: 'Recognizing rising stars with exceptional potential.' },
    { icon: Handshake, title: 'Team Spirit Award', desc: 'Reward for outstanding teamwork and collaboration.' },
    { icon: Target, title: 'Consistency Champion', desc: 'For those who show consistency and dedication.' },
    { icon: Gift, title: 'Special Bonus Rewards', desc: 'Surprise rewards for exceptional impact and milestones.' },
    { icon: Award, title: 'Quarterly Excellence Awards', desc: 'Recognition and rewards for consistent excellence every quarter.' },
  ];

  const rewardFeatures = [
    { icon: Gift, label: 'Exciting Prizes & Gifts' },
    { icon: Trophy, label: 'Recognition & Appreciation' },
    { icon: TrendingUp, label: 'Career Growth Opportunities' },
    { icon: Star, label: 'Exclusive Access & Incentives' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero — Bridgefort Homes PBOs & Realtors Performance Reward Scheme */}
      <section className="relative pt-24 lg:pt-28 pb-14 overflow-hidden bg-gradient-to-br from-[#2b0a52] via-[#3a1070] to-[#1a0638] text-white">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: "url('/lovable-uploads/agrovest-hero-1.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0638] via-[#1a0638]/60 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-yellow-400/40 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-yellow-300 mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Bridgefort Homes Development Ltd
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3">
            PBOs &amp; Realtors <span className="text-yellow-400">Performance Reward Scheme</span>
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-yellow-200 mb-4">
            Sell More. Earn More. Get Celebrated.
          </p>
          <p className="max-w-2xl mx-auto text-purple-100 mb-8">
            At Bridgefort Homes Development Ltd, we believe in recognizing excellence, driving
            performance, and celebrating our top achievers. This scheme is designed to reward
            your hard work, boost your income, and inspire greater success.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {rewardFeatures.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-sm font-medium"
              >
                <f.icon className="h-4 w-4 text-yellow-400" /> {f.label}
              </span>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
            {rewardCategories.map((c) => (
              <div key={c.title} className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-5">
                <div className="h-10 w-10 rounded-full bg-yellow-400/20 flex items-center justify-center mb-3">
                  <c.icon className="h-5 w-5 text-yellow-400" />
                </div>
                <p className="font-semibold text-sm mb-1">{c.title}</p>
                <p className="text-xs text-purple-100">{c.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 italic text-yellow-200 text-lg">
            "We don't just reward sales — we celebrate commitment."
          </p>
        </div>
      </section>

      <main className="flex-grow pb-12">
        <div className="container mx-auto px-4 pt-8">
          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] items-start">
            <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-lg ring-1 ring-white/5">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-estate-blue">BHRealtors Dashboard</h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  Manage your Bridgefort Homes Realtors Center membership packages, referral network, wallet, and upgrade path.
                </p>
                <div className="mt-4 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">🔥 5K Daily Promo — Become a Landlord</p>
                    <p className="text-xs text-slate-700">Subscribe daily, weekly, or monthly for any of 8 flagship estates. We track your payments and timeline to completion.</p>
                  </div>
                  <Link to="/bh-realtors/subscription">
                    <Button className="bg-indigo-700 hover:bg-indigo-800 text-white whitespace-nowrap">Start Subscription</Button>
                  </Link>
                </div>
              </div>

              {user ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 mb-8">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Current BHRealtors rank</p>
                      <p className="mt-2 text-2xl font-semibold text-estate-blue">{currentPackageLabel}</p>
                      <p className="mt-2 text-slate-600">Current package value: ₦{currentPackagePrice.toLocaleString()}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Wallet balance</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">₦{walletBalance.toLocaleString()}</p>
                      <p className="mt-2 text-slate-600">Available commission balance</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-6 mb-8">
                    <div className="flex flex-col gap-3">
                      <div>
                        <h2 className="text-xl font-semibold text-estate-blue">Your referral link</h2>
                        <p className="mt-2 text-slate-600">
                          Share this link to invite new Bridgefort Realtors. New signups who use it will be attributed to your network.
                        </p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-[1fr_auto] items-center">
                        <Input readOnly value={shareLink} className="min-w-0" />
                        <Button type="button" onClick={handleCopyLink} className="whitespace-nowrap">
                          {copyStatus || 'Copy link'}
                        </Button>
                      </div>
                      {!profile?.pbo_referral_code && (
                        <p className="text-sm text-amber-700">
                          Your referral code is not yet set. Register as a PBO to receive a personal referral link.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 mb-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-estate-blue">Membership packages</h2>
                        <p className="mt-2 text-slate-600">
                          Registration is <span className="font-semibold text-green-700">FREE</span> on every package for a limited time — upgrade your tier to unlock higher earning potential.
                        </p>
                      </div>
                      <div className="text-sm text-slate-600">
                        Current package: <span className="font-semibold text-slate-900">{currentPackageLabel}</span>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                      {bhRealtorsPackages.map((pkg) => {
                        const isHigherTier = packageRank[pkg.package_code] > packageRank[currentPackageCode];
                        return (
                          <div
                            key={pkg.package_code}
                            className={`relative rounded-3xl border p-6 shadow-lg backdrop-blur-sm ${pkg.package_code === currentPackageCode ? 'ring-2 ring-indigo-400 bg-gradient-to-br from-indigo-50/30 to-white/10 border-transparent' : 'border-white/10 bg-white/5'}`}
                          >
                            <Badge className="absolute -top-3 right-4 bg-green-600 hover:bg-green-600 text-white">FREE</Badge>
                            <div className="mb-4">
                              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{pkg.package_name}</p>
                              <p className="mt-3 text-lg font-medium text-slate-400 line-through">₦{pkg.price.toLocaleString()}</p>
                              <p className="text-3xl font-bold text-green-700">₦0.00</p>
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
                            {pkg.package_code === currentPackageCode ? (
                              <p className="mt-3 text-xs text-slate-500">This is your current package.</p>
                            ) : isHigherTier ? (
                              <Button
                                type="button"
                                className="w-full mt-2 bg-green-700 hover:bg-green-800"
                                onClick={() => handleRegisterClick(pkg)}
                              >
                                Register Free
                              </Button>
                            ) : (
                              <p className="mt-3 text-xs text-slate-500">Lower tier than your current package.</p>
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
                          <span className="font-semibold">
                            <span className="text-slate-400 line-through mr-2">₦{selectedPackage.price.toLocaleString()}</span>
                            <span className="text-green-700">₦{amountDue.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          type="button"
                          onClick={() => handleRegisterClick(selectedPackage)}
                          disabled={!isEligibleForPurchase}
                          className="w-full bg-green-700 hover:bg-green-800"
                        >
                          {purchaseButtonText}
                        </Button>
                        {purchaseError && <p className="mt-3 text-sm text-red-600">{purchaseError}</p>}
                      </div>
                    </div>

                  <RealtorsRegistrationForm
                    open={registrationFormOpen}
                    onClose={() => setRegistrationFormOpen(false)}
                    selectedPackage={selectedPackage}
                    onComplete={handleRegistrationComplete}
                  />

                  <Dialog open={freeUpgradeModalOpen} onOpenChange={setFreeUpgradeModalOpen}>
                    <DialogContent className="sm:max-w-lg relative">
                      <button
                        onClick={() => setFreeUpgradeModalOpen(false)}
                        aria-label="Close"
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <DialogHeader>
                        <DialogTitle>Upgrade complete</DialogTitle>
                        <DialogDescription>{freeUpgradeMessage}</DialogDescription>
                      </DialogHeader>
                      <div className="mt-6 text-center">
                        <Button onClick={() => setFreeUpgradeModalOpen(false)} className="w-full">
                          Continue
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                    Sign in or register to access your BHRealtors referral dashboard. This page will still use the same shared
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

export default BHRealtors;
