import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ContentItem, ContentPage, ContentType } from '@/types/content';

interface Options {
  page?: ContentPage;
  contentType?: ContentType | ContentType[];
  includeUnpublished?: boolean;
  featuredOnly?: boolean;
}

type ContentCache = { savedAt: number; items: ContentItem[] };
const CACHE_PREFIX = 'bridgefort:content-items:v1:';

const readContentCache = (key: string): ContentItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ContentCache;
    return Array.isArray(parsed?.items) ? parsed.items : [];
  } catch {
    return [];
  }
};

const writeContentCache = (key: string, items: ContentItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), items } satisfies ContentCache));
  } catch {
    // Storage may be unavailable or full. The live database response still renders.
  }
};

export function useContentItems(opts: Options = {}) {
  const contentTypeKey = Array.isArray(opts.contentType)
    ? [...opts.contentType].sort().join(',')
    : opts.contentType || '';
  const cacheKey = useMemo(() => CACHE_PREFIX + JSON.stringify({
    page: opts.page || '',
    contentType: contentTypeKey,
    featuredOnly: Boolean(opts.featuredOnly),
  }), [opts.page, contentTypeKey, opts.featuredOnly]);

  // Published CMS content is safe to reuse as an instant page placeholder.
  // Unpublished/admin-only content is deliberately never written to browser storage.
  const canCache = !opts.includeUnpublished;
  const [items, setItems] = useState<ContentItem[]>(() => canCache ? readContentCache(cacheKey) : []);
  const [loading, setLoading] = useState(() => !canCache || readContentCache(cacheKey).length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (canCache) {
      const cached = readContentCache(cacheKey);
      if (cached.length) setItems(cached);
    }
    let query = (supabase as any).from('content_items').select('*');
    if (opts.page) query = query.eq('page', opts.page);
    if (opts.contentType) {
      if (Array.isArray(opts.contentType)) query = query.in('content_type', opts.contentType);
      else query = query.eq('content_type', opts.contentType);
    }
    if (!opts.includeUnpublished) query = query.eq('is_published', true);
    if (opts.featuredOnly) query = query.eq('is_featured', true);
    query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      setError(error.message);
    } else {
      const nextItems = (data as ContentItem[]) || [];
      setItems(nextItems);
      setError(null);
      if (canCache) writeContentCache(cacheKey, nextItems);
    }
    setLoading(false);
  }, [cacheKey, canCache, opts.page, contentTypeKey, opts.includeUnpublished, opts.featuredOnly]);

  // When the content filter changes, show that filter's cached content immediately,
  // then refresh only this content_items query from Supabase.
  useEffect(() => {
    const cached = canCache ? readContentCache(cacheKey) : [];
    setItems(cached);
    setLoading(cached.length === 0);
    setError(null);
    void fetchItems();
  }, [cacheKey, canCache, fetchItems]);

  useEffect(() => {
    const channel = supabase
      .channel('content_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, () => { void fetchItems(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchItems]);

  return { items, loading, error, refresh: fetchItems };
}
