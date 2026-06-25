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
 * Descriptor for a background failure that should NOT replace the UI.
 * Examples: analytics, logging, background sync failures.
 *
 * In React Native, the errors this describes are almost always asynchronous
 * (sync jobs, telemetry, event handlers). React Error Boundaries only catch
 * errors thrown **synchronously during render**, so they never see these. For
 * that reason `NonRenderError` is a **descriptor / log payload**, not a
 * control-flow signal:
 *
 * - Construct it at the catch site and pass it to the `Logger`:
 *   `Logger.getInstance().error('sync failed', new NonRenderError('sync failed', { ... }))`
 * - Or read its fields (`isSilent`, `shouldMonitor`, `metadata`) to decide
 *   whether to surface feedback (a toast is a state update → a re-render of the
 *   toast host, not a thrown error).
 *
 * For recoverable/expected operations prefer `Result<T, E>`.
 *
 * @remarks
 * **Do NOT `throw` a `NonRenderError`.** Throwing it as control flow is
 * {@link https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary deprecated}:
 * an Error Boundary cannot catch the async/event errors it represents, so the
 * throw is never handled. Log it or return a `Result` instead. The boundary's
 * special handling of thrown `NON_RENDER` errors is scheduled for removal in 3.0.
 *
 * The class itself remains fully supported as a descriptor/log payload — only the
 * throw-as-control-flow usage is deprecated. (No machine `@deprecated` tag is
 * placed on the class so that valid descriptor use is not flagged.)
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
