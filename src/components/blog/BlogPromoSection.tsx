import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, Building2, Sprout, Users } from 'lucide-react';

const promos = [
  {
    title: '5K Daily Promo',
    eyebrow: 'LAND OWNERSHIP MADE EASIER',
    text: 'Start your land ownership journey with flexible Daily, Weekly or Monthly savings options.',
    image: '/lovable-uploads/5k-daily-flyer.webp',
    href: '/5k-daily-promo',
    icon: BadgePercent,
    className: 'from-violet-950 via-purple-900 to-purple-700',
    cta: 'View Promo',
  },
  {
    title: 'Bridgefort Agrovest',
    eyebrow: 'AGRICULTURE & PRODUCTIVITY',
    text: 'Explore food crops, cash crops, aquaculture and livestock participation through the Agrovest programme.',
    image: '/lovable-uploads/agrovest-oil-palm-plantation.jpg',
    href: '/agrovest',
    icon: Sprout,
    className: 'from-emerald-950 via-green-900 to-emerald-700',
    cta: 'Explore Agrovest',
  },
  {
    title: 'BHRealtors',
    eyebrow: 'GROW WITH BRIDGEFORT',
    text: 'Build relationships, refer genuine buyers and grow your real estate sales network.',
    image: '/images/Luxury Homes.jpeg',
    href: '/bh-realtors',
    icon: Users,
    className: 'from-slate-950 via-estate-blue to-slate-800',
    cta: 'Join BHRealtors',
  },
  {
    title: 'Featured Properties',
    eyebrow: 'FIND YOUR NEXT PROPERTY',
    text: 'Browse Bridgefort Homes properties and discover opportunities for home ownership and investment.',
    image: '/lovable-uploads/Bridgefort County - Ikota .jpg',
    href: '/properties',
    icon: Building2,
    className: 'from-estate-blue via-slate-900 to-indigo-950',
    cta: 'Browse Properties',
  },
];

const BlogPromoSection: React.FC = () => (
  <section className="relative overflow-hidden bg-slate-950 py-14 text-white md:py-20">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.24),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(30,64,175,.2),transparent_32%)]" />
    <div className="container-custom relative">
      <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-300">Bridgefort opportunities</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Promos, programmes & property opportunities</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            From flexible land ownership plans to Agrovest and BHRealtors, explore what is available and choose what fits your next move.
          </p>
        </div>
        <Link to="/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-violet-200">
          Explore all opportunities <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {promos.map(({ title, eyebrow, text, image, href, icon: Icon, className, cta }) => (
          <article key={title} className="group relative min-h-[300px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
            <img src={image} alt={title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 group-hover:scale-105 group-hover:opacity-55" />
            <div className={`absolute inset-0 bg-gradient-to-br ${className} opacity-80`} />
            <div className="relative flex min-h-[300px] flex-col justify-between p-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white backdrop-blur-md">
                  <Icon className="h-3.5 w-3.5" /> {eyebrow}
                </span>
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/80">{text}</p>
              </div>
              <Link to={href} className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100">
                {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default BlogPromoSection;
