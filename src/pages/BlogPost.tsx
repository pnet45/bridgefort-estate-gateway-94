
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogDetail from '@/components/blog/BlogDetail';
import BlogNewsletter from '@/components/blog/BlogNewsletter';
import PhoneContactBar from '@/components/PhoneContactBar';
import { realEstateArticles } from '@/data/realEstateContent';
import { listenForPublicDataRevalidation, readPublicDataCache, subscribePublicDataCache, writePublicDataCache } from '@/lib/publicDataCache';

// Convert markdown-ish content to basic HTML for rendering in BlogDetail
const markdownToHtml = (content: string) =>
  content
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2 text-estate-brown mt-6">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-estate-blue mt-8">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-estate-blue">$1</h1>')
    .replace(/^\s*[-*] (.*)$/gm, '<li class="mb-1">$1</li>')
    .replace(/(<li[\s\S]*?<\/li>)(\n(?!<li))/g, '<ul class="list-disc pl-7 my-4">$1</ul>$2')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4">');

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const initialCache = id ? readPublicDataCache<{ post: any; authorProfile: any }>(`public-blog-detail:${id}`) : null;
  const [post, setPost] = useState<any>(initialCache?.post || null);
  const [authorProfile, setAuthorProfile] = useState<any>(initialCache?.authorProfile || null);
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    // Static editorial articles are bundled with the application and need no
    // database round-trip or browser cache.
    const staticArticle = realEstateArticles.find((article: any) => article.id === id);
    if (staticArticle) {
      setPost({
        id: staticArticle.id,
        title: staticArticle.title,
        excerpt: staticArticle.excerpt,
        content: `<p class="mb-4">${markdownToHtml(staticArticle.content)}</p>`,
        category: staticArticle.category,
        image_path: staticArticle.image,
        created_at: staticArticle.date,
      });
      setAuthorProfile({ first_name: 'Bridgefort', last_name: 'Homes' });
      setError(null);
      setLoading(false);
      return () => { active = false; };
    }

    const cacheKey = `public-blog-detail:${id}`;
    const cached = readPublicDataCache<{ post: any; authorProfile: any }>(cacheKey);
    if (cached) {
      setPost(cached.post);
      setAuthorProfile(cached.authorProfile);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .eq('published', true)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          window.localStorage.removeItem(`bridgefort:public-data:v1:${cacheKey}`);
          if (active) {
            setError('Post not found or not published');
            setPost(null);
            setAuthorProfile(null);
            setLoading(false);
          }
          return;
        }

        let nextAuthor: any = null;
        if (data.author_id) {
          const { data: author } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', data.author_id)
            .maybeSingle();
          nextAuthor = author || null;
        }

        if (!active) return;
        writePublicDataCache(cacheKey, { post: data, authorProfile: nextAuthor });
        setPost(data);
        setAuthorProfile(nextAuthor);
        setError(null);
      } catch (fetchError) {
        console.error('Error fetching post:', fetchError);
        if (active && !cached) {
          setError('Failed to load the post');
          setPost(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchPost();
    const channel = supabase
      .channel(`public_blog_detail_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        const previous = payload.old as Record<string, unknown> | undefined;
        const next = payload.new as Record<string, unknown> | undefined;
        if (previous?.id === id || next?.id === id) void fetchPost();
      })
      .subscribe();
    const stopRevalidation = listenForPublicDataRevalidation(() => void fetchPost());
    const stopCacheSync = subscribePublicDataCache<{ post: any; authorProfile: any }>(cacheKey, (next) => {
      setPost(next.post);
      setAuthorProfile(next.authorProfile);
      setLoading(false);
    });

    return () => {
      active = false;
      stopRevalidation();
      stopCacheSync();
      void supabase.removeChannel(channel);
    };
  }, [id]);

  // Pass author profile to BlogDetail as "profiles"
  let mergedPost = post;
  if (post && authorProfile) {
    mergedPost = { ...post, profiles: authorProfile };
  }

  // SEO + JSON-LD (Article + BreadcrumbList) injection
  useEffect(() => {
    if (!mergedPost) return;

    const ARTICLE_LD_ID = 'blog-article-jsonld';
    const BREADCRUMB_LD_ID = 'blog-breadcrumb-jsonld';
    const url = `${window.location.origin}/blog/${mergedPost.id}`;
    const authorName = authorProfile
      ? `${authorProfile.first_name ?? ''} ${authorProfile.last_name ?? ''}`.trim() || 'Bridgefort Homes Development Ltd'
      : 'Bridgefort Homes Development Ltd';

    // Strip HTML to compute wordCount
    const plain = (mergedPost.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plain ? plain.split(' ').length : 0;

    document.title = `${mergedPost.title} | Bridgefort Homes Development Ltd`;

    const setMeta = (key: string, value: string, attr: 'name' | 'property' = 'name') => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    setMeta('description', mergedPost.excerpt || mergedPost.title);
    setMeta('og:title', mergedPost.title, 'property');
    setMeta('og:description', mergedPost.excerpt || mergedPost.title, 'property');
    setMeta('og:image', mergedPost.image_path || '', 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', 'article', 'property');
    setMeta('article:published_time', mergedPost.created_at, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', mergedPost.title);
    setMeta('twitter:description', mergedPost.excerpt || mergedPost.title);
    if (mergedPost.image_path) setMeta('twitter:image', mergedPost.image_path);

    const setJsonLd = (id: string, data: object) => {
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement('script');
        el.id = id;
        el.type = 'application/ld+json';
        document.head.appendChild(el);
      }
      el.text = JSON.stringify(data);
    };

    setJsonLd(ARTICLE_LD_ID, {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: mergedPost.title,
      description: mergedPost.excerpt,
      image: mergedPost.image_path ? [mergedPost.image_path] : undefined,
      datePublished: mergedPost.created_at,
      dateModified: mergedPost.updated_at || mergedPost.created_at,
      wordCount,
      author: { '@type': 'Person', name: authorName },
      publisher: {
        '@type': 'Organization',
        name: 'Bridgefort Homes Development Ltd',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/placeholder.svg`,
        },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    });

    setJsonLd(BREADCRUMB_LD_ID, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${window.location.origin}/blog` },
        { '@type': 'ListItem', position: 3, name: mergedPost.title, item: url },
      ],
    });

    return () => {
      document.getElementById(ARTICLE_LD_ID)?.remove();
      document.getElementById(BREADCRUMB_LD_ID)?.remove();
    };
  }, [mergedPost, authorProfile]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PhoneContactBar />

      <main className="flex-grow pt-28 pb-12">
        {loading ? (
          <div className="container-custom space-y-6 py-10" aria-label="Loading article">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="aspect-[16/9] animate-pulse rounded-3xl bg-muted" />
            <div className="h-9 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : error ? (
          <div className="container-custom">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-xl text-red-800 font-medium mb-2">Error</h2>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : mergedPost ? (
          <>
            <BlogDetail post={mergedPost} />
            <BlogNewsletter />
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;

