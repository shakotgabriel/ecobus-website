type Result<T> = { data: T; error: string | null };

const entries = new Map<string, { at: number; promise: Promise<Result<unknown>> }>();

/**
 * Share one in-flight/recent request per key across components (navbar card,
 * destinations grid and booking modal all need routes and cities).
 * Failed responses are not cached so the next caller retries.
 */
export function cachedRequest<T>(
  key: string,
  load: () => Promise<Result<T>>,
  ttlMs = 5 * 60 * 1000,
): Promise<Result<T>> {
  const hit = entries.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.promise as Promise<Result<T>>;

  const promise = load().then((res) => {
    if (res.error) entries.delete(key);
    return res;
  });
  entries.set(key, { at: Date.now(), promise });
  return promise;
}

export function invalidateRequest(key: string) {
  entries.delete(key);
}
