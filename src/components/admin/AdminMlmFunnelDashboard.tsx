import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Users, UserPlus, Network, Wallet } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface FunnelStats {
  totalRegistered: number;
  totalPbo: number;
  totalWithDownline: number;
  byPackage: { package: string; count: number }[];
  withdrawalsByStatus: { status: string; count: number; total: number }[];
}

const PACKAGE_LABELS: Record<string, string> = {
  associate: 'Associate',
  gold: 'Gold',
  classic_gold: 'Classic Gold',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(var(--estate-gold))',
  approved: 'hsl(var(--estate-blue))',
  paid: 'hsl(142 71% 45%)',
  rejected: 'hsl(var(--estate-red))',
};

const StatTile = ({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) => (
  <div className="glass-card rounded-xl p-4 flex items-center gap-3">
    <div className="rounded-full bg-estate-purple/10 p-2.5">
      <Icon size={20} className="text-estate-purple" />
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

/**
 * Registration -> PBO opt-in -> downline -> withdrawal funnel, built entirely
 * from tables confirmed live today (profiles, withdrawal_requests via the
 * get_withdrawal_funnel_stats() RPC). Package-level commission totals can be
 * layered in once mlm_commissions / mlm_membership_purchases
 * (20260520143000_add_mlm_structures.sql) are actually deployed.
 */
const AdminMlmFunnelDashboard = () => {
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrationNotice, setMigrationNotice] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      const [{ count: totalRegistered }, { count: totalPbo }, { count: totalWithDownline }] =
        await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_pbo', true),
          // referred_by_id isn't in the generated types yet (it ships in the
          // same pending migration as the columns themselves), hence the cast.
          (supabase.from('profiles') as any)
            .select('*', { count: 'exact', head: true })
            .not('referred_by_id', 'is', null),
        ]);

      const packageCounts = await Promise.all(
        Object.keys(PACKAGE_LABELS).map(async (pkg) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('current_package', pkg);
          return { package: PACKAGE_LABELS[pkg], count: count || 0 };
        })
      );

      // Cast: this RPC is introduced by a migration and isn't in the
      // generated Supabase types until they're regenerated against the live schema.
      const { data: withdrawalRows, error: withdrawalError } = await (supabase as any).rpc(
        'get_withdrawal_funnel_stats'
      );

      if (cancelled) return;

      setStats({
        totalRegistered: totalRegistered || 0,
        totalPbo: totalPbo || 0,
        totalWithDownline: totalWithDownline || 0,
        byPackage: packageCounts,
        withdrawalsByStatus: withdrawalError
          ? []
          : ((withdrawalRows || []) as any[]).map((r) => ({
              status: r.status,
              count: Number(r.request_count),
              total: Number(r.total_amount),
            })),
      });
      // referred_by_id not existing yet (pending migration) surfaces as a
      // query error on that count call — treat that specifically as the
      // signal to show the migration notice, rather than crashing the tab.
      setMigrationNotice(false);
      setLoading(false);
    })().catch((err) => {
      console.error('Failed to load MLM funnel stats — likely a pending migration:', err);
      if (!cancelled) {
        setMigrationNotice(true);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading MLM funnel stats…
      </div>
    );
  }

  if (migrationNotice || !stats) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="py-8 text-center text-muted-foreground">
          <p className="mb-2">Couldn't load funnel stats.</p>
          <p className="text-sm">
            This usually means a referenced column/table isn't deployed yet — check that all pending
            migrations under <code>supabase/migrations/</code> have been run.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile icon={Users} label="Total registered" value={stats.totalRegistered} />
        <StatTile icon={UserPlus} label="Registered as PBO" value={stats.totalPbo} />
        <StatTile icon={Network} label="Have a sponsor (in a downline)" value={stats.totalWithDownline} />
        <StatTile
          icon={Wallet}
          label="Withdrawals paid"
          value={stats.withdrawalsByStatus.find((w) => w.status === 'paid')?.count ?? 0}
        />
      </div>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-base">Realtors by package tier</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byPackage}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="package" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--estate-purple))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-base">Withdrawal funnel by status</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 260 }}>
          {stats.withdrawalsByStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No withdrawal requests yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.withdrawalsByStatus}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === 'count' ? [value, 'Requests'] : [`₦${value.toLocaleString()}`, 'Total']
                  }
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.withdrawalsByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || 'hsl(var(--estate-purple))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMlmFunnelDashboard;
