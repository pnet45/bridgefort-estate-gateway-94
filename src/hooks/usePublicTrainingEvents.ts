import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { readPublicDataCache, writePublicDataCache } from '@/lib/publicDataCache';

export interface PublicTrainingEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  image: string | null;
  capacity: string;
  category: string;
  featured: boolean;
}

const CACHE_KEY = 'public-training-events';
let snapshot = readPublicDataCache<PublicTrainingEvent[]>(CACHE_KEY) ?? [];
let pendingRequest: Promise<PublicTrainingEvent[]> | null = null;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
const listeners = new Set<(events: PublicTrainingEvent[]) => void>();

function publish(events: PublicTrainingEvent[]) {
  snapshot = events;
  writePublicDataCache(CACHE_KEY, events);
  listeners.forEach((listener) => listener(events));
}

/** Fetch one public dataset; concurrent page sections share the same request. */
export function refreshPublicTrainingEvents(): Promise<PublicTrainingEvent[]> {
  if (pendingRequest) return pendingRequest;

  pendingRequest = (async () => {
    const { data, error } = await supabase
      .from('training_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    const events = (data ?? []) as PublicTrainingEvent[];
    publish(events);
    return events;
  })()
    .catch((error) => {
      console.error('Unable to refresh public training events; keeping the cached snapshot.', error);
      return snapshot;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

function ensureRealtimeSubscription() {
  if (realtimeChannel) return;

  realtimeChannel = supabase
    .channel('public-training-events-cache')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'training_events' }, () => {
      void refreshPublicTrainingEvents();
    })
    .subscribe();
}

/**
 * Public training events use stale-while-revalidate: cached cards render
 * immediately, and only this dataset is refreshed after its own DB changes.
 */
export function usePublicTrainingEvents() {
  const [events, setEvents] = useState<PublicTrainingEvent[]>(snapshot);
  const [loading, setLoading] = useState(snapshot.length === 0);

  useEffect(() => {
    let active = true;
    const listener = (nextEvents: PublicTrainingEvent[]) => {
      if (!active) return;
      setEvents(nextEvents);
      setLoading(false);
    };

    listeners.add(listener);
    ensureRealtimeSubscription();

    const refresh = () => {
      void refreshPublicTrainingEvents().then((nextEvents) => {
        if (!active) return;
        setEvents(nextEvents);
        setLoading(false);
      });
    };

    refresh();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) refresh();
    };
    window.addEventListener('focus', refreshWhenVisible);
    window.addEventListener('online', refreshWhenVisible);

    return () => {
      active = false;
      listeners.delete(listener);
      window.removeEventListener('focus', refreshWhenVisible);
      window.removeEventListener('online', refreshWhenVisible);

      if (listeners.size === 0 && realtimeChannel) {
        void supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    };
  }, []);

  return { events, loading };
}
