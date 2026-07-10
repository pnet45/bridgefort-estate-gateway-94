import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Eye, Crown, Medal, Award, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Row {
  property_id: string;
  name: string;
  location: string | null;
  views: number;
}

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-gray-300" />;
  if (rank === 3) return <Award className="h-4 w-4 text-orange-400" />;
  return <span className="text-slate-400 text-sm font-bold">#{rank}</span>;
};

const AdminEstateViewsLeaderboard: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data: estates, error: estatesError } = await supabase
        .from('estate')
        .select('id, name, location');

      if (estatesError) throw estatesError;

      // Get an exact view count PER estate directly from the database using
      // head+count requests. This avoids the default 1000-row client fetch
      // limit silently under-counting popular estates, and avoids mixing in
      // "listing" type views which live in the same table.
      const counted: Row[] = await Promise.all(
        (estates || []).map(async (e: any) => {
          const { count, error } = await supabase
            .from('property_views')
            .select('id', { count: 'exact', head: true })
            .eq('property_id', e.id)
            .eq('property_type', 'estate');

          if (error) {
            console.error('Error counting views for estate', e.id, error);
          }

          return {
            property_id: e.id,
            name: e.name,
            location: e.location,
            views: count || 0,
          };
        })
      );

      const merged = counted.sort((a, b) => b.views - a.views);
      setTotalViews(merged.reduce((sum, r) => sum + r.views, 0));
      setRows(merged.slice(0, 10));
    } catch (err) {
      console.error('Error loading estate views leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    // Keep the leaderboard live: refresh whenever a new view row is inserted.
    const channel = supabase
      .channel('estate-views-leaderboard')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'property_views' },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Most Viewed Estates
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-900/60 text-white gap-1">
              <Eye className="h-3 w-3" />
              {totalViews.toLocaleString()} total
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-white"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-slate-400 text-sm py-6 text-center">Loading leaderboard…</div>
        ) : rows.length === 0 ? (
          <div className="text-slate-400 text-sm py-6 text-center">No view data yet.</div>
        ) : (
          <ol className="space-y-2">
            {rows.map((r, idx) => {
              const rank = idx + 1;
              return (
                <li
                  key={r.property_id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    rank === 1
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : rank === 2
                      ? 'bg-gray-400/10 border-gray-400/30'
                      : rank === 3
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-slate-700/40 border-slate-600/50'
                  }`}
                >
                  <div className="w-8 flex justify-center">{rankIcon(rank)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{r.name}</p>
                    {r.location && (
                      <p className="text-xs text-slate-400 truncate">{r.location}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="bg-slate-900/60 text-white gap-1">
                    <Eye className="h-3 w-3" />
                    {r.views.toLocaleString()}
                  </Badge>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminEstateViewsLeaderboard;
