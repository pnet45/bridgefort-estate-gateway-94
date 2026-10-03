import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Trophy, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardRow {
  pbo_id: string;
  first_name: string | null;
  last_initial: string | null;
  current_package: string | null;
  current_rank: string | null;
  downline_count: number;
}

const ReferralLeaderboard = () => {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    const { data, error } = await (supabase as any)
      .from('pbo_referral_leaderboard')
      .select('*')
      .limit(10);
    if (!error) setRows((data || []) as LeaderboardRow[]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { void load(); }, []);

  return (
    <Card className="border border-slate-200/80 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <CardHeader className="border-b border-slate-100 dark:border-white/10">
        <CardTitle className="flex items-center justify-between gap-3 text-lg">
          <span className="flex items-center gap-2"><Trophy className="h-5 w-5 text-estate-gold" /> Referral performance</span>
          <Button type="button" variant="ghost" size="icon" onClick={() => void load()} disabled={refreshing} aria-label="Refresh referral leaderboard">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-5">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading referral performance</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center dark:border-white/10">
            <Users className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 font-medium text-slate-900 dark:text-white">No referral activity yet</p>
            <p className="mt-1 text-sm text-slate-500">Share your referral link to start building your network.</p>
          </div>
        ) : (
          <ol className="space-y-2">
            {rows.map((row, index) => (
              <li key={row.pbo_id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3 dark:border-white/5 dark:bg-white/[0.03]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 text-center text-sm font-bold text-slate-400">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-white">{row.first_name || 'Realtor'} {row.last_initial ? `${row.last_initial}.` : ''}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {row.current_rank && <span className="rounded-full bg-estate-blue/10 px-2 py-0.5 text-[11px] text-estate-blue">{row.current_rank}</span>}
                      {row.current_package && <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] capitalize text-slate-500">{row.current_package.replace(/_/g, ' ')}</span>}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-estate-purple">{row.downline_count} {row.downline_count === 1 ? 'direct' : 'directs'}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralLeaderboard;
