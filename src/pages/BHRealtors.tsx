import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, Wallet, RefreshCw, ArrowUpRight, Loader2, CheckCircle2, Network,
  Trophy, TrendingUp, Building2, Sprout, Target, Star, Crown,
  BriefcaseBusiness, Copy, Check, ShoppingBag, LockKeyhole, ChevronRight,
} from 'lucide-react';
import { bhRealtorsPackages, type BhRealtorsPackage } from '@/data/bhRealtorsPackages';
import RealtorsRegistrationForm from '@/components/bhRealtors/RealtorsRegistrationForm';
import ReferralLeaderboard from '@/components/bhRealtors/ReferralLeaderboard';
import DownlineTree from '@/components/bhRealtors/DownlineTree';
import CommissionHistory, { type CommissionRow } from '@/components/bhRealtors/CommissionHistory';
import ReferralShareCard from '@/components/bhRealtors/ReferralShareCard';

const rank: Record<string, number> = { associate: 1, gold: 2, classic_gold: 3 };
const naira = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
const glass = 'border border-white/15 bg-white/65 dark:bg-slate-950/70 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/30';
const muted = 'text-slate-600 dark:text-slate-200';

const packageVisuals: Record<string, { image: string; accent: string; soft: string; icon: React.ReactNode; label: string }> = {
  associate: { image: '/images/LoginImageLANDFORSALE.png', accent: 'from-sky-600 to-estate-blue', soft: 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200', icon: <BriefcaseBusiness className="h-5 w-5" />, label: 'STARTER LEVEL' },
  gold: { image: '/images/Luxury Homes.jpeg', accent: 'from-amber-500 to-yellow-700', soft: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200', icon: <Star className="h-5 w-5" />, label: 'GROWTH LEVEL' },
  classic_gold: { image: '/images/LoginImageLANDFORSALE.png', accent: 'from-violet-600 to-purple-900', soft: 'bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200', icon: <Crown className="h-5 w-5" />, label: 'PREMIUM LEVEL' },
};

interface RealtorSale {
  sale_id: string;
  client_first_name: string | null;
  plot_id: string | null;
  plots_bought: number;
  estate_name: string | null;
  payment_status: string | null;
  amount_paid: number;
  balance: number;
  sale_date: string | null;
}

type DashboardData = {
  profile?: {
    is_pbo?: boolean;
    is_active?: boolean;
    package?: string;
    rank?: string;
    referral_code?: string;
    wallet_balance?: number;
  };
  direct_referrals?: number;
  active_direct_referrals?: number;
  total_commissions_earned?: number;
  locked_commissions?: number;
  pending_withdrawal_total?: number;
  available_balance?: number;
  can_withdraw?: boolean;
  commissions?: CommissionRow[];
  withdrawals?: Array<{ id: string; amount: number; status: string; created_at: string }>;
};

const BHRealtors: React.FC = () => {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [packages, setPackages] = useState<BhRealtorsPackage[]>(bhRealtorsPackages);
  const [selectedPackage, setSelectedPackage] = useState<BhRealtorsPackage>(bhRealtorsPackages[0]);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [downlineCount, setDownlineCount] = useState(0);
  const [activeDownlineCount, setActiveDownlineCount] = useState(0);
  const [locked, setLocked] = useState(0);
  const [earned, setEarned] = useState(0);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(0);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState<DashboardData['withdrawals']>([]);
  const [commissionRows, setCommissionRows] = useState<CommissionRow[]>([]);
  const [sales, setSales] = useState<RealtorSale[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dashboardError, setDashboardError] = useState(false);

  const currentCode = profile?.current_package || 'associate';
  const currentRank = rank[currentCode] || 1;
  const isPbo = Boolean(profile?.is_pbo);
  const isRealtor = Boolean(profile?.is_pbo && profile?.is_active);
  const referralCode = profile?.pbo_referral_code || '';
  const referralLink = typeof window !== 'undefined' && referralCode ? `${window.location.origin}/auth?ref=${encodeURIComponent(referralCode)}` : '';

  const load = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    setDashboardError(false);

    const [pkgResult, dashboardResult, salesResult] = await Promise.all([
      supabase.from('mlm_packages').select('package_code, package_name, price, direct_commission_pct, indirect_commission_pct, withdrawable, description, sales_commission_pct, sales_commission_locked, first_level_sales_commission_pct').order('price'),
      supabase.rpc('get_my_bhrealtor_dashboard'),
      supabase.rpc('get_my_bhrealtor_sales' as never) as unknown as Promise<{ data: RealtorSale[] | null; error: { message: string } | null }>,
    ]);

    if (pkgResult.data?.length) {
      const dbPackages = pkgResult.data as BhRealtorsPackage[];
      setPackages(dbPackages);
      setSelectedPackage((prev) => dbPackages.find((item) => item.package_code === prev.package_code) || dbPackages[0]);
    } else if (pkgResult.error) {
      console.warn('BHRealtors package read failed:', pkgResult.error.message);
    }

    if (dashboardResult.error) {
      console.error('BHRealtors dashboard error:', dashboardResult.error);
      setDashboardError(true);
      toast({ title: 'Unable to load your BHRealtors wallet', description: 'Please refresh and try again.', variant: 'destructive' });
    } else {
      const dashboard = (dashboardResult.data || {}) as DashboardData;
      setDownlineCount(Number(dashboard.direct_referrals || 0));
      setActiveDownlineCount(Number(dashboard.active_direct_referrals || 0));
      setLocked(Number(dashboard.locked_commissions || 0));
      setEarned(Number(dashboard.total_commissions_earned || 0));
      setPendingWithdrawal(Number(dashboard.pending_withdrawal_total || 0));
      setCanWithdraw(Boolean(dashboard.can_withdraw));
      setAvailableBalance(Number(dashboard.available_balance ?? dashboard.profile?.wallet_balance ?? 0));
      setWithdrawals(Array.isArray(dashboard.withdrawals) ? dashboard.withdrawals : []);
      setCommissionRows(Array.isArray(dashboard.commissions) ? dashboard.commissions : []);
    }

    if (salesResult.error) {
      console.warn('BHRealtors sales read failed:', salesResult.error.message);
      setSales([]);
    } else {
      setSales(Array.isArray(salesResult.data) ? salesResult.data : []);
    }

    setBusy(false);
  };

  useEffect(() => { if (user) void load(); }, [user]);

  const currentPackage = useMemo(
    () => packages.find((item) => item.package_code === currentCode) || packages.find((item) => item.package_code === 'associate') || packages[0],
    [packages, currentCode]
  );

  const copyReferralCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      toast({ title: 'Referral code copied', description: 'Share it with clients so their profile can be linked to you.' });
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy the code manually.', variant: 'destructive' });
    }
  };

  const openRegistration = (pkg: BhRealtorsPackage) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in before joining BHRealtors.', variant: 'destructive' });
      return;
    }
    if (isPbo && rank[pkg.package_code] <= currentRank) return;
    setSelectedPackage(pkg);
    setRegistrationOpen(true);
  };

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950"><Loader2 className="h-8 w-8 animate-spin text-estate-blue" /></div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-950">
        <Navbar />
        <main className="container-custom flex-1 pt-32">
          <h1 className="text-3xl font-bold text-estate-blue dark:text-white">BHRealtors</h1>
          <p className={`mt-2 ${muted}`}>Sign in to join and manage your Realtor network.</p>
          <Link to="/bridgefort-realtors-login"><Button className="mt-5">Realtors Login</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 transition-colors duration-300 dark:bg-slate-950">
      <Navbar />
      <main className="pb-16 pt-24">
        <div className="container-custom space-y-8">
          <section className="relative isolate min-h-[440px] overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl">
            <img src="/images/LoginImageLANDFORSALE.png" alt="Bridgefort Homes land investment" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/60" />
            <div className="absolute inset-0 bg-gradient-to-br from-estate-blue/90 via-slate-950/45 to-black/80" />
            <div className="relative z-10 flex min-h-[440px] flex-col justify-between p-6 md:p-12">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge className="border border-white/20 bg-white/10 text-white backdrop-blur-xl">BHREALTORS • NETWORK • PROPERTY</Badge>
                <Button variant="outline" onClick={() => void load()} disabled={busy} className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh
                </Button>
              </div>
              <div className="max-w-4xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/75">Build income. Build ownership. Build a network.</p>
                <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">Turn relationships into <span className="text-cyan-200">opportunity</span>.</h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-100 md:text-lg">BHRealtors gives you more than a referral link. Build a genuine sales network, introduce people to quality real estate opportunities, earn according to your package, and grow through property.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href="#packages"><Button className="bg-white text-slate-950 hover:bg-slate-100">Explore Packages</Button></a>
                  {isPbo && <Link to="/bh-realtors/withdraw"><Button className="border border-white/30 bg-white/10 text-white hover:bg-white/20" variant="outline"><Wallet className="mr-2 h-4 w-4" /> Withdraw</Button></Link>}
                </div>
              </div>
            </div>
          </section>

          {dashboardError && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Your dashboard data could not be refreshed. Your membership packages are still available below. Use <strong>Refresh</strong> to try again.
            </section>
          )}

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {[
              [Users, 'Direct referrals', downlineCount],
              [CheckCircle2, 'Active direct', activeDownlineCount],
              [TrendingUp, 'Commission earned', naira(earned)],
              [LockKeyhole, 'Locked commission', naira(locked)],
              [Wallet, 'Available balance', naira(availableBalance)],
              [Wallet, 'Pending withdrawal', naira(pendingWithdrawal)],
            ].map(([Icon, label, value]) => (
              <div key={label} className={`${glass} rounded-2xl p-4`}>
                <Icon className="h-5 w-5 text-estate-purple" />
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">{label}</p>
                <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{value}</p>
              </div>
            ))}
          </section>

          {isRealtor && (
            <section className="grid gap-5 lg:grid-cols-3">
              <div className={`${glass} rounded-3xl p-6 lg:col-span-2`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300">Current package / rank</p>
                    <h2 className="mt-1 text-3xl font-black text-estate-blue dark:text-white">{currentPackage?.package_name || currentCode}</h2>
                    <p className={`mt-2 text-sm ${muted}`}>Estate-land sales commission: {currentPackage?.sales_commission_pct ?? (currentCode === 'associate' ? 5 : currentCode === 'gold' ? 10 : 15)}%. {currentRank === 1 ? 'Commission is locked until you upgrade.' : 'Eligible commissions are withdrawable.'}</p>
                  </div>
                  <Badge className={currentRank >= 2 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200'}>{currentRank >= 2 ? 'Withdrawable' : 'Locked'}</Badge>
                </div>
              </div>
              <Link to="/bh-realtors/withdraw" className="group rounded-3xl border border-white/15 bg-estate-blue p-6 text-white shadow-2xl transition hover:-translate-y-1 hover:shadow-estate-blue/20">
                <div className="flex items-start justify-between"><Wallet className="h-7 w-7" /><ArrowUpRight className="h-5 w-5 opacity-70 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
                <p className="mt-5 text-sm text-slate-200">Available commission</p>
                <p className="mt-1 text-3xl font-black">{naira(availableBalance)}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">Withdraw <ChevronRight className="h-4 w-4" /></span>
                {pendingWithdrawal > 0 && <p className="mt-2 text-xs text-white/70">{naira(pendingWithdrawal)} pending review</p>}
              </Link>
            </section>
          )}

          {!isRealtor && isPbo && (
            <section className={`${glass} rounded-3xl border-amber-200/60 p-6`}>
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-amber-600" />
                <div><h2 className="font-bold text-slate-950 dark:text-white">BHRealtors membership is not active yet</h2><p className={`mt-1 text-sm ${muted}`}>Your Realtor account is currently inactive. Once activation is completed, your network dashboard and withdrawal tools will become available.</p></div>
              </div>
            </section>
          )}

          <section className={`${glass} relative overflow-hidden rounded-3xl p-7 md:p-9`}>
            <div className="absolute right-0 top-0 h-48 w-48 overflow-hidden rounded-bl-[5rem] opacity-90"><img src="/images/Luxury Homes.jpeg" alt="Luxury real estate" className="h-full w-full object-cover" /></div>
            <div className="relative max-w-3xl pr-4 md:pr-40">
              <div className="flex items-center gap-3"><Building2 className="h-6 w-6 text-estate-purple" /><h2 className="text-2xl font-black text-estate-blue dark:text-white">Sell property. Build trust. Create wealth.</h2></div>
              <p className={`mt-4 leading-7 ${muted}`}>Real estate is a long-term wealth strategy. With BHRealtors, your work is about helping people secure land and property while building a professional sales network.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5"><Target className="h-5 w-5 text-estate-purple" /><p className={`mt-2 text-sm ${muted}`}>Find genuine buyers</p></div>
                <div className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5"><Users className="h-5 w-5 text-estate-purple" /><p className={`mt-2 text-sm ${muted}`}>Grow your network</p></div>
                <div className="rounded-2xl bg-slate-900/5 p-4 dark:bg-white/5"><TrendingUp className="h-5 w-5 text-estate-purple" /><p className={`mt-2 text-sm ${muted}`}>Grow your income</p></div>
              </div>
            </div>
          </section>

          <section id="packages">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-estate-purple">Membership & growth</p>
              <h2 className="mt-1 text-3xl font-black text-estate-blue dark:text-white">Choose your level. Build your future.</h2>
              <p className={`mt-2 max-w-3xl ${muted}`}>Associate can move directly to Gold or directly to Classic Gold. You are not required to upgrade one level at a time.</p>
            </div>
            <div className="grid items-stretch gap-5 md:grid-cols-3">
              {packages.map((pkg) => {
                const active = pkg.package_code === currentCode && isPbo;
                const higher = !isPbo || rank[pkg.package_code] > currentRank;
                const salesRate = pkg.sales_commission_pct ?? (pkg.package_code === 'associate' ? 5 : pkg.package_code === 'gold' ? 10 : 15);
                const visual = packageVisuals[pkg.package_code] || packageVisuals.associate;
                return (
                  <article key={pkg.package_code} className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-950 ${active ? 'ring-2 ring-estate-purple ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-950' : 'border-slate-200 dark:border-white/10'}`}>
                    <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${visual.accent}`}>
                      <img src={visual.image} alt={`${pkg.package_name} BHRealtors package`} className="h-full w-full object-cover opacity-55 mix-blend-overlay transition duration-500 group-hover:scale-105 group-hover:opacity-70" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">{visual.icon}{visual.label}</div>
                      <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3"><div><p className="text-sm font-semibold text-white/80">{pkg.package_name}</p><p className="mt-1 text-3xl font-black text-white">{naira(pkg.price)}</p></div>{active && <Badge className="border border-white/20 bg-white/20 text-white">Current</Badge>}</div>
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${visual.soft}`}>L1: {pkg.direct_commission_pct}%</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${visual.soft}`}>L2: {pkg.indirect_commission_pct}%</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${visual.soft}`}>Sales: {salesRate}%</span></div>
                      <p className={`mt-5 min-h-[96px] text-sm leading-6 ${muted}`}>{pkg.description}</p>
                      <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]"><p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Membership</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{pkg.direct_commission_pct}% / {pkg.indirect_commission_pct}%</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]"><p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Land sales</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{salesRate}%</p></div></div>
                      <div className="mt-auto pt-5">
                        {higher && <Button className={`w-full bg-gradient-to-r ${visual.accent} text-white shadow-lg hover:opacity-95`} onClick={() => openRegistration(pkg)}>{isPbo ? `Upgrade to ${pkg.package_name}` : `Join ${pkg.package_name} — ${naira(pkg.price)}`}</Button>}
                        {active && <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-xs leading-5 text-emerald-700 dark:text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />You are currently on this package.</div>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {!isPbo && <section className={`${glass} rounded-3xl p-7`}><div className="flex items-center gap-3"><Sprout className="h-6 w-6 text-emerald-500" /><h2 className="text-xl font-black text-estate-blue dark:text-white">Start with a real opportunity</h2></div><p className={`mt-3 max-w-3xl leading-7 ${muted}`}>Join a network where property sales, referrals and personal development work together. Start at the level that fits your plan and grow responsibly.</p></section>}

          {isRealtor && referralCode && (
            <>
              <section className={`${glass} overflow-hidden rounded-3xl p-5 sm:p-7`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.2em] text-estate-purple">Your unique Realtor identity</p><h2 className="mt-1 text-2xl font-black text-estate-blue dark:text-white">Referral code & client linking</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-200">Give clients this code. When they enter it in the Referrer section of their profile, their profile is securely linked to your Realtor account.</p></div>
                  <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-estate-purple/20 bg-estate-purple/5 p-2"><code className="min-w-0 flex-1 truncate px-3 text-base font-black tracking-wider text-estate-purple">{referralCode}</code><Button type="button" onClick={copyReferralCode} variant="outline" className="shrink-0">{copiedCode ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}{copiedCode ? 'Copied' : 'Copy'}</Button></div>
                </div>
              </section>
              <ReferralShareCard referralCode={referralCode} referralLink={referralLink} />
            </>
          )}

          {isRealtor && <section className="grid gap-5 lg:grid-cols-2">
            <div className={`${glass} rounded-3xl p-6`}><div className="mb-4 flex items-center gap-2"><Trophy className="h-5 w-5 text-estate-purple" /><h2 className="font-bold text-slate-950 dark:text-white">Referral leaderboard</h2></div><ReferralLeaderboard /></div>
            <div className={`${glass} rounded-3xl p-6`}><div className="mb-4 flex items-center gap-2"><Network className="h-5 w-5 text-estate-purple" /><h2 className="font-bold text-slate-950 dark:text-white">Referral tree</h2></div><DownlineTree /></div>
          </section>}

          {isRealtor && (
            <section className={`${glass} rounded-3xl p-5 sm:p-7`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-estate-purple">Sales activity</p><h2 className="mt-1 flex items-center gap-2 text-2xl font-black text-estate-blue dark:text-white"><ShoppingBag className="h-6 w-6" /> My referred client sales</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-200">Only linked clients' property purchases are shown here. Client privacy is protected.</p></div><Badge className="w-fit">{sales.length} sale{sales.length === 1 ? '' : 's'}</Badge></div>
              {sales.length ? <div className="mt-5 space-y-3">{sales.map((sale, index) => <div key={sale.sale_id || `sale-${index}`} className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-bold text-slate-950 dark:text-white">{sale.client_first_name || 'Client'}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{sale.estate_name || 'Property'} • {sale.plots_bought || 1} plot{Number(sale.plots_bought || 1) === 1 ? '' : 's'}{sale.plot_id ? ` • Plot ${sale.plot_id}` : ''}</p></div><Badge className="w-fit capitalize">{String(sale.payment_status || 'Pending').replace(/_/g, ' ')}</Badge></div><div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3"><div><p className="text-slate-500 dark:text-slate-400">Paid</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{naira(Number(sale.amount_paid || 0))}</p></div><div><p className="text-slate-500 dark:text-slate-400">Balance</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{naira(Number(sale.balance || 0))}</p></div><div><p className="text-slate-500 dark:text-slate-400">Sale date</p><p className="mt-1 font-bold text-slate-900 dark:text-white">{sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('en-NG') : '—'}</p></div></div></div>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-white/10"><ShoppingBag className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-900 dark:text-white">No referred property sales yet</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-200">Share your unique code and link clients to your Realtor profile to start building your sales record.</p></div>}
            </section>
          )}

          {isRealtor && <CommissionHistory rows={commissionRows} loading={busy} error={dashboardError} />}

          {isRealtor && <section className={`${glass} rounded-3xl p-6`}><div className="mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-estate-purple" /><h2 className="font-bold text-slate-950 dark:text-white">Recent withdrawals</h2></div>{withdrawals?.length ? <div className="space-y-2">{withdrawals.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/40 p-3 dark:bg-white/5"><div><p className="font-semibold text-slate-950 dark:text-white">{naira(item.amount)}</p><p className={`text-xs ${muted}`}>{new Date(item.created_at).toLocaleString('en-NG')}</p></div><Badge>{item.status}</Badge></div>)}</div> : <p className={muted}>No withdrawal requests yet.</p>}</section>}
        </div>
      </main>
      <Footer />
      <RealtorsRegistrationForm open={registrationOpen} onClose={() => setRegistrationOpen(false)} selectedPackage={selectedPackage} onComplete={() => { setRegistrationOpen(false); void refreshProfile(); void load(); }} />
    </div>
  );
};

export default BHRealtors;
