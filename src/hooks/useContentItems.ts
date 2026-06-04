import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ContentItem, ContentPage, ContentType } from '@/types/content';

interface Options {
  page?: ContentPage;
  contentType?: ContentType | ContentType[];
  includeUnpublished?: boolean;
  featuredOnly?: boolean;
}

export function useContentItems(opts: Options = {}) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
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
    if (error) setError(error.message);
    else setItems((data as ContentItem[]) || []);
    setLoading(false);
  }, [opts.page, JSON.stringify(opts.contentType), opts.includeUnpublished, opts.featuredOnly]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    const channel = supabase
      .channel('content_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchItems]);

  return { items, loading, error, refresh: fetchItems };
}
