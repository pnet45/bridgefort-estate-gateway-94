import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, UserPlus, Network, Wallet, TrendingUp, Save, RefreshCw, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface PackageRow {
  package_code: string;
  package_name: string;
  price: number;
  direct_commission_pct: number;
  indirect_commission_pct: number;
  withdrawable: boolean;
}

interface FunnelStats {
  totalRegistered: number;
  totalPbo: number;
  totalWithDownline: number;
  totalCommission: number;
  availableCommission: number;
  lockedCommission: number;
  byPackage: { package: string; count: number }[];
  commissionBySource: { source: string; amount: number }[];
  withdrawalsByStatus: { status: string; count: number; total: number }[];
  monthlyCommissions: { month: string; amount: number }[];
}

const PACKAGE_LABELS: Record<string, string> = {
  associate: 'Associate',
  gold: 'Gold',
  classic_gold: 'Classic Gold',
};

const CHART_COLORS = [
  'hsl(var(--estate-purple))',
  'hsl(var(--estate-blue))',
  'hsl(var(--estate-gold))',
  'hsl(var(--estate-red))',
];

const StatTile = ({ icon: Icon, label, value, detail }: { icon: any; label: string; value: string | number; detail?: string }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/45 dark:bg-white/5 backdrop-blur-xl shadow-sm p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg">
    <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-estate-purple/10 blur-2xl" />
    <div className="relative flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        {detail && <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>}
      </div>
      <div className="rounded-xl bg-estate-purple/10 p-2.5">
        <Icon size={19} className="text-estate-purple" />
      </div>
    </div>
  </div>
);

const formatNaira = (value: number) => `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

/** Admin BHRealtors funnel: analytics + controlled membership pricing. */
const AdminMlmFunnelDashboard = () => {
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [draftPrices, setDraftPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    const [registered, pbo, downline, packageResults, commissions, withdrawalRows] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_pbo', true),
      (supabase.from('profiles') as any).select('*', { count: 'exact', head: true }).not('referred_by_id', 'is', null),
      supabase.from('mlm_packages').select('package_code, package_name, price, direct_commission_pct, indirect_commission_pct, withdrawable').order('price'),
      (supabase.from('mlm_commissions') as any).select('commission_source, commission_amount, status, created_at'),
      (supabase as any).rpc('get_withdrawal_funnel_stats'),
    ]);

    if (packageResults.error) setError(packageResults.error.message);

    const packageRows = (packageResults.data || []) as PackageRow[];
    setPackages(packageRows);
    setDraftPrices(Object.fromEntries(packageRows.map((p) => [p.package_code, String(p.price)])));

    const byPackage = await Promise.all(
      Object.keys(PACKAGE_LABELS).map(async (pkg) => {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('current_package', pkg);
        return { package: PACKAGE_LABELS[pkg], count: count || 0 };
      })
    );

    const commissionRows = ((commissions.data || []) as any[]);
    const totalCommission = commissionRows.reduce((sum, row) => sum + Number(row.commission_amount || 0), 0);
    const availableCommission = commissionRows.filter((r) => r.status === 'available').reduce((sum, row) => sum + Number(row.commission_amount || 0), 0);
    const lockedCommission = commissionRows.filter((r) => r.status === 'locked').reduce((sum, row) => sum + Number(row.commission_amount || 0), 0);

    const sourceMap: Record<string, number> = {};
    const monthMap: Record<string, number> = {};
    commissionRows.forEach((row) => {
      const source = row.commission_source === 'property_sale' ? 'Property sales' : row.commission_source === 'membership' ? 'Membership' : row.commission_source || 'Other';
      sourceMap[source] = (sourceMap[source] || 0) + Number(row.commission_amount || 0);
      const month = row.created_at ? new Date(row.created_at).toLocaleDateString('en-NG', { month: 'short', year: '2-digit' }) : 'Unknown';
      monthMap[month] = (monthMap[month] || 0) + Number(row.commission_amount || 0);
    });

    const monthlyCommissions = Object.entries(monthMap).slice(-8).map(([month, amount]) => ({ month, amount }));

    if (withdrawalRows.error) console.warn('Withdrawal funnel unavailable:', withdrawalRows.error.message);

    setStats({
      totalRegistered: registered.count || 0,
      totalPbo: pbo.count || 0,
      totalWithDownline: downline.count || 0,
      totalCommission,
      availableCommission,
      lockedCommission,
      byPackage,
      commissionBySource: Object.entries(sourceMap).map(([source, amount]) => ({ source, amount })),
      monthlyCommissions,
      withdrawalsByStatus: withdrawalRows.error ? [] : ((withdrawalRows.data || []) as any[]).map((r) => ({ status: r.status, count: Number(r.request_count), total: Number(r.total_amount) })),
    });
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const totalWithdrawals = useMemo(() => stats?.withdrawalsByStatus.reduce((sum, row) => sum + row.total, 0) || 0, [stats]);

  const savePrice = async (pkg: PackageRow) => {
    const price = Number(draftPrices[pkg.package_code]);
    if (!Number.isFinite(price) || price <= 0) {
      setError(`Enter a valid price for ${pkg.package_name}.`);
      return;
    }
    setSaving(pkg.package_code);
    setSaved(null);
    setError(null);
    const { error: saveError } = await (supabase as any).rpc('update_bhrealtor_package_price', {
      p_package_code: pkg.package_code,
      p_price: price,
    });
    setSaving(null);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setSaved(pkg.package_code);
    await load();
    window.setTimeout(() => setSaved(null), 2200);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="animate-spin mr-2" size={20} /> Loading BHRealtors funnel…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-white/70 via-white/35 to-estate-purple/10 dark:from-white/10 dark:via-white/5 dark:to-estate-purple/10 backdrop-blur-2xl shadow-xl p-6 md:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-estate-purple/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-estate-purple/10 px-3 py-1 text-xs text-estate-purple mb-3"><ShieldCheck size={14} /> Admin-controlled BHRealtors network</div>
            <h2 className="text-2xl md:text-3xl font-bold">BHRealtors Funnel</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Track recruitment, package distribution, network income, property-sale commissions and withdrawals from one glass dashboard.</p>
          </div>
          <Button variant="outline" className="bg-white/40 backdrop-blur-md" onClick={() => void load()}><RefreshCw size={15} className="mr-2" /> Refresh</Button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatTile icon={Users} label="Registered" value={stats?.totalRegistered || 0} />
        <StatTile icon={UserPlus} label="Active PBOs" value={stats?.totalPbo || 0} />
        <StatTile icon={Network} label="Sponsored members" value={stats?.totalWithDownline || 0} />
        <StatTile icon={TrendingUp} label="Total commissions" value={formatNaira(stats?.totalCommission || 0)} />
        <StatTile icon={Wallet} label="Available" value={formatNaira(stats?.availableCommission || 0)} detail={`${formatNaira(stats?.lockedCommission || 0)} locked`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 rounded-3xl border-white/30 bg-white/45 dark:bg-white/5 backdrop-blur-xl shadow-lg">
          <CardHeader><CardTitle className="text-base">Commission trend</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyCommissions || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => [formatNaira(v), 'Commission']} />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--estate-purple))" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/30 bg-white/45 dark:bg-white/5 backdrop-blur-xl shadow-lg">
          <CardHeader><CardTitle className="text-base">Income sources</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            {stats?.commissionBySource.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.commissionBySource} dataKey="amount" nameKey="source" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {stats.commissionBySource.map((entry, index) => <Cell key={entry.source} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatNaira(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No commission records yet.</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="rounded-3xl border-white/30 bg-white/45 dark:bg-white/5 backdrop-blur-xl shadow-lg">
          <CardHeader><CardTitle className="text-base">Realtors by package</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.byPackage || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="package" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--estate-purple))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/30 bg-white/45 dark:bg-white/5 backdrop-blur-xl shadow-lg">
          <CardHeader><CardTitle className="text-base">Withdrawal overview</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.withdrawalsByStatus || []).map((row) => (
                <div key={row.status} className="flex items-center justify-between rounded-xl bg-white/45 dark:bg-white/5 px-4 py-3">
                  <div><p className="font-medium capitalize">{row.status}</p><p className="text-xs text-muted-foreground">{row.count} request{row.count === 1 ? '' : 's'}</p></div>
                  <p className="font-semibold">{formatNaira(row.total)}</p>
                </div>
              ))}
              {!stats?.withdrawalsByStatus.length && <p className="text-sm text-muted-foreground py-8 text-center">No withdrawal requests yet.</p>}
              <div className="border-t border-white/30 pt-3 flex justify-between text-sm"><span className="text-muted-foreground">All withdrawal requests</span><span className="font-semibold">{formatNaira(totalWithdrawals)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-white/30 bg-white/45 dark:bg-white/5 backdrop-blur-xl shadow-lg overflow-hidden">
        <CardHeader className="border-b border-white/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div><CardTitle className="text-base">Membership package pricing</CardTitle><p className="text-xs text-muted-foreground mt-1">Admins can change the amount paid for each BHRealtor package. Commission rates remain controlled by the business rules.</p></div>
            <span className="text-[11px] rounded-full bg-emerald-500/10 text-emerald-700 px-3 py-1">Admin controlled</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.package_code} className="rounded-2xl border border-white/40 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-4">
                <div className="flex items-center justify-between mb-3"><div><p className="font-semibold">{pkg.package_name}</p><p className="text-[11px] text-muted-foreground">Direct {pkg.direct_commission_pct}% · Indirect {pkg.indirect_commission_pct}%</p></div><span className="text-[10px] rounded-full bg-estate-purple/10 text-estate-purple px-2 py-1">{pkg.withdrawable ? 'Withdrawable' : 'Locked'}</span></div>
                <div className="flex gap-2">
                  <div className="relative flex-1"><span className="absolute left-3 top-2.5 text-xs text-muted-foreground">₦</span><Input className="pl-7 bg-white/60" inputMode="numeric" value={draftPrices[pkg.package_code] || ''} onChange={(e) => setDraftPrices((prev) => ({ ...prev, [pkg.package_code]: e.target.value.replace(/[^0-9.]/g, '') }))} /></div>
                  <Button size="icon" onClick={() => void savePrice(pkg)} disabled={saving === pkg.package_code} title="Save package price">{saving === pkg.package_code ? <Loader2 size={16} className="animate-spin" /> : saved === pkg.package_code ? <ShieldCheck size={16} /> : <Save size={16} />}</Button>
                </div>
                {Number(draftPrices[pkg.package_code]) <= 5000 && <p className="mt-2 text-[11px] text-amber-700">Membership referral commission: none at ₦5,000 or below.</p>}
                {Number(draftPrices[pkg.package_code]) > 5000 && <p className="mt-2 text-[11px] text-emerald-700">Membership referral commission activates above ₦5,000.</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMlmFunnelDashboard;
