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
    // Drop legacy entries without a timestamp and expire snapshots after
    // seven days so old database content cannot remain indefinitely.
    if (!parsed.savedAt || Date.now() - parsed.savedAt > maxAgeMs) {
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

const DEFAULT_REVALIDATION_AGE_MS = 60_000;

/** Check the age of one public snapshot without removing stale content from the UI. */
export function isPublicDataCacheStale(key: string, maxAgeMs = DEFAULT_REVALIDATION_AGE_MS): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return true;
    const parsed = JSON.parse(raw) as CacheEnvelope<unknown>;
    return parsed?.version !== 1
      || !parsed.savedAt
      || Date.now() - parsed.savedAt > maxAgeMs;
  } catch {
    return true;
  }
}

/** Revalidate only the named dataset when its cached snapshot is older than one minute. */
export function listenForPublicDataRevalidation(
  key: string,
  refresh: () => void,
  maxAgeMs = DEFAULT_REVALIDATION_AGE_MS,
): () => void {
  if (typeof window === 'undefined') return () => undefined;
  let lastAttemptAt = 0;
  const refreshWhenAvailable = () => {
    if (
      document.visibilityState !== 'visible'
      || !navigator.onLine
      || Date.now() - lastAttemptAt < 5_000
      || !isPublicDataCacheStale(key, maxAgeMs)
    ) return;
    lastAttemptAt = Date.now();
    refresh();
  };
  window.addEventListener('focus', refreshWhenAvailable);
  window.addEventListener('online', refreshWhenAvailable);
  document.addEventListener('visibilitychange', refreshWhenAvailable);
  return () => {
    window.removeEventListener('focus', refreshWhenAvailable);
    window.removeEventListener('online', refreshWhenAvailable);
    document.removeEventListener('visibilitychange', refreshWhenAvailable);
  };
}
