import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Eye, Crown, Medal, Award } from 'lucide-react';
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

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [viewsRes, estatesRes] = await Promise.all([
          supabase.from('property_views').select('property_id'),
          supabase.from('estate').select('id, name, location'),
        ]);
        const counts = new Map<string, number>();
        (viewsRes.data || []).forEach((v: any) => {
          counts.set(v.property_id, (counts.get(v.property_id) || 0) + 1);
        });
        const estates = estatesRes.data || [];
        const merged: Row[] = estates
          .map((e: any) => ({
            property_id: e.id,
            name: e.name,
            location: e.location,
            views: counts.get(e.id) || 0,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);
        setRows(merged);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Most Viewed Estates
        </CardTitle>
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
