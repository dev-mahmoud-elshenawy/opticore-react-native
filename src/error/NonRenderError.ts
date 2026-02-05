import { BaseError } from './BaseError';
import { ErrorType } from './ErrorType';

export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
}

export interface NonRenderErrorOptions {
  code?: string;
  isSilent?: boolean;
  shouldMonitor?: boolean;
  retryConfig?: RetryConfig;
  metadata?: Record<string, unknown>;
  cause?: Error;
}

/**
 * Background errors that should NOT disturb the user (UI Invisible).
 * Examples: analytics, logging, background sync failures.
 */
export class NonRenderError extends BaseError {
  public readonly maxErrorType = ErrorType.NON_RENDER;
  public readonly isSilent: boolean;
  public readonly shouldMonitor: boolean;
  public readonly retryConfig?: RetryConfig;

  constructor(message: string, options: NonRenderErrorOptions = {}) {
    super(message, options.code || 'NON_RENDER_ERROR', options.cause);

    this.isSilent = options.isSilent ?? false;
    this.shouldMonitor = options.shouldMonitor ?? true;
    this.retryConfig = options.retryConfig;

    if (options.metadata) {
      Object.entries(options.metadata).forEach(([k, v]) => this.addMetadata(k, v));
    }
  }
}
