import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Loader2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardRow {
  pbo_id: string;
  first_name: string | null;
  last_initial: string | null;
  current_package: string | null;
  current_rank: string | null;
  downline_count: number;
}

const medalColor = (rank: number) => {
  if (rank === 0) return 'text-estate-gold';
  if (rank === 1) return 'text-muted-foreground';
  if (rank === 2) return 'text-estate-brown';
  return 'text-muted-foreground/50';
};

/**
 * Referral leaderboard. Ranking is based on verified direct/downline count;
 * membership package/rank is displayed separately and never changes the
 * property-sale commission rule.
 */
const ReferralLeaderboard = () => {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: fetchError } = await (supabase as any)
        .from('pbo_referral_leaderboard')
        .select('*')
        .limit(10);

      if (cancelled) return;
      if (fetchError) setError(fetchError.message);
      else setRows((data || []) as LeaderboardRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="text-estate-gold" size={20} />
          Referral Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" size={18} /> Loading leaderboard…
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground py-4">Leaderboard isn't available right now. Try again shortly.</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto mb-2 opacity-50" size={28} />
            <p className="text-sm">No downlines yet — be the first PBO to build one.</p>
          </div>
        ) : (
          <ol className="space-y-2">
            {rows.map((row, index) => (
              <li key={row.pbo_id} className="flex items-center justify-between rounded-lg px-3 py-2 bg-foreground/5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`font-bold w-6 text-center shrink-0 ${medalColor(index)}`}>{index + 1}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {row.first_name || 'PBO'} {row.last_initial ? `${row.last_initial}.` : ''}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {row.current_rank && (
                        <span className="text-[11px] rounded-full bg-estate-blue/10 text-estate-blue px-2 py-0.5">
                          {row.current_rank}
                        </span>
                      )}
                      {row.current_package && (
                        <span className="text-[11px] rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 capitalize">
                          {row.current_package.replace(/_/g, ' ')} package
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="font-semibold text-estate-purple whitespace-nowrap ml-3">
                  {row.downline_count} {row.downline_count === 1 ? 'downline' : 'downlines'}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralLeaderboard;
