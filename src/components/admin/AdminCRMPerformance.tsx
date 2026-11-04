import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, CalendarCheck, RefreshCw, Target, Trophy, Users } from 'lucide-react';

type PerformanceRow = {
  id: string;
  name: string;
  leads: number;
  won: number;
  lost: number;
  winRate: number;
  wonValue: number;
  completedFollowUps: number;
  pendingFollowUps: number;
  points: number;
};

const naira = (value: number) => new Intl.NumberFormat('en-NG', {
  style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
}).format(value);
const AdminCRMPerformance: React.FC = () => {
  const [rows, setRows] = useState<PerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const { data, error: resultError } = await supabase.rpc('get_crm_staff_performance', {
      p_month_start: monthStart.toISOString(),
      p_month_end: monthEnd.toISOString(),
    });

    if (resultError) {
      setError(resultError.message || 'Could not load CRM performance.');
      setLoading(false);
      return;
    }

    const nextRows: PerformanceRow[] = (data || []).map(member => {
      const leads = Number(member.new_leads || 0);
      const won = Number(member.won_leads || 0);
      const lost = Number(member.lost_leads || 0);
      const completedFollowUps = Number(member.completed_follow_ups || 0);
      const pendingFollowUps = Number(member.pending_follow_ups || 0);
      return {
        id: member.user_id,
        name: [member.first_name, member.last_name].filter(Boolean).join(' ') || 'Team member',
        leads,
        won,
        lost,
        winRate: won + lost ? Math.round((won / (won + lost)) * 100) : 0,
        wonValue: Number(member.won_value || 0),
        completedFollowUps,
        pendingFollowUps,
        points: leads * 5 + won * 20,
      };
    }).filter(row => row.leads || row.won || row.lost || row.completedFollowUps || row.pendingFollowUps)
      .sort((a, b) => b.points - a.points || b.wonValue - a.wonValue || b.leads - a.leads);
    setRows(nextRows);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => rows.reduce((sum, row) => ({
    leads: sum.leads + row.leads,
    won: sum.won + row.won,
    wonValue: sum.wonValue + row.wonValue,
    completed: sum.completed + row.completedFollowUps,
    pending: sum.pending + row.pendingFollowUps,
  }), { leads: 0, won: 0, wonValue: 0, completed: 0, pending: 0 }), [rows]);

  const topValue = Math.max(1, ...rows.map(row => row.points));
  const topCloser = rows.reduce<PerformanceRow | null>((best, row) => row.won > 0 && (!best || row.won > best.won) ? row : best, null);
  const topFollowThrough = rows.reduce<PerformanceRow | null>((best, row) => row.completedFollowUps > 0 && (!best || row.completedFollowUps > best.completedFollowUps) ? row : best, null);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Sales performance</h2>
          <p className="mt-1 text-sm text-muted-foreground">Monthly lead activity, conversions and completed follow-ups. Outstanding follow-ups show the current open workload.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="gap-2 self-start">
          <RefreshCw className={'h-4 w-4 ' + (loading ? 'animate-spin' : '')} />Refresh
        </Button>
      </div>

      {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'New leads this month', value: totals.leads, icon: Users },
          { label: 'Won this month', value: totals.won, icon: Target },
          { label: 'Closed value', value: naira(totals.wonValue), icon: Trophy },
          { label: 'Completed follow-ups this month', value: totals.completed, icon: CalendarCheck },
        ].map(item => (
          <Card key={item.label} className="border-border bg-card shadow-sm">
            <CardContent className="flex min-w-0 items-center gap-3 p-3 sm:p-4">
              <div className="rounded-xl bg-[#F4EEDC] p-2.5 text-[#80652F] dark:bg-[#3A3325] dark:text-[#E5CD91]"><item.icon className="h-4 w-4" /></div>
              <div className="min-w-0"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-1 truncate text-lg font-bold text-foreground">{item.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground"><Trophy className="h-5 w-5 text-[#B89A55]" />Team leaderboard</CardTitle>
          <p className="text-xs text-muted-foreground">Momentum points reward assigned lead growth and successful conversions.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading team performance…</p> :
            rows.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No assigned lead activity is available for this month yet.</p> : (
              <>
                <div className="space-y-3">
                  {rows.slice(0, 5).map((row, index) => (
                    <div key={row.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4EEDC] font-bold text-[#80652F] dark:bg-[#3A3325] dark:text-[#E5CD91]">{index + 1}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-foreground">{row.name}</p>{index === 0 && <Badge className="border-[#D6BD7B] bg-[#F4EEDC] text-[#5C4720] dark:bg-[#3A3325] dark:text-[#F0DCA9]">Top performer</Badge>}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{row.leads} leads · {row.won} won · {row.completedFollowUps} follow-ups completed on owned leads</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-[#B89A55]" style={{ width: (Math.round((row.points / topValue) * 100)) + '%' }} /></div>
                      </div>
                      <div className="shrink-0 text-right"><p className="text-sm font-bold tabular-nums text-foreground">{row.points}</p><p className="text-[10px] text-muted-foreground">points</p></div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {topCloser && <div className="rounded-xl border border-border p-3"><div className="flex items-center gap-2 text-[#B89A55]"><Award className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Top closer</span></div><p className="mt-1 text-sm font-semibold text-foreground">{topCloser.name}</p><p className="text-xs text-muted-foreground">{topCloser.won} conversions · {naira(topCloser.wonValue)}</p></div>}
                  {topFollowThrough && <div className="rounded-xl border border-border p-3"><div className="flex items-center gap-2 text-[#B89A55]"><CalendarCheck className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Most follow-ups completed on owned leads</span></div><p className="mt-1 text-sm font-semibold text-foreground">{topFollowThrough.name}</p><p className="text-xs text-muted-foreground">{topFollowThrough.completedFollowUps} follow-ups completed</p></div>}
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-muted text-xs text-muted-foreground"><tr><th className="px-3 py-2.5 font-semibold">Team member</th><th className="px-3 py-2.5 font-semibold">New leads</th><th className="px-3 py-2.5 font-semibold">Won</th><th className="px-3 py-2.5 font-semibold">Lost</th><th className="px-3 py-2.5 font-semibold">Win rate</th><th className="px-3 py-2.5 font-semibold">Won value</th><th className="px-3 py-2.5 font-semibold">Outstanding follow-ups</th></tr></thead>
                    <tbody>{rows.map(row => <tr key={row.id} className="border-t border-border"><td className="px-3 py-2.5 font-medium text-foreground">{row.name}</td><td className="px-3 py-2.5 tabular-nums">{row.leads}</td><td className="px-3 py-2.5 tabular-nums">{row.won}</td><td className="px-3 py-2.5 tabular-nums">{row.lost}</td><td className="px-3 py-2.5 tabular-nums">{row.winRate}%</td><td className="px-3 py-2.5 tabular-nums">{naira(row.wonValue)}</td><td className="px-3 py-2.5 tabular-nums">{row.pendingFollowUps}</td></tr>)}</tbody>
                  </table>
                </div>
              </>
            )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Points formula: 5 per new lead and 20 per won lead. Follow-up activity is shown against the assigned lead owner because the current CRM schema does not record a separate person who completed each follow-up. Commission and individual sales targets are not shown because those values are not stored in the current CRM data model.</p>
    </div>
  );
};

export default AdminCRMPerformance;
