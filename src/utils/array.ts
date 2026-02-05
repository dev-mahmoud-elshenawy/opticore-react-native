/**
 * Filters out null and undefined values from an array.
 * @param arr - Input array
 */
export function filterNonNull<T>(arr: (T | null | undefined)[]): T[] {
  if (!arr) return [];
  return arr.filter((item): item is T => item !== null && item !== undefined);
}

/**
 * Groups an array of objects by a key.
 * @param arr - Input array
 * @param key - Key to group by
 */
export function groupBy<T extends Record<string, any>>(
  arr: T[],
  key: keyof T
): Record<string, T[]> {
  if (!arr) return {};
  return arr.reduce(
    (acc, item) => {
      const group = String(item[key]);
      acc[group] = acc[group] || [];
      acc[group].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Removes duplicate values from an array.
 * @param arr - Input array
 */
export function unique<T>(arr: T[]): T[] {
  if (!arr) return [];
  return Array.from(new Set(arr));
}

/**
 * Sorts an array of objects by a key.
 * @param arr - Input array
 * @param key - Key to sort by
 * @param order - Sort order ('asc' or 'desc', default: 'asc')
 */
export function sortBy<T extends Record<string, any>>(
  arr: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  if (!arr) return [];
  return [...arr].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}
