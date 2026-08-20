import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingForm from '@/components/listings/ListingForm';
import { Loader2, ArrowDown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const ListingFormPage = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
      if (error || !data) { toast.error('Listing not found'); return navigate('/listings/my'); }
      setData(data);
      setLoading(false);
    })();
  }, [id, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70 dark:bg-slate-950">
      <Navbar />

      <section className="relative overflow-hidden pt-24 sm:pt-28 pb-16 sm:pb-20 bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.35),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.10),transparent_28%),linear-gradient(135deg,#071329_0%,#0d1f3d_52%,#180c17_100%)]" />
        <div className="absolute -top-32 left-[18%] h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-44 right-[8%] h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="container-custom relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-xl text-xs font-semibold tracking-wide">
              <Sparkles className="h-4 w-4 text-primary" /> Bridgefort Marketplace
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02]">
              {id ? 'Update your property listing' : 'Put your property in front of the right people.'}
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg leading-7 text-white/70">
              {id
                ? 'Update your details, improve your photos and submit the listing for another review.'
                : 'Share the details buyers need, add your best photos and let Bridgefort review your listing before it goes live.'}
            </p>
            <button type="button" onClick={() => document.getElementById('listing-form')?.scrollIntoView({ behavior: 'smooth' })} className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur-xl hover:bg-white/15 transition">
              Start listing <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <main id="listing-form" className="flex-1 py-10 sm:py-14 scroll-mt-20">
        {/* Narrow, focused desktop layout: roughly half the previous form width. */}
        <div className="container-custom max-w-xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <ListingForm listingId={id} initialData={data || undefined} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingFormPage;
