import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Search, Share2, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppChat from '@/components/WhatsAppChat';
import PhoneContactBar from '@/components/PhoneContactBar';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogPromoSection from '@/components/blog/BlogPromoSection';
import BlogNewsletter from '@/components/blog/BlogNewsletter';
import MarketUpdates from '@/components/blog/MarketUpdates';
import YouTubeSection from '@/components/blog/YouTubeSection';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { realEstateArticles } from '@/data/realEstateContent';
import { shareArticle } from '@/utils/blogUtils';
import type { BlogPost } from '@/types/blog';

const PAGE_SIZE = 9;

const Blog = () => {
  const { posts, loading } = useBlogPosts(50);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allArticles = useMemo<BlogPost[]>(() => {
    const staticArticles: BlogPost[] = realEstateArticles.map((article) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      image_path: article.image,
      created_at: article.date,
      category: article.category,
    }));

    return [...staticArticles, ...posts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [posts]);

  const categories = useMemo(() => {
    const values = Array.from(new Set(allArticles.map((post) => post.category).filter(Boolean)));
    return ['All', ...values.slice(0, 8)];
  }, [allArticles]);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allArticles.filter((post) => {
      const matchesCategory = category === 'All' || post.category === category;
      const matchesSearch = !query || [post.title, post.excerpt, post.category].join(' ').toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [allArticles, category, search]);

  const featured = filteredArticles[0];
  const secondary = filteredArticles.slice(1, 4);
  const latest = filteredArticles.slice(4, visibleCount + 4);
  const hasMore = filteredArticles.length > visibleCount + 4;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />
      <PhoneContactBar />
      <BlogHeader />

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="container-custom py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => { setCategory(item); setVisibleCount(PAGE_SIZE); }}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${category === item ? 'border-estate-blue bg-estate-blue text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-estate-blue/30 hover:text-estate-blue'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <label className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 lg:max-w-sm">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="sr-only">Search articles</span>
                <input
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE); }}
                  placeholder="Search the Bridgefort Journal..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="container-custom py-10 md:py-14">
          {loading ? (
            <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
              <div className="h-[420px] animate-pulse rounded-3xl bg-slate-200" />
              <div className="space-y-5">{[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}</div>
            </div>
          ) : featured ? (
            <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
              <article className="group relative min-h-[420px] overflow-hidden rounded-3xl bg-slate-950 shadow-2xl">
                <img src={featured.image_path} alt={featured.title} className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                <div className="relative flex min-h-[420px] flex-col justify-end p-6 md:p-9">
                  <span className="w-fit rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">{featured.category}</span>
                  <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-white md:text-5xl">{featured.title}</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">{featured.excerpt}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link to={`/blog/${featured.id}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-slate-100">Read story <ArrowRight className="h-4 w-4" /></Link>
                    <button type="button" onClick={() => shareArticle(featured.id, featured.title)} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"><Share2 className="h-4 w-4" /> Share</button>
                  </div>
                </div>
              </article>

              <aside className="space-y-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-estate-purple">Editor's picks</p><h2 className="mt-1 text-2xl font-black">Worth reading</h2></div>
                {secondary.map((post) => (
                  <Link key={post.id} to={`/blog/${post.id}`} className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <img src={post.image_path} alt={post.title} className="h-24 w-28 shrink-0 rounded-xl object-cover" loading="lazy" />
                    <div className="min-w-0 py-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-estate-purple">{post.category}</p>
                      <h3 className="mt-1 line-clamp-3 text-sm font-bold leading-5 text-slate-900 group-hover:text-estate-blue">{post.title}</h3>
                      <p className="mt-2 text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString('en-NG')}</p>
                    </div>
                  </Link>
                ))}
              </aside>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-400" />
              <h2 className="mt-4 text-xl font-bold">No stories found</h2>
              <p className="mt-2 text-sm text-slate-500">Try another search or category.</p>
            </div>
          )}
        </section>

        <BlogPromoSection />

        <section id="latest" className="container-custom scroll-mt-24 py-12 md:py-16">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-estate-purple">The Journal</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">Latest stories</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Real estate news, investment education, company stories and practical ideas from the Bridgefort ecosystem.</p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><TrendingUp className="h-4 w-4" /> {filteredArticles.length} stories</div>
          </div>

          {latest.length ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((post) => (
                  <article key={post.id} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <Link to={`/blog/${post.id}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
                      <img src={post.image_path} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                      <span className="absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">{post.category}</span>
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(post.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-xl font-bold leading-7 text-slate-900 group-hover:text-estate-blue">{post.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{post.excerpt}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-estate-blue">Read article <ArrowRight className="h-4 w-4" /></Link>
                        <button type="button" aria-label={`Share ${post.title}`} onClick={() => shareArticle(post.id, post.title)} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-estate-blue/30 hover:text-estate-blue"><Share2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 text-center">
                  <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="inline-flex items-center gap-2 rounded-xl bg-estate-blue px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-estate-darkBlue">Load more stories <ArrowRight className="h-4 w-4" /></button>
                </div>
              )}
            </>
          ) : null}
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="container-custom grid gap-6 py-12 md:grid-cols-2 md:py-16">
            <div className="rounded-3xl bg-slate-950 p-7 text-white shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Stay informed</p>
              <h2 className="mt-2 text-2xl font-black">Get useful property updates.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Subscribe for real estate insights, Bridgefort news and new opportunities.</p>
              <Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-violet-200">Talk to Bridgefort <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-estate-purple">Trending topics</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Land ownership', 'Investment', 'Market Updates', 'Property', 'Technology', 'Bridgefort News'].map((item) => (
                  <button key={item} type="button" onClick={() => { setSearch(item); setCategory('All'); setVisibleCount(PAGE_SIZE); document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth' }); }} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-estate-blue/30 hover:text-estate-blue">{item}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <MarketUpdates />
        <YouTubeSection />
        <BlogNewsletter />
      </main>

      <Footer />
      <WhatsAppChat />
    </div>
  );
};

export default Blog;
