import { BaseError } from './BaseError';
import { ErrorType } from './ErrorType';

export interface RenderErrorOptions {
  code?: string;
  severity?: 'warning' | 'error' | 'critical';
  isDismissible?: boolean;
  isActionable?: boolean;
  metadata?: Record<string, unknown>;
  cause?: Error;
}

/**
 * Errors that should be displayed to the user (UI Visible).
 * Examples: component failures, validation errors, network alerts.
 */
export class RenderError extends BaseError {
  public readonly maxErrorType = ErrorType.RENDER;
  public readonly userMessage: string;
  public readonly severity: 'warning' | 'error' | 'critical';
  public readonly isDismissible: boolean;
  public readonly isActionable: boolean;

  constructor(message: string, userMessage?: string, options: RenderErrorOptions = {}) {
    super(message, options.code || 'RENDER_ERROR', options.cause);

    this.userMessage = userMessage || 'An unexpected error occurred. Please try again.';
    this.severity = options.severity || 'error';
    this.isDismissible = options.isDismissible ?? true;
    this.isActionable = options.isActionable ?? false;

    if (options.metadata) {
      Object.entries(options.metadata).forEach(([k, v]) => this.addMetadata(k, v));
    }
  }
}
