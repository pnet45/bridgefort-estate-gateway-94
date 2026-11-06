const CACHE_PREFIX = 'bridgefort:public-data:v1:';

export function readPublicDataCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version: number; data: T };
    return parsed?.version === 1 ? parsed.data : null;
  } catch {
    return null;
  }
}

export function writePublicDataCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ version: 1, data }));
  } catch {
    // Storage can be disabled or full. The live database response still renders.
  }
}
