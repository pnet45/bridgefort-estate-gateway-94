import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Megaphone, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type Promotion = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  image_url: string | null;
  starts_at: string;
  ends_at: string | null;
  campaign_period_label: string | null;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });

const HomePromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('bh_realtor_promotions')
        .select('id,title,slug,summary,image_url,starts_at,ends_at,campaign_period_label')
        .eq('status', 'published')
        .order('display_order', { ascending: true })
        .order('starts_at', { ascending: false })
        .limit(4);
      if (error) {
        console.error('Home promotions load failed:', error);
        setPromotions([]);
      } else {
        setPromotions((data || []) as Promotion[]);
      }
      setLoading(false);
    };
    void load();
  }, []);

  const visible = useMemo(() => promotions.slice(0, 3), [promotions]);

  if (!loading && !visible.length) return null;

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--estate-purple)/.12),transparent_35%),radial-gradient(circle_at_80%_30%,hsl(var(--estate-green)/.12),transparent_35%)]" />
      <div className="container-custom relative">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/45 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-estate-purple shadow-sm backdrop-blur-xl dark:bg-white/[0.05]">
              <Sparkles className="h-3.5 w-3.5" /> Latest promotions
            </div>
            <h2 className="mt-3 text-3xl font-black text-estate-blue dark:text-white md:text-5xl">Opportunities worth knowing about</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-200 md:text-base">
              From property campaigns to Realtor opportunities, see what Bridgefort Homes is offering right now.
            </p>
          </div>
          <Link to="/bh-realtors" className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/55 px-4 py-2.5 text-sm font-bold text-estate-blue shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-white/[0.06] dark:text-white">
            Explore BHRealtors <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-[2rem] bg-white/35 dark:bg-white/[0.04]" />)}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {visible.map((promo, index) => (
              <article key={promo.id} className={`group overflow-hidden rounded-[2rem] border border-white/25 bg-white/50 shadow-xl shadow-slate-900/5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-950/60 ${index === 0 ? 'md:scale-[1.02]' : ''}`}>
                <div className="relative aspect-[1/1] overflow-hidden bg-gradient-to-br from-estate-blue via-slate-900 to-estate-purple">
                  {promo.image_url ? (
                    <img src={promo.image_url} alt={promo.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-white">
                      <Megaphone className="h-12 w-12 opacity-80" />
                      <p className="mt-4 text-xl font-black">{promo.title}</p>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent p-5 pt-16">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xl">
                      <CalendarDays className="h-3.5 w-3.5" /> {promo.campaign_period_label || formatDate(promo.starts_at)}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-black text-slate-950 dark:text-white">{promo.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-200">{promo.summary}</p>
                  <Link to={`/bh-realtors/promotions/${promo.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-estate-purple transition group-hover:gap-3">
                    View Full Promo <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomePromotions;
