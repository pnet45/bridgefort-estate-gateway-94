import { motion } from 'framer-motion';

export type GalleryItem = {
  title: string;
  subtitle: string;
  image: string;
  accent: string;
};

const defaultItems: GalleryItem[] = [
  {
    title: 'Signature Estates',
    subtitle: 'Luxury living',
    image: '/lovable-uploads/Homeheroimage2222.png',
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    title: 'Garden Living',
    subtitle: 'Curated comfort',
    image: '/lovable-uploads/PropertyHero.png',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Prime Design',
    subtitle: 'Architectural detail',
    image: '/lovable-uploads/5 Bedroom Lekki Phase 1 (1).jpg',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Lifestyle',
    subtitle: 'Modern spaces',
    image: '/lovable-uploads/5 Bedroom Lekki Phase 1 (2).jpg',
    accent: 'from-pink-500 to-rose-500',
  },
  {
    title: 'City Views',
    subtitle: 'Premium locations',
    image: '/lovable-uploads/5 Bedroom Lekki Phase 1 (3).jpg',
    accent: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Nature',
    subtitle: 'Calm & balance',
    image: '/lovable-uploads/agrovest-hero-1.jpg',
    accent: 'from-lime-500 to-green-500',
  },
];

interface CircularGalleryProps {
  items?: GalleryItem[];
}

export function CircularGallery({ items = defaultItems }: CircularGalleryProps) {
  const radius = 200;

  return (
    <div className="relative mx-auto h-[440px] w-full max-w-[560px]">
      <div className="absolute inset-6 rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.2),rgba(15,23,42,0.3)_40%,rgba(15,23,42,0.7)_78%,rgba(2,6,23,0.95)_100%)] shadow-[0_0_80px_rgba(168,85,247,0.15)]" />

      {items.map((item, index) => {
        const angle = (360 / items.length) * index - 90;
        const radians = (angle * Math.PI) / 180;
        const x = Math.cos(radians) * radius;
        const y = Math.sin(radians) * radius;

        return (
          <motion.div
            key={`${item.title}-${index}`}
            className="absolute left-1/2 top-1/2"
            animate={{ x, y }}
            transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 1.2 }}
            style={{ translateX: '-50%', translateY: '-50%' }}
          >
            <div className="group relative h-28 w-28 overflow-hidden rounded-full border border-white/20 bg-slate-900/60 shadow-2xl shadow-violet-950/30 ring-2 ring-white/10 backdrop-blur-sm sm:h-32 sm:w-32">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-35`} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-2 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">{item.subtitle}</p>
              </div>
            </div>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-violet-300/40 bg-slate-950/85 p-4 text-center shadow-[0_0_60px_rgba(168,85,247,0.2)] backdrop-blur-xl sm:h-48 sm:w-48"
      >
        <div className="mb-2 inline-flex rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-violet-200">
          Bridgefort
        </div>
        <h3 className="text-lg font-bold text-white sm:text-xl">Gallery</h3>
        <p className="mt-1 max-w-[8rem] text-[11px] leading-relaxed text-slate-300">
          Signature homes, premium spaces, and memorable living.
        </p>
      </motion.div>
    </div>
  );
}

export default CircularGallery;
