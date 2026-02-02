export interface IStorage {
    /**
     * Get a value from storage
     * @param key Storage key
     * @returns Promise resolving to the value or null if not found
     */
    get<T>(key: string): Promise<T | null>;

    /**
     * Save a value to storage
     * @param key Storage key
     * @param value Value to store
     */
    set<T>(key: string, value: T): Promise<void>;

    /**
     * Remove a value from storage
     * @param key Storage key
     */
    remove(key: string): Promise<void>;

    /**
     * Clear all permanently stored data
     */
    clear(): Promise<void>;
}
