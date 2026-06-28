/**
 * Safely retrieves a nested property from an object.
 * @param obj - Input object
 * @param path - Dot notation path (e.g., 'a.b.c')
 * @param fallback - Fallback value if not found
 */
export function get(obj: Record<string, unknown>, path: string, fallback?: unknown): unknown {
  if (!obj || !path) return fallback;
  const result = path.split('.').reduce<unknown>((acc, part) => {
    const record = acc as Record<string, unknown> | null | undefined;
    return record && record[part] !== undefined ? record[part] : undefined;
  }, obj);
  return result !== undefined ? result : fallback;
}

/**
 * Deeply merges two objects.
 * @param target - Target object
 * @param source - Source object
 */
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  const output = { ...target };

  Object.keys(source).forEach((key) => {
    if (isObject(source[key] as Record<string, unknown>)) {
      if (!(key in target)) {
        Object.assign(output, { [key]: source[key] });
      } else {
        output[key] = deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        );
      }
    } else {
      Object.assign(output, { [key]: source[key] });
    }
  });

  return output;
}

function isObject(item: unknown): boolean {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Creates an object composed of the picked object properties.
 * @param obj - Input object
 * @param keys - Keys to pick
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Creates an object composed of the object properties omitting the suppressed keys.
 * @param obj - Input object
 * @param keys - Keys to omit
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
}
