/* eslint-disable no-console */
/**
 * Usage Example: Error Classification System
 * Demonstrates: Creating, Classifying, and Handling different error types.
 */

import { ErrorClassifier } from '../../src/error/ErrorClassifier';
import { ErrorType } from '../../src/error/ErrorType';
import { RenderError } from '../../src/error/RenderError';
import { NonRenderError } from '../../src/error/NonRenderError';
import { RetryStrategy } from '../../src/error/RecoveryStrategy';
import type { RecoveryStrategy } from '../../src/error/RecoveryStrategy';

// --- 1. Creating Custom Errors ---

// A UI-visible error (e.g., Validation)
export class ValidationError extends RenderError {
  constructor(field: string, reason: string) {
    super(`Validation failed for ${field}: ${reason}`, `Please check your ${field}.`, {
      code: 'VALIDATION_ERROR',
      severity: 'warning',
      metadata: { field },
    });
  }
}

// A background error (e.g., Analytics)
export class AnalyticsError extends NonRenderError {
  constructor(service: string, originalError: unknown) {
    super(`Failed to send analytics to ${service}`, {
      code: 'ANALYTICS_FAILURE',
      isSilent: true,
      cause: originalError instanceof Error ? originalError : undefined,
      metadata: { service },
    });
  }
}

// --- 2. Simulating Error Scenarios ---

export async function simulateLogin(email: string): Promise<void> {
  // Scenario 1: Validation Error (RenderError)
  if (!email.includes('@')) {
    throw new ValidationError('email', 'Invalid format');
  }

  // Scenario 2: Network Error (RenderError via Classifier or explicit)
  try {
    await mockFetch('/login');
  } catch (error) {
    // Option A: Let Classifier handle it globally
    // Option B: Wrap it explicitly

    // Let's create a RenderError with a Retry Strategy
    const retry = new RetryStrategy(async () => simulateLogin(email));

    const netError = new RenderError('Network request failed', 'Could not connect to server.', {
      cause: error instanceof Error ? error : undefined,
      severity: 'error',
    });

    // Attach strategy (dynamically for demo)
    (netError as unknown as Record<string, unknown>).strategies = [retry];

    throw netError;
  }
}

// --- 3. Global Error Handling (The Consumer) ---

export function globalErrorHandler(error: unknown) {
  const errorType = ErrorClassifier.classify(error);

  switch (errorType) {
    case ErrorType.RENDER:
      handleRenderError(error);
      break;
    case ErrorType.NON_RENDER:
      handleNonRenderError(error);
      break;
    case ErrorType.NONE:
    default:
      console.error('Unhandled unknown error:', error);
  }
}

function handleRenderError(error: unknown) {
  if (error instanceof RenderError) {
    console.log(`[UI] Showing Toast: "${error.userMessage}" (${error.severity})`);

    if (error.isActionable) {
      console.log('[UI] Showing Action Button');
    }

    // Check for strategies
    const strategies = ((error as unknown as Record<string, unknown>).strategies ||
      []) as RecoveryStrategy[];
    if (strategies.length > 0) {
      console.log(
        '[UI] Offering Recovery:',
        strategies.map((s: RecoveryStrategy) => s.label)
      );
    }
  } else {
    // Fallback for non-instance RenderErrors (e.g. from Classifier)
    console.log('[UI] Showing Generic Error');
  }
}

function handleNonRenderError(error: unknown) {
  if (error instanceof NonRenderError) {
    if (error.shouldMonitor) {
      console.log(`[Monitor] Sending to Sentry: ${error.code}`);
    }
    if (!error.isSilent) {
      console.log('[Log]', error.message);
    }
  } else {
    console.log('[Log] Background Error:', error);
  }
}

// --- Mock Helpers ---
async function mockFetch(_url: string) {
  throw new Error('Network Failure');
}
