/**
 * Storage Type Definitions
 *
 * Centralized type definitions for storage operations.
 * Provides type safety for AsyncStorage and SecureStore interactions.
 *
 * @module types/Storage
 */

/**
 * Storage provider types
 */
export type StorageProvider = 'async-storage' | 'secure-store' | 'memory';

/**
 * Storage value with metadata
 *
 * @template T - Type of the stored value
 */
export interface StorageValue<T> {
  /** The actual stored value */
  value: T;
  /** Timestamp when value was stored */
  timestamp: number;
  /** Optional expiry timestamp */
  expiresAt?: number;
  /** Version for migration purposes */
  version?: number;
}

/**
 * Storage configuration options
 */
export interface StorageConfig {
  /** Storage provider to use */
  provider: StorageProvider;
  /** Encryption key for secure storage */
  encryptionKey?: string;
  /** Default TTL in milliseconds */
  defaultTTL?: number;
  /** Whether to compress large values */
  compress?: boolean;
  /** Maximum size in bytes */
  maxSize?: number;
  /** Prefix for all keys */
  keyPrefix?: string;
}

/**
 * Storage operation result
 *
 * @template T - Type of the stored/retrieved value
 * @note For storage keys, use the StorageKeys const from infrastructure/storage
 */
export type StorageResult<T> = { success: true; data: T } | { success: false; error: string };

// NOTE: The pluggable adapter contracts are `LocalStorageAdapter` and
// `SecureStorageAdapter` in `adapters/interfaces.ts` (getItem/setItem-style).
// A legacy `StorageAdapter` (get/set-style) was removed in v2.4.0 — it collided
// with those real adapter interfaces and was never wired into anything.
