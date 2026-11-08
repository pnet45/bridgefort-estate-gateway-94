const CACHE_PREFIX = 'bridgefort:public-data:v1:';
const DEFAULT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CacheEnvelope<T> = {
  version: number;
  savedAt?: number;
  data: T;
};

const pendingRefreshes = new Map<string, Promise<unknown>>();
const cacheEventName = (key: string) => `bridgefort:public-data-cache:${key}`;

export function readPublicDataCache<T>(key: string, maxAgeMs = DEFAULT_CACHE_TTL_MS): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (parsed?.version !== 1 || !('data' in parsed)) return null;
    // Existing v1 entries without savedAt remain readable once; new entries
    // expire after seven days so stale content cannot persist indefinitely.
    if (parsed.savedAt && Date.now() - parsed.savedAt > maxAgeMs) {
      window.localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function writePublicDataCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ version: 1, savedAt: Date.now(), data } satisfies CacheEnvelope<T>),
    );
    window.dispatchEvent(new CustomEvent(cacheEventName(key), { detail: data }));
  } catch {
    // Storage can be disabled or full. The live database response still renders.
  }
}

/** Share one refresh request for a public dataset across mounted page sections. */
export function refreshPublicDataCache<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const pending = pendingRefreshes.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const request = loader().finally(() => {
    if (pendingRefreshes.get(key) === request) pendingRefreshes.delete(key);
  });
  pendingRefreshes.set(key, request);
  return request;
}

/** Listen for a dataset update from another component or browser tab. */
export function subscribePublicDataCache<T>(key: string, listener: (data: T) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onCustomEvent = (event: Event) => listener((event as CustomEvent<T>).detail);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CACHE_PREFIX + key || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as CacheEnvelope<T>;
      if (parsed.version === 1) listener(parsed.data);
    } catch {
      // Ignore malformed or unavailable cross-tab cache entries.
    }
  };
  window.addEventListener(cacheEventName(key), onCustomEvent);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(cacheEventName(key), onCustomEvent);
    window.removeEventListener('storage', onStorage);
  };
}
