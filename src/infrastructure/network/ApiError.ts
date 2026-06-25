import { RenderError } from '../../error/RenderError';

/** Cap honored `Retry-After` delays at the same ceiling as the default exponential backoff. */
const RETRY_AFTER_MAX_MS = 30000;

/**
 * 4xx statuses that are NOT transient — the user (or caller) must change
 * something before retrying would ever succeed.
 */
const NON_TRANSIENT_4XX = new Set([400, 401, 403, 404, 405, 409, 410, 422]);

/**
 * API-specific error that extends RenderError for consistent error classification.
 * API errors are user-facing (RenderError) because they typically require user action
 * (retry, check connection, fix input, etc.)
 */
export class ApiError extends RenderError {
  public readonly status: number;
  public readonly url?: string;
  public readonly data?: unknown;
  public readonly originalError?: unknown;

  /** True for transient failures (network, timeout, 429, 5xx) safe to retry. */
  public readonly isRetryable: boolean;

  /** Parsed `Retry-After` delay in ms, when the response provided one. */
  public readonly retryAfterMs?: number;

  constructor(
    status: number,
    message: string,
    url?: string,
    data?: unknown,
    originalError?: unknown,
    retryAfterHeader?: string
  ) {
    // Determine user message and severity based on status code
    const userMessage = ApiError.getUserMessage(status, message);
    const severity = ApiError.getSeverity(status);
    const code = `API_ERROR_${status}`;
    const isRetryable = ApiError.getIsRetryable(status);

    super(message, userMessage, {
      code,
      severity,
      isDismissible: true,
      // Actionable = the caller must change something. Transient statuses
      // (408/429, and anything else classified retryable) are NOT the
      // caller's fault, so they're excluded even though they fall in 4xx.
      isActionable: status >= 400 && status < 500 && !isRetryable,
      cause: originalError instanceof Error ? originalError : undefined,
      metadata: {
        status,
        url,
        data,
      },
    });

    this.status = status;
    this.url = url;
    this.data = data;
    this.originalError = originalError;
    this.name = 'ApiError';
    this.isRetryable = isRetryable;
    this.retryAfterMs = ApiError.parseRetryAfter(retryAfterHeader);
  }

  /**
   * Whether a failure at this status is transient and safe to retry.
   * Connectivity failures (0/-1), request timeouts (408), rate limiting
   * (429), and all 5xx server errors are retryable. Other 4xx statuses
   * require the caller to change something first.
   */
  private static getIsRetryable(status: number): boolean {
    if (status === 0 || status === -1) return true;
    if (status >= 500) return true;
    if (NON_TRANSIENT_4XX.has(status)) return false;
    if (status === 408 || status === 429) return true;
    return false;
  }

  /**
   * Parse a `Retry-After` header value into milliseconds. Supports both the
   * delta-seconds form (`"120"`) and the HTTP-date form. Malformed input
   * yields `undefined` so callers fall back to exponential backoff.
   */
  private static parseRetryAfter(header?: string): number | undefined {
    if (!header) return undefined;
    const trimmed = header.trim();
    if (!trimmed) return undefined;

    if (/^\d+$/.test(trimmed)) {
      const ms = Number(trimmed) * 1000;
      return Number.isFinite(ms) ? Math.min(ms, RETRY_AFTER_MAX_MS) : undefined;
    }

    const dateMs = Date.parse(trimmed);
    if (Number.isNaN(dateMs)) return undefined;

    const delta = dateMs - Date.now();
    return Math.min(Math.max(delta, 0), RETRY_AFTER_MAX_MS);
  }

  /**
   * Generate user-friendly message based on HTTP status code
   */
  private static getUserMessage(status: number, technicalMessage: string): string {
    if (status === -1) {
      return 'Network connection failed. Please check your internet connection and try again.';
    }
    if (status >= 400 && status < 500) {
      // Client errors - user can fix
      if (status === 401) return 'Please log in to continue.';
      if (status === 403) return "You don't have permission to access this resource.";
      if (status === 404) return 'The requested resource was not found.';
      if (status === 422) return 'Please check your input and try again.';
      return 'There was a problem with your request. Please try again.';
    }
    if (status >= 500) {
      // Server errors - user should retry later
      return 'Server error occurred. Please try again later.';
    }
    return technicalMessage || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Determine error severity based on HTTP status code
   */
  private static getSeverity(status: number): 'warning' | 'error' | 'critical' {
    if (status === -1) return 'critical'; // Network failure
    if (status === 401 || status === 403) return 'warning'; // Auth issues
    if (status >= 500) return 'critical'; // Server errors
    if (status >= 400) return 'error'; // Client errors
    return 'error';
  }
}
