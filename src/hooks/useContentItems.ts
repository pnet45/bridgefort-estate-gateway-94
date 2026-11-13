import { useEffect, useState, useCallback, useMemo, useId } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ContentItem, ContentPage, ContentType } from '@/types/content';
import { listenForPublicDataRevalidation, readPublicDataCache, refreshPublicDataCache, subscribePublicDataCache, writePublicDataCache } from '@/lib/publicDataCache';

const CACHE_PREFIX = 'public-content-items:';

interface Options {
  page?: ContentPage;
  contentType?: ContentType | ContentType[];
  includeUnpublished?: boolean;
  featuredOnly?: boolean;
}

const readContentCache = (key: string): ContentItem[] => readPublicDataCache<ContentItem[]>(key) || [];
const writeContentCache = (key: string, items: ContentItem[]) => writePublicDataCache(key, items);

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

  const requestKey = canCache ? cacheKey : `${cacheKey}:private-unpublished`;

  const fetchItems = useCallback(async () => {
    if (canCache) {
      const cached = readContentCache(cacheKey);
      if (cached.length) setItems(cached);
    }
    try {
      const nextItems = await refreshPublicDataCache(requestKey, async () => {
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
        if (error) throw error;
        const result = (data as ContentItem[]) || [];
        if (canCache) writeContentCache(cacheKey, result);
        return result;
      });
      setItems(nextItems);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to refresh published content.');
    } finally {
      setLoading(false);
    }
  }, [cacheKey, requestKey, canCache, opts.page, contentTypeKey, opts.includeUnpublished, opts.featuredOnly]);

  // When the content filter changes, show that filter's cached content immediately,
  // then refresh only this content_items query from Supabase.
  useEffect(() => {
    const cached = canCache ? readContentCache(cacheKey) : [];
    setItems(cached);
    setLoading(cached.length === 0);
    setError(null);
    void fetchItems();
  }, [cacheKey, canCache, fetchItems]);

  const channelId = useId().replace(/[^a-zA-Z0-9]/g, '');
  useEffect(() => {
    const matchesCurrentFilter = (row: Record<string, unknown> | undefined) => {
      if (!row) return true;
      // Realtime DELETE payloads can contain only primary-key columns when
      // REPLICA IDENTITY is DEFAULT. Missing filter columns must be treated as
      // unknown (and refreshed), not as a non-match that leaves stale cards.
      if (opts.page && 'page' in row && row.page !== opts.page) return false;
      if (opts.contentType && 'content_type' in row) {
        const acceptedTypes = Array.isArray(opts.contentType) ? opts.contentType : [opts.contentType];
        if (!acceptedTypes.includes(row.content_type as ContentType)) return false;
      }
      if (!opts.includeUnpublished && 'is_published' in row && row.is_published !== true) return false;
      if (opts.featuredOnly && 'is_featured' in row && row.is_featured !== true) return false;
      return true;
    };

    const channel = supabase
      .channel(`content_items_changes_${channelId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, (payload) => {
        const previous = payload.old as Record<string, unknown> | undefined;
        const next = payload.new as Record<string, unknown> | undefined;
        if (matchesCurrentFilter(previous) || matchesCurrentFilter(next)) void fetchItems();
      })
      .subscribe();
    const stopRevalidation = listenForPublicDataRevalidation(() => void fetchItems());
    const stopCacheSync = canCache
      ? subscribePublicDataCache<ContentItem[]>(cacheKey, setItems)
      : () => undefined;
    return () => {
      stopRevalidation();
      stopCacheSync();
      void supabase.removeChannel(channel);
    };
  }, [channelId, fetchItems, opts.page, contentTypeKey, opts.includeUnpublished, opts.featuredOnly]);

  return { items, loading, error, refresh: fetchItems };
}
