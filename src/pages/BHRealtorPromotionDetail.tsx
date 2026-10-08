import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Promotion = {
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
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' });

const BHRealtorPromotionDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!slug) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('bh_realtor_promotions')
        .select('title,slug,summary,content,terms_and_conditions,image_url,starts_at,ends_at,campaign_period_label,status')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error) console.error('Promotion detail load failed:', error);
      setPromotion((data as Promotion | null) || null);
      setLoading(false);
    };
    void load();
  }, [slug]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950"><div className="h-8 w-8 animate-spin rounded-full border-2 border-estate-purple border-t-transparent" /></div>;

  if (!promotion) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/65 p-8 text-center shadow-xl backdrop-blur-2xl dark:bg-slate-950/70">
          <Megaphone className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Promotion not found</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">This promotion may have been archived or is no longer available.</p>
          <Link to="/bh-realtors"><Button className="mt-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to BHRealtors</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <main className="container-custom py-24">
        <Link to="/bh-realtors" className="inline-flex items-center gap-2 text-sm font-semibold text-estate-purple"><ArrowLeft className="h-4 w-4" /> Back to BHRealtors</Link>
        <article className="mt-6 overflow-hidden rounded-[2rem] border border-white/20 bg-white/65 shadow-2xl backdrop-blur-2xl dark:bg-slate-950/70">
          {promotion.image_url && <img src={promotion.image_url} alt={promotion.title} className="max-h-[720px] w-full object-contain bg-slate-950/5 md:max-h-[820px]" />}
          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">Published</Badge>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-300"><CalendarDays className="h-3.5 w-3.5" />{promotion.campaign_period_label || (promotion.ends_at ? `${formatDate(promotion.starts_at)} – ${formatDate(promotion.ends_at)}` : formatDate(promotion.starts_at))}</span>
            </div>
            <h1 className="mt-4 text-3xl font-black text-estate-blue dark:text-white md:text-5xl">{promotion.title}</h1>
            <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600 dark:text-slate-200">{promotion.summary}</p>

            <section className="mt-8 border-t border-slate-200/70 pt-8 dark:border-white/10">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">Promotion Details</h2>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{promotion.content}</div>
            </section>

            <section className="mt-10 rounded-3xl border border-white/20 bg-white/45 p-5 backdrop-blur-xl dark:bg-white/[0.04] sm:p-7">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">Terms & Conditions</h2>
              <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{promotion.terms_and_conditions}</div>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
};

export default BHRealtorPromotionDetail;
