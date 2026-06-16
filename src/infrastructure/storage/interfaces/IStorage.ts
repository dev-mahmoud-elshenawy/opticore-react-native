/**
 * Storage contract used by {@link LocalStorage} and {@link SecureStorage}.
 *
 * Error policy (intentional, consistent across implementations):
 * - **Reads are best-effort.** `get()` NEVER throws — it returns `null` for a
 *   missing key, a value that fails to JSON-parse, OR an underlying adapter
 *   read failure. This keeps reads safe to call during render / store
 *   rehydration. Failures are logged. If you must distinguish "missing" from
 *   "failed", check connectivity/adapter health separately.
 * - **Mutations are strict.** `set()` / `remove()` / `clear()` REJECT on
 *   adapter failure so the caller can react (retry, surface an error, etc.).
 */
export interface IStorage {
  /**
   * Get a value from storage. Best-effort: resolves to `null` on missing key,
   * unparseable value, or adapter read failure (never rejects).
   * @param key Storage key
   * @returns Promise resolving to the value, or `null`
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Save a value to storage. Rejects if the underlying adapter write fails.
   * @param key Storage key
   * @param value Value to store
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove a value from storage. Rejects if the underlying adapter delete fails.
   * @param key Storage key
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all permanently stored data. Rejects if the underlying adapter fails.
   */
  clear(): Promise<void>;
}
