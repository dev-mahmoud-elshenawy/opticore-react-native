/**
 * Ergonomic facades — the entire app-facing API. `api`, `storage`, `logger`,
 * `connectivity`, `offline`, `themeControl`, and `lifecycle` expose the full feature
 * set so consumers NEVER call `.getInstance()`. All delegate lazily to the underlying
 * singletons, so importing this module is side-effect-free.
 *
 * In components, the hooks (`useTheme`, `useOfflineSync`, `useConnectivity`,
 * `useLifecycle`, …) are the reactive way to consume the same systems; the
 * `themeControl` / `offline` / `lifecycle` / `connectivity` facades are for
 * imperative (non-component) code.
 */
export { api, type VerbConfig } from './api';
export { storage } from './storage';
export { logger } from './logger';
export { connectivity } from './connectivity';
export { offline } from './offline';
export { themeControl } from './themeControl';
export { lifecycle } from './lifecycle';
export { stateObserver } from './stateObserver';
