import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Wallet, Copy, Share2, RefreshCw, ArrowUpRight, Loader2, Lock, CheckCircle2, Network, Trophy, TrendingUp, Building2, Sprout, Target } from 'lucide-react';
import { bhRealtorsPackages, type BhRealtorsPackage } from '@/data/bhRealtorsPackages';
import RealtorsRegistrationForm from '@/components/bhRealtors/RealtorsRegistrationForm';
import ReferralLeaderboard from '@/components/bhRealtors/ReferralLeaderboard';
import DownlineTree from '@/components/bhRealtors/DownlineTree';
import CommissionHistory from '@/components/bhRealtors/CommissionHistory';

const rank: Record<string, number> = { associate: 1, gold: 2, classic_gold: 3 };
const naira = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
const glass = 'border border-white/15 bg-white/65 dark:bg-slate-950/70 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/30';
const muted = 'text-slate-600 dark:text-slate-200';

const BHRealtors: React.FC = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [packages, setPackages] = useState<BhRealtorsPackage[]>(bhRealtorsPackages);
  const [selectedPackage, setSelectedPackage] = useState<BhRealtorsPackage>(bhRealtorsPackages[0]);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [pboCount, setPboCount] = useState(0);
  const [downlineCount, setDownlineCount] = useState(0);
  const [locked, setLocked] = useState(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const currentCode = profile?.current_package || 'associate';
  const currentRank = rank[currentCode] || 1;
  const isRealtor = Boolean(profile?.is_pbo && profile?.is_active);
  const referralCode = profile?.pbo_referral_code || '';
  const referralLink = typeof window !== 'undefined' && referralCode ? `${window.location.origin}/bridgefort-realtors-login?ref=${encodeURIComponent(referralCode)}` : '';

  const load = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const [pkgResult, members, pbo, downline, commissions, history] = await Promise.all([
        supabase.from('mlm_packages').select('package_code, package_name, price, direct_commission_pct, indirect_commission_pct, withdrawable, description, sales_commission_pct, sales_commission_locked, first_level_sales_commission_pct').order('price'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_pbo', true).eq('is_active', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('referred_by_id', user.id),
        supabase.from('mlm_commissions').select('commission_amount, status').eq('beneficiary_id', user.id),
        supabase.from('withdrawal_requests').select('id, amount, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
      ]);
      if (pkgResult.data?.length) {
        const dbPackages = pkgResult.data as BhRealtorsPackage[];
        setPackages(dbPackages);
        setSelectedPackage(prev => dbPackages.find(p => p.package_code === prev.package_code) || dbPackages[0]);
      }
      setMemberCount(members.count || 0);
      setPboCount(pbo.count || 0);
      setDownlineCount(downline.count || 0);
      const rows = commissions.data || [];
      setLocked(rows.filter((r: any) => r.status === 'locked').reduce((s: number, r: any) => s + Number(r.commission_amount || 0), 0));
      setWithdrawals(history.data || []);
    } catch (error) {
      console.error('BHRealtors load error:', error);
      toast({ title: 'Unable to load BHRealtors data', description: 'Please refresh and try again.', variant: 'destructive' });
    } finally { setBusy(false); }
  };

  useEffect(() => { if (user) void load(); }, [user]);

  const currentPackage = packages.find(p => p.package_code === currentCode) || packages.find(p => p.package_code === 'associate') || packages[0];
  const eligiblePackages = useMemo(() => packages.filter(p => !isRealtor || rank[p.package_code] > currentRank), [packages, isRealtor, currentRank]);

  const openRegistration = (pkg: BhRealtorsPackage) => {
    if (!user) { toast({ title: 'Sign in required', description: 'Please sign in before joining BHRealtors.', variant: 'destructive' }); return; }
    if (isRealtor && rank[pkg.package_code] <= currentRank) return;
    setSelectedPackage(pkg);
    setRegistrationOpen(true);
  };

  const copyReferral = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast({ title: 'Referral link copied', description: 'Share it with people you want to introduce to BHRealtors.' });
  };
  const shareReferral = async () => {
    if (!referralLink) return copyReferral();
    if (navigator.share) {
      try { await navigator.share({ title: 'Join BHRealtors', text: 'Join Bridgefort Homes Realtors with my referral link.', url: referralLink }); } catch (e: any) { if (e?.name !== 'AbortError') await copyReferral(); }
    } else await copyReferral();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950"><Loader2 className="animate-spin h-8 w-8 text-estate-blue" /></div>;
  if (!user) return <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950"><Navbar /><main className="flex-1 pt-32 container-custom"><h1 className="text-3xl font-bold text-estate-blue dark:text-white">BHRealtors</h1><p className={`mt-2 ${muted}`}>Sign in to join and manage your Realtor network.</p><Link to="/bridgefort-realtors-login"><Button className="mt-5">Realtors Login</Button></Link></main><Footer /></div>;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-custom space-y-8">
          <section className="relative isolate min-h-[430px] overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl">
            <img src="/images/LoginImageLANDFORSALE.png" alt="Bridgefort Homes land investment" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/55 dark:bg-slate-950/70" />
            <div className="absolute inset-0 bg-gradient-to-br from-estate-blue/85 via-slate-950/45 to-black/75" />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-red-500/15 blur-3xl" />
            <div className="relative z-10 flex min-h-[430px] flex-col justify-between p-7 md:p-12">
              <div className="flex flex-wrap items-center justify-between gap-4"><Badge className="border border-white/20 bg-white/10 text-white backdrop-blur-xl">BHREALTORS • NETWORK • PROPERTY</Badge><Button variant="outline" onClick={() => void load()} disabled={busy} className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">{busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />} Refresh</Button></div>
              <div className="max-w-4xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/75">Build income. Build ownership. Build a network.</p>
                <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">Turn relationships into <span className="text-cyan-200">opportunity</span>.</h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-100 md:text-lg">BHRealtors gives you more than a referral link. Build a genuine sales network, introduce people to quality real estate opportunities, earn according to your package, and grow towards financial freedom through property.</p>
                <div className="mt-7 flex flex-wrap gap-3"><a href="#packages"><Button className="bg-white text-slate-950 hover:bg-slate-100">Explore Packages</Button></a>{isRealtor && <Link to="/bh-realtors/withdraw"><Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"><Wallet className="h-4 w-4 mr-2" /> Withdraw</Button></Link>}</div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {[[Users, 'Registered', memberCount], [Network, 'Active Realtors', pboCount], [Users, 'My direct referrals', downlineCount], [Lock, 'Locked commissions', naira(locked)], [Wallet, 'Wallet balance', naira(profile?.wallet_balance ?? 0)]].map(([Icon, label, value]: any) => <div key={label} className={`${glass} rounded-2xl p-4`}><Icon className="h-5 w-5 text-estate-purple" /><p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">{label}</p><p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{value}</p></div>)}
          </section>

          {isRealtor && <section className="grid gap-5 lg:grid-cols-3">
            <div className={`${glass} lg:col-span-2 rounded-3xl p-6`}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300">Current package / rank</p><h2 className="mt-1 text-3xl font-black text-estate-blue dark:text-white">{currentPackage?.package_name || currentCode}</h2><p className={`mt-2 text-sm ${muted}`}>Estate-land sales commission: {currentPackage?.sales_commission_pct ?? (currentCode === 'associate' ? 5 : currentCode === 'gold' ? 10 : 15)}%. {currentRank === 1 ? 'Commission is locked until you upgrade.' : 'Eligible commissions are withdrawable.'}</p></div><Badge className={currentRank >= 2 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200'}>{currentRank >= 2 ? 'Withdrawable' : 'Locked'}</Badge></div></div>
            <Link to="/bh-realtors/withdraw" className="group rounded-3xl border border-white/15 bg-estate-blue p-6 text-white shadow-2xl transition hover:-translate-y-1 hover:shadow-estate-blue/20"><Wallet className="h-7 w-7" /><p className="mt-5 text-sm text-slate-200">Wallet balance</p><p className="mt-1 text-3xl font-black">{naira(profile?.wallet_balance ?? 0)}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">Withdraw <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></span></Link>
          </section>}

          <section className={`${glass} relative overflow-hidden rounded-3xl p-7 md:p-9`}><div className="absolute right-0 top-0 h-48 w-48 overflow-hidden rounded-bl-[5rem] opacity-90"><img src="/images/Luxury Homes.jpeg" alt="Luxury real estate" className="h-full w-full object-cover" /></div><div className="relative max-w-3xl pr-4 md:pr-40"><div className="flex items-center gap-3"><Building2 className="h-6 w-6 text-estate-purple" /><h2 className="text-2xl font-black text-estate-blue dark:text-white">Sell property. Build trust. Create wealth.</h2></div><p className={`mt-4 leading-7 ${muted}`}>Real estate is a long-term wealth strategy. With BHRealtors, your work is not just about making a sale; it is about helping people secure land and property they can hold, develop and potentially benefit from as the surrounding area grows.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-900/5 dark:bg-white/5 p-4"><Target className="h-5 w-5 text-estate-purple" /><p className={`mt-2 text-sm ${muted}`}>Find genuine buyers</p></div><div className="rounded-2xl bg-slate-900/5 dark:bg-white/5 p-4"><Users className="h-5 w-5 text-estate-purple" /><p className={`mt-2 text-sm ${muted}`}>Grow your network</p></div><div className="rounded-2xl bg-slate-900/5 dark:bg-white/5 p-4"><TrendingUp className="h-5 w-5 text-estate-purple" /><p className={`mt-2 text-sm ${muted}`}>Grow your income</p></div></div></div></section>

          <section id="packages"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-estate-purple">Membership & growth</p><h2 className="mt-1 text-3xl font-black text-estate-blue dark:text-white">Choose your level. Build your future.</h2><p className={`mt-2 ${muted}`}>Associate can move directly to Gold or directly to Classic Gold. You are not required to upgrade one level at a time.</p></div><div className="grid gap-5 md:grid-cols-3">{packages.map(pkg => { const active = pkg.package_code === currentCode && isRealtor; const higher = !isRealtor || rank[pkg.package_code] > currentRank; const salesRate = pkg.sales_commission_pct ?? (pkg.package_code === 'associate' ? 5 : pkg.package_code === 'gold' ? 10 : 15); return <div key={pkg.package_code} className={`${glass} relative overflow-hidden rounded-3xl p-6 ${active ? 'ring-2 ring-estate-purple/60' : ''}`}><div className="absolute right-0 top-0 h-28 w-28 overflow-hidden rounded-bl-[3rem]"><img src={pkg.package_code === 'classic_gold' ? '/images/Luxury Homes.jpeg' : '/images/LoginImageLANDFORSALE.png'} alt="Real estate" className="h-full w-full object-cover opacity-60" /></div><div className="relative"><p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">{pkg.package_name}</p><p className="mt-1 text-3xl font-black text-estate-blue dark:text-white">{naira(pkg.price)}</p>{active && <Badge className="mt-2 bg-estate-purple text-white">Current</Badge>}<p className={`mt-5 min-h-20 text-sm leading-6 ${muted}`}>{pkg.description}</p><div className="mt-5 space-y-2 border-t border-slate-200/60 dark:border-white/10 pt-4 text-sm"><p className={`flex justify-between ${muted}`}><span>Membership L1 / L2</span><strong className="text-slate-950 dark:text-white">{pkg.direct_commission_pct}% / {pkg.indirect_commission_pct}%</strong></p><p className={`flex justify-between ${muted}`}><span>Estate-land sale</span><strong className="text-slate-950 dark:text-white">{salesRate}%</strong></p></div>{higher && <Button className="mt-6 w-full bg-estate-blue hover:bg-estate-darkBlue" onClick={() => openRegistration(pkg)}>{isRealtor ? `Upgrade to ${pkg.package_name}` : `Join ${pkg.package_name} — ${naira(pkg.price)}`}</Button>}{active && <div className="mt-5 flex gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-200"><CheckCircle2 className="h-4 w-4" /> You are currently on this package.</div>}</div></div>; })}</div></section>

          {!isRealtor && <section className={`${glass} rounded-3xl p-7`}><div className="flex items-center gap-3"><Sprout className="h-6 w-6 text-emerald-500" /><h2 className="text-xl font-black text-estate-blue dark:text-white">Start with a real opportunity</h2></div><p className={`mt-3 max-w-3xl leading-7 ${muted}`}>Join a network where property sales, referrals and personal development work together. Start at the level that fits your plan, learn the market, build relationships and grow your income responsibly.</p></section>}

          {isRealtor && <section className={`${glass} rounded-3xl p-6`}><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300">Your referral link</p><p className="mt-1 break-all font-semibold text-slate-950 dark:text-white">{referralLink || 'Referral code is being prepared…'}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void copyReferral()} className="bg-white/50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"><Copy className="h-4 w-4 mr-2" /> Copy</Button><Button variant="outline" onClick={() => void shareReferral()} className="bg-white/50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"><Share2 className="h-4 w-4 mr-2" /> Share</Button></div></div></section>}

          {isRealtor && <div className="grid gap-5 lg:grid-cols-2"><div className={`${glass} rounded-3xl p-6`}><div className="mb-4 flex items-center gap-2"><Trophy className="h-5 w-5 text-estate-purple" /><h2 className="font-bold text-slate-950 dark:text-white">Referral leaderboard</h2></div><ReferralLeaderboard /></div><div className={`${glass} rounded-3xl p-6`}><div className="mb-4 flex items-center gap-2"><Network className="h-5 w-5 text-estate-purple" /><h2 className="font-bold text-slate-950 dark:text-white">Referral tree</h2></div><DownlineTree /></div></div>}

          {isRealtor && <CommissionHistory />}

          {isRealtor && <section className={`${glass} rounded-3xl p-6`}><div className="mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-estate-purple" /><h2 className="font-bold text-slate-950 dark:text-white">Recent withdrawals</h2></div>{withdrawals.length ? <div className="space-y-2">{withdrawals.map(w => <div key={w.id} className="flex items-center justify-between rounded-xl bg-white/40 dark:bg-white/5 p-3"><div><p className="font-semibold text-slate-950 dark:text-white">{naira(w.amount)}</p><p className={`text-xs ${muted}`}>{new Date(w.created_at).toLocaleString()}</p></div><Badge>{w.status}</Badge></div>)}</div> : <p className={muted}>No withdrawal requests yet.</p>}</section>}
        </div>
      </main>
      <Footer />
      <RealtorsRegistrationForm open={registrationOpen} onClose={() => setRegistrationOpen(false)} selectedPackage={selectedPackage} onComplete={() => { setRegistrationOpen(false); void refreshProfile(); void load(); }} />
    </div>
  );
};

export default BHRealtors;
