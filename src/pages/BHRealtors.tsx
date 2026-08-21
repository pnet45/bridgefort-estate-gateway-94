import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Users, Wallet, Copy, Share2, RefreshCw, ArrowUpRight, Loader2, Lock, CheckCircle2, Network, Trophy, TrendingUp } from 'lucide-react';
import { bhRealtorsPackages, type BhRealtorsPackage } from '@/data/bhRealtorsPackages';
import RealtorsRegistrationForm from '@/components/bhRealtors/RealtorsRegistrationForm';
import ReferralLeaderboard from '@/components/bhRealtors/ReferralLeaderboard';
import DownlineTree from '@/components/bhRealtors/DownlineTree';
import CommissionHistory from '@/components/bhRealtors/CommissionHistory';

const rank: Record<string, number> = { associate: 1, gold: 2, classic_gold: 3 };
const naira = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

const BHRealtors: React.FC = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [packages, setPackages] = useState<BhRealtorsPackage[]>(bhRealtorsPackages);
  const [selectedPackage, setSelectedPackage] = useState<BhRealtorsPackage>(bhRealtorsPackages[0]);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [pboCount, setPboCount] = useState(0);
  const [downlineCount, setDownlineCount] = useState(0);
  const [available, setAvailable] = useState(0);
  const [locked, setLocked] = useState(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const currentCode = profile?.current_package || 'associate';
  const currentRank = rank[currentCode] || 1;
  const isRealtor = Boolean(profile?.is_pbo);
  const referralCode = profile?.pbo_referral_code || '';
  const referralLink = typeof window !== 'undefined' && referralCode
    ? `${window.location.origin}/bridgefort-realtors-login?ref=${encodeURIComponent(referralCode)}`
    : '';

  const load = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const [pkgResult, members, pbo, downline, commissions, history] = await Promise.all([
        supabase.from('mlm_packages').select('package_code, package_name, price, direct_commission_pct, indirect_commission_pct, withdrawable, description').order('price'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_pbo', true),
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
      setAvailable(rows.filter((r: any) => r.status === 'available').reduce((s: number, r: any) => s + Number(r.commission_amount || 0), 0));
      setLocked(rows.filter((r: any) => r.status === 'locked').reduce((s: number, r: any) => s + Number(r.commission_amount || 0), 0));
      setWithdrawals(history.data || []);
    } catch (error) {
      console.error('BHRealtors load error:', error);
      toast({ title: 'Unable to load BHRealtors data', description: 'Please refresh and try again.', variant: 'destructive' });
    } finally { setBusy(false); }
  };

  useEffect(() => { if (user) void load(); }, [user]);

  const eligiblePackages = useMemo(() => packages.filter(p => !isRealtor || rank[p.package_code] > currentRank), [packages, isRealtor, currentRank]);
  const currentPackage = packages.find(p => p.package_code === currentCode) || packages.find(p => p.package_code === 'associate') || packages[0];

  const openRegistration = (pkg: BhRealtorsPackage) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in before joining BHRealtors.', variant: 'destructive' });
      return;
    }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-estate-blue" /></div>;

  if (!user) return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 pt-32 container-custom"><h1 className="text-3xl font-bold text-estate-blue">BHRealtors</h1><p className="mt-2 text-slate-600">Sign in to join and manage your Realtor network.</p><Link to="/bridgefort-realtors-login"><Button className="mt-5">Realtors Login</Button></Link></main><Footer /></div>;

  return <div className="min-h-screen bg-slate-50/80"><Navbar /><main className="pt-28 pb-16"><div className="container-custom space-y-7">
    <section className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/60 backdrop-blur-2xl shadow-xl p-6 md:p-9">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-estate-purple/15 blur-3xl" />
      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div><Badge className="mb-3 bg-estate-purple/10 text-estate-purple hover:bg-estate-purple/10">BHRealtors Network</Badge><h1 className="text-3xl md:text-4xl font-bold text-estate-blue">Build your network. Sell property. Earn commissions.</h1><p className="mt-2 max-w-2xl text-slate-600">Your membership package controls your network income and estate-land sales commission.</p></div>
        <Button variant="outline" onClick={() => void load()} disabled={busy} className="bg-white/50">{busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />} Refresh</Button>
      </div>
    </section>

    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {[
        [Users, 'Registered', memberCount], [Network, 'Active Realtors', pboCount], [Users, 'My direct referrals', downlineCount], [Wallet, 'Wallet balance', naira(profile?.wallet_balance ?? 0)], [Lock, 'Locked', naira(locked)],
      ].map(([Icon, label, value]: any) => <div key={label} className="rounded-2xl border border-white/50 bg-white/60 backdrop-blur-xl p-4 shadow-sm"><Icon className="h-5 w-5 text-estate-purple" /><p className="text-[11px] uppercase tracking-wider text-slate-500 mt-3">{label}</p><p className="text-xl font-bold text-slate-900 mt-1">{value}</p></div>)}
    </div>

    {isRealtor && <section className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-sm"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-slate-500">Current package / rank</p><h2 className="text-2xl font-bold text-estate-blue">{currentPackage?.package_name || currentCode}</h2><p className="text-sm text-slate-500 mt-1">Rank: {currentCode === 'classic_gold' ? 'Classic Gold' : currentCode === 'gold' ? 'Gold' : 'Associate'} · Estate-land sales commission: {currentPackage?.sales_commission_pct ?? (currentCode === 'associate' ? 5 : currentCode === 'gold' ? 10 : 15)}%</p></div><Badge className={currentRank >= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>{currentRank >= 2 ? 'Withdrawable' : 'Locked commission'}</Badge></div></div>
      <Link to="/bh-realtors-withdraw" className="rounded-3xl border border-white/50 bg-estate-blue text-white p-6 shadow-lg hover:scale-[1.01] transition"><Wallet className="h-6 w-6" /><p className="mt-5 text-sm text-white/70">Available to withdraw</p><p className="text-3xl font-bold mt-1">{naira(profile?.wallet_balance ?? 0)}</p><span className="inline-flex items-center gap-1 mt-4 text-sm">Open wallet <ArrowUpRight className="h-4 w-4" /></span></Link>
    </section>}

    {!isRealtor && <section className="rounded-3xl border border-estate-purple/20 bg-estate-purple/5 p-6"><h2 className="text-xl font-bold text-estate-blue">Join BHRealtors</h2><p className="text-sm text-slate-600 mt-1">Choose a package below. Registration is completed through secure Paystack payment; your Realtor account becomes active only after successful payment.</p></section>}

    <section><div className="flex items-end justify-between mb-4"><div><h2 className="text-2xl font-bold text-estate-blue">Membership packages</h2><p className="text-sm text-slate-500">Prices are controlled by Bridgefort Homes Admin.</p></div></div><div className="grid md:grid-cols-3 gap-5">{packages.map(pkg => {
      const active = pkg.package_code === currentCode && isRealtor;
      const higher = !isRealtor || rank[pkg.package_code] > currentRank;
      const salesRate = pkg.sales_commission_pct ?? (pkg.package_code === 'associate' ? 5 : pkg.package_code === 'gold' ? 10 : 15);
      return <div key={pkg.package_code} className={`rounded-3xl border ${active ? 'border-estate-purple/50 ring-2 ring-estate-purple/10' : 'border-white/50'} bg-white/65 backdrop-blur-xl p-6 shadow-sm`}><div className="flex justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-slate-500">{pkg.package_name}</p><p className="text-3xl font-bold text-estate-blue mt-1">{naira(pkg.price)}</p></div>{active && <Badge>Current</Badge>}</div><p className="text-sm text-slate-600 mt-4 min-h-12">{pkg.description}</p><div className="mt-5 space-y-2 text-sm"><p className="flex justify-between"><span>Membership direct</span><strong>{pkg.direct_commission_pct}%</strong></p><p className="flex justify-between"><span>Membership level 2</span><strong>{pkg.indirect_commission_pct}%</strong></p><p className="flex justify-between"><span>Estate-land sale</span><strong>{salesRate}%</strong></p></div>{higher && <Button className="w-full mt-6 bg-estate-blue hover:bg-estate-darkBlue" onClick={() => openRegistration(pkg)}>{isRealtor ? `Upgrade to ${pkg.package_name}` : `Join ${pkg.package_name} — ${naira(pkg.price)}`}</Button>}{active && <div className="mt-6 rounded-xl bg-emerald-50 text-emerald-700 px-3 py-2 text-xs flex gap-2"><CheckCircle2 className="h-4 w-4" /> You are currently on this package.</div>}</div>;
    })}</div></section>

    {isRealtor && <section className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-sm"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-slate-500">Your referral link</p><p className="font-semibold mt-1 break-all">{referralLink || 'Referral code is being prepared…'}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void copyReferral()}><Copy className="h-4 w-4 mr-2" /> Copy</Button><Button variant="outline" onClick={() => void shareReferral()}><Share2 className="h-4 w-4 mr-2" /> Share</Button></div></div></section>}

    {isRealtor && <div className="grid lg:grid-cols-2 gap-5"><div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6"><div className="flex items-center gap-2 mb-4"><Trophy className="h-5 w-5 text-estate-purple" /><h2 className="font-bold">Referral leaderboard</h2></div><ReferralLeaderboard /></div><div className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6"><div className="flex items-center gap-2 mb-4"><Network className="h-5 w-5 text-estate-purple" /><h2 className="font-bold">Referral tree</h2></div><DownlineTree /></div></div>}

    {isRealtor && <CommissionHistory />}

    {isRealtor && <section className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-6 shadow-sm"><div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-estate-purple" /><h2 className="font-bold">Recent withdrawals</h2></div>{withdrawals.length ? <div className="space-y-2">{withdrawals.map(w => <div key={w.id} className="flex items-center justify-between rounded-xl bg-white/50 p-3"><div><p className="font-semibold">{naira(w.amount)}</p><p className="text-xs text-slate-500">{new Date(w.created_at).toLocaleString()}</p></div><Badge>{w.status}</Badge></div>)}</div> : <p className="text-sm text-slate-500">No withdrawal requests yet.</p>}</section>}
  </div></main><Footer />

  <RealtorsRegistrationForm open={registrationOpen} onClose={() => setRegistrationOpen(false)} selectedPackage={selectedPackage} onComplete={() => { setRegistrationOpen(false); void refreshProfile(); void load(); }} />
  </div>;
};

export default BHRealtors;
