/**
 * MockStorage - Test double for StorageManager
 *
 * Provides in-memory storage for testing without real async-storage.
 * All operations are async to match real StorageManager API.
 */
export class MockStorage {
    private storage: Map<string, string> = new Map();

    /**
     * Store a value
     */
    async set(key: string, value: any): Promise<void> {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        this.storage.set(key, serialized);
    }

    /**
     * Retrieve a value
     */
    async get<T = any>(key: string): Promise<T | null> {
        const value = this.storage.get(key);
        if (value === undefined) {
            return null;
        }

        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }

    /**
     * Remove a value
     */
    async remove(key: string): Promise<void> {
        this.storage.delete(key);
    }

    /**
     * Clear all storage
     */
    async clear(): Promise<void> {
        this.storage.clear();
    }

    /**
     * Get all keys
     */
    async getAllKeys(): Promise<string[]> {
        return Array.from(this.storage.keys());
    }

    /**
     * Check if key exists
     */
    async has(key: string): Promise<boolean> {
        return this.storage.has(key);
    }

    /**
     * Get multiple values at once
     */
    async multiGet(keys: string[]): Promise<Array<[string, any]>> {
        const results: Array<[string, any]> = [];
        for (const key of keys) {
            const value = await this.get(key);
            results.push([key, value]);
        }
        return results;
    }

    /**
     * Set multiple values at once
     */
    async multiSet(keyValuePairs: Array<[string, any]>): Promise<void> {
        for (const [key, value] of keyValuePairs) {
            await this.set(key, value);
        }
    }

    /**
     * Remove multiple keys at once
     */
    async multiRemove(keys: string[]): Promise<void> {
        for (const key of keys) {
            await this.remove(key);
        }
    }

    /**
     * Get current storage size (for testing)
     */
    get size(): number {
        return this.storage.size;
    }

    /**
     * Get raw storage map (for assertions)
     */
    getRawStorage(): Map<string, string> {
        return new Map(this.storage);
    }
}
