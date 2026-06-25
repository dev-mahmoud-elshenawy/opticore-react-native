import { _resetAdapterWarnings } from '../adapters/registry';
import { StorageManager } from '../infrastructure/storage/StorageManager';
import { Logger } from '../infrastructure/logger/Logger';

/**
 * Best-effort reset of cross-test OptiCore state. Call in `afterEach` so singleton
 * state (which persists across tests in a process) doesn't leak between tests:
 *
 * - re-arms the one-time adapter memory-fallback warnings (`_resetAdapterWarnings`)
 * - clears all logger transports (`Logger.clearTransports`)
 * - clears secure + local storage (`StorageManager.clearAll`)
 *
 * Async because storage clearing is async. Every step is guarded, so it is safe to
 * call even if `OptiCoreProvider` / `CoreSetup.init()` never ran.
 *
 * @example
 * afterEach(async () => {
 *   await resetOptiCore();
 *   jest.restoreAllMocks();
 * });
 */
export async function resetOptiCore(): Promise<void> {
  try {
    _resetAdapterWarnings();
  } catch {
    // Registry not initialized — nothing to re-arm.
  }

  try {
    Logger.getInstance().clearTransports();
  } catch {
    // Logger not configured — nothing to clear.
  }

  try {
    await StorageManager.getInstance().clearAll();
  } catch {
    // Storage not configured — nothing to clear.
  }
}
