import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { bhRealtorsPackages, type BhRealtorsPackage } from '@/data/bhRealtorsPackages';
import { readPublicDataCache, writePublicDataCache } from '@/lib/publicDataCache';

const CACHE_KEY = 'public-bhrealtor-packages';
let snapshot = readPublicDataCache<BhRealtorsPackage[]>(CACHE_KEY) ?? bhRealtorsPackages;
let pendingRequest: Promise<BhRealtorsPackage[]> | null = null;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
const listeners = new Set<(packages: BhRealtorsPackage[]) => void>();

function publish(packages: BhRealtorsPackage[]) {
  snapshot = packages;
  writePublicDataCache(CACHE_KEY, packages);
  listeners.forEach((listener) => listener(packages));
}

export function refreshPublicMlmPackages(): Promise<BhRealtorsPackage[]> {
  if (pendingRequest) return pendingRequest;

  pendingRequest = (async () => {
    const { data, error } = await supabase
      .from('mlm_packages')
      .select('package_code, package_name, price, direct_commission_pct, indirect_commission_pct, withdrawable, description, sales_commission_pct, sales_commission_locked, first_level_sales_commission_pct')
      .order('price');

    if (error) throw error;
    const packages = (data?.length ? data : bhRealtorsPackages) as BhRealtorsPackage[];
    publish(packages);
    return packages;
  })()
    .catch((error) => {
      console.warn('Unable to refresh public BHRealtors packages; keeping cached pricing.', error);
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
    .channel('public-bhrealtor-packages-cache')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mlm_packages' }, () => {
      void refreshPublicMlmPackages();
    })
    .subscribe();
}

/** Public package pricing only; private wallet, sales and commission data are never cached. */
export function usePublicMlmPackages() {
  const [packages, setPackages] = useState<BhRealtorsPackage[]>(snapshot);
  const [loading, setLoading] = useState(snapshot.length === 0);

  useEffect(() => {
    let active = true;
    const listener = (nextPackages: BhRealtorsPackage[]) => {
      if (!active) return;
      setPackages(nextPackages);
      setLoading(false);
    };

    listeners.add(listener);
    ensureRealtimeSubscription();

    const refresh = () => {
      void refreshPublicMlmPackages().then((nextPackages) => {
        if (!active) return;
        setPackages(nextPackages);
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

  return { packages, loading };
}
