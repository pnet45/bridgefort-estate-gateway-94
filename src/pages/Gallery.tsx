import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CircularGallery from '@/components/gallery/CircularGallery';
import CircularGallery3D from '@/components/gallery/CircularGallery3D';
import GalleryLightbox from '@/components/gallery/GalleryLightbox';
import { supabase } from '@/integrations/supabase/client';
import type { GalleryMediaItem } from '@/types/gallery';

const galleryHighlights = [
  { title: 'Luxury Residences', value: '18+', text: 'curated homes and apartments' },
  { title: 'Prime Locations', value: '6', text: 'high-demand communities' },
  { title: 'Client Experience', value: '5★', text: 'service loyalty and trust' },
];

const GalleryPage = () => {
  const [mediaItems, setMediaItems] = useState<GalleryMediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [activeItem, setActiveItem] = useState<GalleryMediaItem | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await (supabase as any)
        .from('gallery_media_items')
        .select('*')
        .eq('is_published', true)
        .order('display_order');
      if (!error && data) setMediaItems(data as GalleryMediaItem[]);
      setLoadingMedia(false);
    };
    load();
  }, []);

  // What the 3D canvas needs: just an image + label per item.
  const circularItems = useMemo(
    () => mediaItems.map((item) => ({
      image: item.poster_url || item.media_url,
      text: item.caption || '',
    })),
    [mediaItems]
  );

  const openItem = (index: number) => {
    const item = mediaItems[index];
    if (item) setActiveItem(item);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="pt-[88px] lg:pt-[104px]">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_25%)]" />
          <div className="container-custom relative z-10 py-16 md:py-20 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-200"
                >
                  Visual Story
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                  className="mt-6 text-4xl font-black leading-tight text-white md:text-6xl"
                >
                  Discover the <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">Bridgefort</span> lifestyle.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.14 }}
                  className="mt-6 max-w-xl text-base leading-8 text-slate-300 md:text-lg"
                >
                  A curated collection of our most compelling Estates, Events, communities, and spaces — designed to showcase the quality, vision, and elegance behind every Bridgefort experience.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.18 }}
                  className="mt-8 grid gap-4 sm:grid-cols-3"
                >
                  {galleryHighlights.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <div className="text-2xl font-black text-violet-200">{item.value}</div>
                      <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{item.title}</div>
                      <p className="mt-2 text-sm text-slate-400">{item.text}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              <div className="flex justify-center">
                <CircularGallery />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-slate-900/60 py-16 md:py-20">
          <div className="container-custom">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">Bridgefort Homes Gallery</p>
              <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Step inside, look around.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                Scroll or drag through moments from our estates and events — click any piece to open it full screen.
              </p>
            </div>

            {!loadingMedia && circularItems.length > 0 && (
              <div style={{ height: '600px', position: 'relative' }} className="mb-14">
                <CircularGallery3D
                  items={circularItems}
                  bend={3}
                  textColor="#ffffff"
                  borderRadius={0.21}
                  scrollEase={0.09}
                  fontUrl="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap"
                  font="bold 30px Orbitron"
                  scrollSpeed={2.7}
                  onItemClick={openItem}
                />
              </div>
            )}

            {loadingMedia ? (
              <p className="text-center text-sm text-slate-400">Loading gallery…</p>
            ) : mediaItems.length === 0 ? (
              <p className="text-center text-sm text-slate-400">No gallery items published yet.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {mediaItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveItem(item)}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 text-left shadow-[0_20px_60px_rgba(15,23,42,0.5)] transition-transform hover:-translate-y-1"
                  >
                    <div className="relative h-72 w-full overflow-hidden">
                      <img
                        src={item.poster_url || item.media_url}
                        alt={item.caption || 'Gallery item'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {item.media_type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                            <Play className="h-5 w-5 text-white" fill="white" />
                          </div>
                        </div>
                      )}
                      {item.media_type === 'video' && (
                        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                          <Film className="h-3 w-3" /> Video
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      {item.caption && <h3 className="text-xl font-bold text-white">{item.caption}</h3>}
                      {item.event_description && (
                        <p className="mt-3 text-sm leading-7 text-slate-300">{item.event_description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <GalleryLightbox item={activeItem} onClose={() => setActiveItem(null)} />

      <Footer />
    </div>
  );
};

export default GalleryPage;
