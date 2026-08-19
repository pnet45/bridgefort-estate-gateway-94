import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Film, Images, Maximize2, Play, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CircularGallery3D from '@/components/gallery/CircularGallery3D';
import GalleryLightbox from '@/components/gallery/GalleryLightbox';
import { supabase } from '@/integrations/supabase/client';
import type { GalleryMediaItem, GalleryMediaType } from '@/types/gallery';

type GalleryFilter = 'all' | GalleryMediaType;

const filters: { id: GalleryFilter; label: string }[] = [
  { id: 'all', label: 'All moments' },
  { id: 'image', label: 'Photography' },
  { id: 'video', label: 'Film' },
];

const GalleryPage = () => {
  const [mediaItems, setMediaItems] = useState<GalleryMediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('all');

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

  const filteredItems = useMemo(
    () => activeFilter === 'all' ? mediaItems : mediaItems.filter((item) => item.media_type === activeFilter),
    [activeFilter, mediaItems],
  );

  const circularItems = useMemo(
    () => filteredItems.map((item) => ({
      image: item.poster_url || item.media_url,
      text: item.caption || (item.media_type === 'video' ? 'Bridgefort film' : 'Bridgefort moment'),
    })),
    [filteredItems],
  );

  const imageCount = mediaItems.filter((item) => item.media_type === 'image').length;
  const videoCount = mediaItems.filter((item) => item.media_type === 'video').length;
  const featuredItem = mediaItems[0];

  const galleryCardSize = (index: number) => {
    const position = index % 7;
    if (position === 0) return 'md:col-span-2 md:row-span-2';
    if (position === 3 || position === 6) return 'md:row-span-2';
    return '';
  };

  const scrollToCollection = () => {
    document.getElementById('gallery-collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <Navbar />

      <main className="pt-[88px] lg:pt-[104px]">
        <section className="relative isolate overflow-hidden border-b border-white/10">
          {featuredItem && (
            <div
              className="absolute inset-0 -z-20 bg-cover bg-center opacity-35"
              style={{ backgroundImage: `url("${featuredItem.poster_url || featuredItem.media_url}")` }}
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,0.98)_0%,rgba(2,6,23,0.88)_48%,rgba(2,6,23,0.58)_100%)]" />
          <div className="absolute -left-32 top-0 -z-10 h-96 w-96 rounded-full bg-estate-blue/25 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-estate-purple/25 blur-3xl" aria-hidden="true" />

          <div className="container-custom grid min-h-[510px] items-end gap-12 py-16 md:min-h-[570px] md:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.55fr)] lg:py-24">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100 backdrop-blur-md"
              >
                <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
                The Bridgefort journal
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: 0.06 }}
                className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
              >
                Every space has a story worth <span className="text-amber-200">stepping into.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: 0.12 }}
                className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-lg"
              >
                Explore the people, places, progress, and property experiences that shape life at Bridgefort Homes.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
                type="button"
                onClick={scrollToCollection}
                className="mt-9 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-black/20 transition duration-200 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Explore the collection
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            </div>

            <motion.aside
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.36, delay: 0.16 }}
              className="grid grid-cols-3 gap-3 self-end rounded-3xl border border-white/15 bg-slate-950/55 p-4 backdrop-blur-xl lg:grid-cols-1"
              aria-label="Gallery overview"
            >
              <div className="border-r border-white/10 px-2 py-2 lg:border-r-0 lg:border-b lg:pb-4">
                <p className="text-2xl font-black text-white">{mediaItems.length || '—'}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">Stories</p>
              </div>
              <div className="border-r border-white/10 px-2 py-2 lg:border-r-0 lg:border-b lg:py-4">
                <p className="text-2xl font-black text-white">{imageCount || '—'}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">Images</p>
              </div>
              <div className="px-2 py-2 lg:pt-4">
                <p className="text-2xl font-black text-white">{videoCount || '—'}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">Films</p>
              </div>
            </motion.aside>
          </div>
        </section>

        <section id="gallery-collection" className="scroll-mt-28 bg-slate-50 py-14 text-slate-950 md:py-20">
          <div className="container-custom">
            <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-estate-blue">The collection</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">A closer look at Bridgefort.</h2>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Select any image or film to view it in full. Drag through the visual reel for a more immersive tour.
                </p>
              </div>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter gallery media">
                {filters.map((filter) => {
                  const isActive = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveFilter(filter.id)}
                      aria-pressed={isActive}
                      className={`min-h-11 rounded-full px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-blue focus-visible:ring-offset-2 ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-md'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {loadingMedia ? (
              <div className="mt-10 grid gap-4 md:grid-cols-3" aria-label="Loading gallery">
                {[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl bg-slate-200" />)}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Images className="mx-auto h-8 w-8 text-estate-blue" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold text-slate-950">Nothing published here yet.</h3>
                <p className="mt-2 text-sm text-slate-600">Try another view, or check back soon for new Bridgefort stories.</p>
              </div>
            ) : (
              <>
                {circularItems.length > 1 && (
                  <div className="mt-10 overflow-hidden rounded-[2rem] bg-slate-950 p-1 shadow-2xl shadow-slate-300">
                    <div className="flex items-center justify-between px-5 pt-5 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Visual reel</p>
                      <p className="text-xs text-slate-400">Drag to browse, double-click or double-tap to open</p>
                    </div>
                    <div className="h-[390px] md:h-[480px]">
                      <CircularGallery3D
                        items={circularItems}
                        bend={2.4}
                        textColor="#f8fafc"
                        borderRadius={0.16}
                        font="bold 24px Figtree"
                        fontUrl="https://fonts.googleapis.com/css2?family=Figtree:wght@500;700&display=swap"
                        scrollEase={0.08}
                        scrollSpeed={2.3}
                        onItemClick={(index) => setActiveIndex(index)}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-10 grid auto-rows-[220px] gap-4 md:grid-cols-3 md:auto-rows-[240px] lg:grid-cols-4">
                  {filteredItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`group relative min-h-[220px] overflow-hidden rounded-3xl bg-slate-900 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-blue focus-visible:ring-offset-4 ${galleryCardSize(index)}`}
                      aria-label={`Open ${item.caption || (item.media_type === 'video' ? 'gallery video' : 'gallery image')}`}
                    >
                      <img
                        src={item.poster_url || item.media_url}
                        alt={item.caption || 'Bridgefort gallery item'}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                            {item.media_type === 'video' ? 'Film' : 'Photography'}
                          </p>
                          {item.caption && <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug">{item.caption}</h3>}
                        </div>
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition duration-200 group-hover:bg-white group-hover:text-slate-950">
                          {item.media_type === 'video'
                            ? <Play className="h-4 w-4" fill="currentColor" aria-hidden="true" />
                            : <Maximize2 className="h-4 w-4" aria-hidden="true" />
                          }
                        </span>
                      </div>
                      {item.media_type === 'video' && (
                        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-slate-950/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                          <Film className="h-3.5 w-3.5" aria-hidden="true" />
                          Video
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <GalleryLightbox items={filteredItems} initialIndex={activeIndex} onClose={() => setActiveIndex(null)} />
      <Footer />
    </div>
  );
};

export default GalleryPage;
