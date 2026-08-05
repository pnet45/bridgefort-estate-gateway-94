import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CircularGallery from '@/components/gallery/CircularGallery';

const galleryHighlights = [
  { title: 'Luxury Residences', value: '18+', text: 'curated homes and apartments' },
  { title: 'Prime Locations', value: '6', text: 'high-demand communities' },
  { title: 'Client Experience', value: '5★', text: 'service loyalty and trust' },
];

const GalleryPage = () => {
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
                  A curated collection of our most compelling homes, communities, and spaces — designed to showcase the quality, vision, and elegance behind every Bridgefort experience.
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
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">Featured moments</p>
              <h2 className="mt-4 text-3xl font-black text-white md:text-4xl">Refined spaces, real living.</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  image: '/lovable-uploads/PropertyHero.png',
                  title: 'Premium properties',
                  text: 'Contemporary architecture and reliable value in sought-after locations.',
                },
                {
                  image: '/lovable-uploads/agrovest-estate-1.jpg',
                  title: 'Peaceful estates',
                  text: 'Welcoming communities built for comfort, growth, and long-term lifestyle value.',
                },
                {
                  image: '/lovable-uploads/Homeheroimage2222.png',
                  title: 'Distinctive living',
                  text: 'From spacious family homes to elegant modern apartments, every detail feels intentional.',
                },
              ].map((card) => (
                <div key={card.title} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_20px_60px_rgba(15,23,42,0.5)]">
                  <img src={card.image} alt={card.title} className="h-72 w-full object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{card.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GalleryPage;
