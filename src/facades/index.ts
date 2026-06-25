/**
 * Ergonomic facades — ready-to-use `api`, `storage`, `logger` objects that
 * remove `.getInstance()` boilerplate and (for `api`) add verb sugar over the
 * enum-based `request()`. All delegate lazily to the underlying singletons, so
 * importing this module is side-effect-free.
 */
export { api, type VerbConfig } from './api';
export { storage } from './storage';
export { logger } from './logger';
