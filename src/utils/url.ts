/** A query-parameter value that can be serialized into a URL. */
export type QueryParamValue = string | number | boolean | null | undefined;

/**
 * Build a URL path with an encoded query string.
 *
 * Keys/values are URL-encoded; `null`/`undefined`/empty-string values are
 * dropped. Removes manual string concatenation + `encodeURIComponent` when
 * constructing API paths.
 *
 * @example
 * ```typescript
 * buildUrl('/everything', { q: 'climate change', pageSize: 30 });
 * // '/everything?q=climate%20change&pageSize=30'
 * buildUrl('/top-headlines'); // '/top-headlines'
 * ```
 */
export function buildUrl(
  path: string,
  params?: Record<string, QueryParamValue>,
): string {
  if (!params) return path;

  const query = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `${path}?${query}` : path;
}
