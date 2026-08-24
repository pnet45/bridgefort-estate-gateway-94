import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2, Users, Copy, Share2, QrCode, Wallet, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
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

const ReferralLeaderboard = () => {
  const { user, profile } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const referralCode = profile?.pbo_referral_code || '';
  const referralLink = useMemo(() => {
    if (!referralCode || typeof window === 'undefined') return '';
    return `${window.location.origin}/bridgefort-realtors-login?ref=${encodeURIComponent(referralCode)}`;
  }, [referralCode]);
  const qrUrl = useMemo(() => referralLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(referralLink)}`
    : '', [referralLink]);

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

  const copyReferral = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    toast({ title: 'Referral link copied', description: 'Share your link with people you want to introduce to BHRealtors.' });
  };

  const shareReferral = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BHRealtors',
          text: 'Join Bridgefort Homes Realtors with my referral link.',
          url: referralLink,
        });
      } catch (e: any) {
        if (e?.name !== 'AbortError') await copyReferral();
      }
    } else await copyReferral();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      {user && referralCode && (
        <Card className="overflow-hidden border-white/15 bg-white/70 shadow-xl backdrop-blur-2xl dark:bg-slate-950/75">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <QrCode className="h-5 w-5 text-estate-purple" />
              Your Referral Center
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="mx-auto shrink-0 rounded-3xl border border-white/30 bg-white p-3 shadow-lg dark:bg-white">
                <img src={qrUrl} alt="BHRealtor referral QR code" className="h-44 w-44 rounded-2xl" loading="lazy" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-estate-purple">Scan or share</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Grow your Realtor network</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-200">Anyone who registers through this link is connected to your referral network. Share it directly or let them scan your QR code.</p>
                <div className="mt-4 rounded-2xl border border-white/15 bg-slate-950/5 p-3 dark:bg-white/5">
                  <p className="break-all text-xs text-slate-600 dark:text-slate-300">{referralLink}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => void copyReferral()} className="bg-estate-blue text-white hover:bg-estate-blue/90"><Copy className="mr-2 h-4 w-4" /> Copy Link</Button>
                  <Button onClick={() => void shareReferral()} variant="outline" className="border-white/20 bg-white/50 dark:bg-white/5"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                  <Link to="/bh-realtors/withdraw"><Button variant="outline" className="border-white/20 bg-white/50 dark:bg-white/5"><Wallet className="mr-2 h-4 w-4" /> Withdraw <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              <Loader2 className="mr-2 animate-spin" size={18} /> Loading leaderboard…
            </div>
          ) : error ? (
            <p className="py-4 text-sm text-muted-foreground">Leaderboard isn't available right now. Try again shortly.</p>
          ) : rows.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="mx-auto mb-2 opacity-50" size={28} />
              <p className="text-sm">No downlines yet — be the first PBO to build one.</p>
            </div>
          ) : (
            <ol className="space-y-2">
              {rows.map((row, index) => (
                <li key={row.pbo_id} className="flex items-center justify-between rounded-lg bg-foreground/5 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`w-6 shrink-0 text-center font-bold ${medalColor(index)}`}>{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{row.first_name || 'PBO'} {row.last_initial ? `${row.last_initial}.` : ''}</p>
                      <div className="mt-0.5 flex flex-wrap gap-1.5">
                        {row.current_rank && <span className="rounded-full bg-estate-blue/10 px-2 py-0.5 text-[11px] text-estate-blue">{row.current_rank}</span>}
                        {row.current_package && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] capitalize text-slate-500">{row.current_package.replace(/_/g, ' ')} package</span>}
                      </div>
                    </div>
                  </div>
                  <span className="ml-3 whitespace-nowrap font-semibold text-estate-purple">{row.downline_count} {row.downline_count === 1 ? 'downline' : 'downlines'}</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralLeaderboard;
