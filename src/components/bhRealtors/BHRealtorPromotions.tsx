import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, Megaphone, RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Promotion = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  terms_and_conditions: string;
  image_url: string | null;
  starts_at: string;
  ends_at: string | null;
  campaign_period_label: string | null;
  status: string;
  display_order: number;
};

const glass = 'border border-white/15 bg-white/60 dark:bg-slate-950/65 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/30';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });

const BHRealtorPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    const { data, error: queryError } = await supabase
      .from('bh_realtor_promotions')
      .select('id,title,slug,summary,content,terms_and_conditions,image_url,starts_at,ends_at,status,display_order')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .order('starts_at', { ascending: false });

    if (queryError) {
      console.error('BHRealtor promotions load failed:', queryError);
      setError(true);
      setPromotions([]);
    } else {
      setPromotions((data || []) as Promotion[]);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const now = Date.now();
  const active = useMemo(
    () => promotions.filter((promo) => new Date(promo.starts_at).getTime() <= now && (!promo.ends_at || new Date(promo.ends_at).getTime() >= now)),
    [promotions, now]
  );
  const past = useMemo(
    () => promotions.filter((promo) => Boolean(promo.ends_at) && new Date(promo.ends_at as string).getTime() < now),
    [promotions, now]
  );
  const visible = tab === 'active' ? active : past;

  return (
    <section className={glass + ' overflow-hidden rounded-3xl p-5 sm:p-7'}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-estate-purple" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-estate-purple">Featured campaigns</p>
          </div>
          <h2 className="mt-1 text-2xl font-black text-estate-blue dark:text-white sm:text-3xl">Promotions & opportunities</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-200">
            Stay up to date with Bridgefort campaigns. Open any promotion to see the full marketing content and Terms & Conditions.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()} disabled={loading} className="w-fit border-white/20 bg-white/40 dark:bg-white/5">
          <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} /> Refresh
        </Button>
      </div>

      <div className="mt-6 flex w-full max-w-md rounded-2xl border border-white/20 bg-white/35 p-1.5 backdrop-blur-xl dark:bg-white/[0.04]">
        <button type="button" onClick={() => setTab('active')} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === 'active' ? 'bg-white text-slate-950 shadow-sm dark:bg-white/90' : 'text-slate-600 hover:bg-white/30 dark:text-slate-300'}`}>
          Active Promotions <span className="ml-1 opacity-60">({active.length})</span>
        </button>
        <button type="button" onClick={() => setTab('past')} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === 'past' ? 'bg-white text-slate-950 shadow-sm dark:bg-white/90' : 'text-slate-600 hover:bg-white/30 dark:text-slate-300'}`}>
          Past Promotions <span className="ml-1 opacity-60">({past.length})</span>
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-amber-300/40 bg-amber-50/60 p-6 text-sm text-amber-900 backdrop-blur-xl dark:bg-amber-950/20 dark:text-amber-100">
          Promotions could not be loaded right now. Please refresh and try again.
        </div>
      ) : loading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => <div key={item} className="h-52 animate-pulse rounded-3xl bg-white/30 dark:bg-white/[0.04]" />)}
        </div>
      ) : !visible.length ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300/70 bg-white/25 p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
          <Megaphone className="mx-auto h-9 w-9 text-slate-400" />
          <h3 className="mt-3 font-bold text-slate-900 dark:text-white">{tab === 'active' ? 'No active promotion right now' : 'No past promotions yet'}</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-300">
            {tab === 'active' ? 'When Bridgefort publishes a promotion for Realtors, it will appear here.' : 'Completed promotions will remain available here for reference.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {visible.map((promo) => (
            <article key={promo.id} className="group overflow-hidden rounded-3xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-2xl transition hover:-translate-y-1 hover:shadow-2xl dark:bg-white/[0.04]">
              {promo.image_url ? (
                <img src={promo.image_url} alt="" className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
              ) : (
                <div className="flex h-44 items-end bg-gradient-to-br from-estate-blue via-slate-900 to-estate-purple p-6">
                  <Megaphone className="h-10 w-10 text-white/80" />
                </div>
              )}
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={tab === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200'}>
                    {tab === 'active' ? 'Active' : 'Past'}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-300"><CalendarDays className="h-3.5 w-3.5" />{promo.campaign_period_label || (promo.ends_at ? `${formatDate(promo.starts_at)} – ${formatDate(promo.ends_at)}` : formatDate(promo.starts_at))}</span>
                </div>
                <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{promo.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-200">{promo.summary}</p>
                <Link to={`/bh-realtors/promotions/${promo.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-estate-purple transition group-hover:gap-3">
                  Read Full Promo <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-400"><Clock3 className="h-3.5 w-3.5" /> Terms & Conditions available on full page</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default BHRealtorPromotions;
