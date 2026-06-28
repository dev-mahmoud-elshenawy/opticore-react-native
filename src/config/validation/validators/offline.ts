import { OfflineSyncConfig } from '../../../offline/types';
import { ValidationIssue } from '../types';
import {
  assertNonNegativeInteger,
  assertNonNegativeNumber,
  assertOneOf,
  assertPositiveInteger,
} from '../assertions';

export function validateOfflineConfig(
  offline: OfflineSyncConfig,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  if (offline.maxRetries !== undefined) {
    assertNonNegativeInteger(offline.maxRetries, 'offline.maxRetries', errors);
  }

  if (offline.retryDelay !== undefined) {
    assertNonNegativeNumber(offline.retryDelay, 'offline.retryDelay', errors);
  }

  if (offline.maxBackoff !== undefined) {
    assertNonNegativeNumber(offline.maxBackoff, 'offline.maxBackoff', errors);
  }

  if (offline.maxQueueSize !== undefined) {
    assertPositiveInteger(offline.maxQueueSize, 'offline.maxQueueSize', errors);
  }

  if (offline.syncDelay !== undefined) {
    assertNonNegativeNumber(offline.syncDelay, 'offline.syncDelay', errors);
  }

  if (offline.conflictStrategy !== undefined) {
    assertOneOf(
      offline.conflictStrategy,
      ['client-wins', 'server-wins', 'manual'] as const,
      'offline.conflictStrategy',
      errors
    );
  }

  if (offline.conflictStrategy === 'manual' && !offline.onConflict) {
    errors.push({
      path: 'offline.onConflict',
      message: 'is required when conflictStrategy is "manual"',
    });
  }

  // retryDelay must not exceed maxBackoff
  if (
    typeof offline.retryDelay === 'number' &&
    typeof offline.maxBackoff === 'number' &&
    offline.retryDelay > offline.maxBackoff
  ) {
    errors.push({
      path: 'offline.retryDelay',
      message: 'must not exceed maxBackoff',
      value: { retryDelay: offline.retryDelay, maxBackoff: offline.maxBackoff },
    });
  }

  if (typeof offline.maxRetries === 'number' && offline.maxRetries > 10) {
    warnings.push({
      path: 'offline.maxRetries',
      message: 'exceeds 10 — excessive retries may degrade user experience',
      value: offline.maxRetries,
    });
  }
}
