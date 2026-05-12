import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ArrowLeft, Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PhoneContactBar from '@/components/PhoneContactBar';
import { Button } from '@/components/ui/button';
import { getAnnouncementById, announcementItems } from '@/data/announcements';
import { toast } from '@/hooks/use-toast';

const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setJsonLd = (id: string, data: object) => {
  let el = document.head.querySelector<HTMLScriptElement>(`script[id="${id}"]`);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

const removeJsonLd = (id: string) => {
  const el = document.head.querySelector<HTMLScriptElement>(`script[id="${id}"]`);
  if (el) el.remove();
};

const ARTICLE_LD_ID = 'announcement-article-jsonld';
const BREADCRUMB_LD_ID = 'announcement-breadcrumb-jsonld';

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const AnnouncementArticle = () => {
  const { id } = useParams<{ id: string }>();
  const article = id ? getAnnouncementById(id) : undefined;

  useEffect(() => {
    if (!article) {
      document.title = 'Announcement Not Found | Bridgefort Homes Development Ltd';
      removeJsonLd(ARTICLE_LD_ID);
      removeJsonLd(BREADCRUMB_LD_ID);
      return;
    }
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const desc = article.text.slice(0, 158);
    const plainText = stripHtml(article.fullContent);
    const wordCount = plainText ? plainText.split(/\s+/).length : 0;
    const datePublished = article.datePublished || new Date().toISOString().slice(0, 10);
    const dateModified = article.dateModified || datePublished;

    document.title = `${article.title} | Bridgefort Homes Development Ltd`;
    setMeta('description', desc);
    setMeta('og:title', article.title, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:type', 'article', 'property');
    setMeta('og:image', article.img, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:site_name', 'Bridgefort Homes Development Ltd', 'property');
    setMeta('article:published_time', datePublished, 'property');
    setMeta('article:modified_time', dateModified, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', article.title);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', article.img);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    setJsonLd(ARTICLE_LD_ID, {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: desc,
      image: article.img,
      url: url,
      datePublished,
      dateModified,
      wordCount,
      author: {
        '@type': 'Organization',
        name: 'Bridgefort Homes Development Ltd',
        url: 'https://pwanbridgefort.ng',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Bridgefort Homes Development Ltd',
        logo: {
          '@type': 'ImageObject',
          url: 'https://pwanbridgefort.ng/lovable-uploads/PropertyHero.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
    });

    setJsonLd(BREADCRUMB_LD_ID, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: origin || '/' },
        { '@type': 'ListItem', position: 2, name: 'Announcements', item: `${origin}/#announcements` },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    });

    return () => {
      removeJsonLd(ARTICLE_LD_ID);
      removeJsonLd(BREADCRUMB_LD_ID);
    };
  }, [article]);

  const handleShare = async () => {
    const shareData = {
      title: article?.title ?? 'Bridgefort Announcement',
      text: article?.text ?? '',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link copied', description: 'Shareable link copied to clipboard.' });
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <PhoneContactBar />

      <main className="flex-grow pt-28 pb-16">
        <div className="container-custom max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center text-estate-blue hover:underline text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Announcements
            </Link>
            {article && (
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            )}
          </div>

          {!article ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <h1 className="text-2xl font-bold text-estate-blue mb-3">Announcement not found</h1>
              <p className="text-gray-600 mb-6">
                The announcement you're looking for may have been moved or removed.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {announcementItems.slice(0, 3).map((a) => (
                  <Link
                    key={a.id}
                    to={`/announcements/${a.id}`}
                    className="text-sm bg-estate-blue/10 text-estate-blue px-3 py-1.5 rounded-full hover:bg-estate-blue/20"
                  >
                    {a.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <article className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="w-full bg-gray-100 flex items-center justify-center max-h-[70vh] sm:max-h-[60vh]">
                <img
                  src={article.img}
                  alt={article.title}
                  className="w-full h-auto max-h-[70vh] sm:max-h-[60vh] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/lovable-uploads/PropertyHero.png';
                  }}
                />
              </div>

              <div className="p-5 sm:p-8 md:p-10">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-estate-blue leading-tight mb-4">
                  {article.title}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                  {article.text}
                </p>

                <div
                  className="prose prose-slate prose-base sm:prose-lg max-w-none
                    prose-headings:text-estate-blue prose-headings:font-bold
                    prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3
                    prose-p:leading-relaxed prose-p:my-4
                    prose-img:rounded-lg prose-img:shadow prose-img:my-6
                    prose-li:my-1 prose-strong:text-gray-900
                    prose-a:text-estate-blue hover:prose-a:underline"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(article.fullContent, {
                      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'span', 'br', 'div'],
                      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style'],
                    }),
                  }}
                />
              </div>
            </article>
          )}

          {article && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-estate-blue mb-4">More Announcements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {announcementItems
                  .filter((a) => a.id !== article.id)
                  .slice(0, 4)
                  .map((a) => (
                    <Link
                      key={a.id}
                      to={`/announcements/${a.id}`}
                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition flex gap-3"
                    >
                      <img
                        src={a.img}
                        alt={a.title}
                        className="w-20 h-20 object-contain bg-gray-100 rounded flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/lovable-uploads/PropertyHero.png';
                        }}
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-estate-blue line-clamp-2">{a.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{a.text}</p>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnnouncementArticle;
