import { RenderError } from '../../error/RenderError';

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

  constructor(
    status: number,
    message: string,
    url?: string,
    data?: unknown,
    originalError?: unknown
  ) {
    // Determine user message and severity based on status code
    const userMessage = ApiError.getUserMessage(status, message);
    const severity = ApiError.getSeverity(status);
    const code = `API_ERROR_${status}`;

    super(message, userMessage, {
      code,
      severity,
      isDismissible: true,
      isActionable: status >= 400 && status < 500, // Client errors are actionable
      cause: originalError instanceof Error ? originalError : undefined,
      metadata: {
        status,
        url,
        data
      }
    });

    this.status = status;
    this.url = url;
    this.data = data;
    this.originalError = originalError;
    this.name = 'ApiError';
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
      if (status === 403) return 'You don\'t have permission to access this resource.';
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

