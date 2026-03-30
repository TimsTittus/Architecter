type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<any>>();

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCache<T>(key: string, data: T, ttlMs: number = 3600000): void { // Default 1 hour
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function generateCacheKey(input: any): string {
  return Buffer.from(JSON.stringify(input)).toString('base64').slice(0, 100);
}
