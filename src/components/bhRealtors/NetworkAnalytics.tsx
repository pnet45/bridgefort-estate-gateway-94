import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, Network, Trophy, Users, WalletCards } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Summary {
  direct_active_realtors: number;
  direct_registered_realtors: number;
  current_package: string;
  current_rank: string;
}

interface Props { userId: string; }

const NetworkAnalytics: React.FC<Props> = ({ userId }) => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [networkRows, setNetworkRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [summaryResult, networkResult] = await Promise.all([
        supabase.from('bhrealtor_network_summary').select('direct_active_realtors, direct_registered_realtors, current_package, current_rank').eq('user_id', userId).maybeSingle(),
        supabase.from('profiles').select('current_package, is_active, created_at').eq('referred_by_id', userId).order('created_at', { ascending: false }).limit(100),
      ]);
      if (cancelled) return;
      setSummary((summaryResult.data as Summary | null) || null);
      setNetworkRows(networkResult.data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const packageCounts = useMemo(() => {
    const counts: Record<string, number> = { associate: 0, gold: 0, classic_gold: 0 };
    networkRows.filter(r => r.is_active).forEach(r => { if (r.current_package in counts) counts[r.current_package] += 1; });
    return counts;
  }, [networkRows]);

  const total = Math.max(summary?.direct_active_realtors || 0, 1);
  const cards = [
    [Users, 'Direct active network', summary?.direct_active_realtors || 0, 'People actively building with you'],
    [Network, 'Registered referrals', summary?.direct_registered_realtors || 0, 'Direct people linked to you'],
    [Trophy, 'Current rank', summary?.current_rank || 'Associate', 'Based on your active package'],
    [Activity, 'Network activity', `${Math.round(((summary?.direct_active_realtors || 0) / total) * 100)}%`, 'Active direct-referral ratio'],
  ];

  if (loading) return <div className="grid gap-3 md:grid-cols-4">{cards.map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-white/5" />)}</div>;

  return <section className="space-y-5">
    <div className="grid gap-3 md:grid-cols-4">{cards.map(([Icon, label, value, note]: any) => <div key={label} className="rounded-2xl border border-white/15 bg-white/65 dark:bg-slate-950/70 backdrop-blur-2xl p-5 shadow-xl shadow-black/5 dark:shadow-black/30"><Icon className="h-5 w-5 text-estate-purple" /><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">{label}</p><p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{value}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{note}</p></div>)}</div>
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/15 bg-white/65 dark:bg-slate-950/70 backdrop-blur-2xl p-6 shadow-xl shadow-black/5 dark:shadow-black/30"><div className="flex items-center justify-between"><div><h3 className="font-black text-lg text-estate-blue dark:text-white">Network package mix</h3><p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Your active direct network by package.</p></div><WalletCards className="h-6 w-6 text-estate-purple" /></div><div className="mt-6 space-y-4">{Object.entries(packageCounts).map(([key, count]) => { const pct = Math.round((count / total) * 100); return <div key={key}><div className="flex justify-between text-sm"><span className="capitalize text-slate-700 dark:text-slate-200">{key.replace('_', ' ')}</span><strong className="text-slate-950 dark:text-white">{count}</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full bg-estate-purple transition-all" style={{ width: `${Math.min(pct, 100)}%` }} /></div></div>; })}</div></div>
      <div className="rounded-3xl border border-white/15 bg-white/65 dark:bg-slate-950/70 backdrop-blur-2xl p-6 shadow-xl shadow-black/5 dark:shadow-black/30"><div className="flex items-center justify-between"><div><h3 className="font-black text-lg text-estate-blue dark:text-white">Build the network the right way</h3><p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Focus on people who genuinely want to sell, learn and grow.</p></div><ArrowUpRight className="h-6 w-6 text-estate-purple" /></div><div className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-200"><p>• Introduce people to real estate opportunities that match their needs.</p><p>• Help new Realtors understand the products before asking them to sell.</p><p>• Build trust first; commissions follow successful qualifying activity.</p><p>• Grow a stable network instead of chasing numbers.</p></div></div>
    </div>
  </section>;
};

export default NetworkAnalytics;
