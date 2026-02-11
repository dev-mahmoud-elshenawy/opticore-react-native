import { ErrorType } from './ErrorType';
import { BaseError } from './BaseError';

/**
 * Utility to automatically classify errors into RENDER (UI) or NON_RENDER (Background)
 * based on error types, HTTP status codes, or error codes.
 */

/**
 * Rule for custom error classification
 */
export interface ErrorClassificationRule {
  /**
   * Function to determine error type.
   * Returns ErrorType if matched, or undefined/null to continue to next rule.
   */
  classify: (error: unknown) => ErrorType | undefined | null;
}

export class ErrorClassifier {
  /**
   * Classify an unknown error object
   */
  public static classify(error: unknown, customRules?: ErrorClassificationRule[]): ErrorType {
    if (!error) return ErrorType.NONE;

    // 0. Check custom rules first
    if (customRules && customRules.length > 0) {
      for (const rule of customRules) {
        const result = rule.classify(error);
        if (result) return result;
      }
    }

    // 1. Check if it's already a strongly typed BaseError
    if (error instanceof BaseError) {
      return error.maxErrorType;
    }

    // 2. Check for HTTP Status Codes (axios, fetch, etc.)
    // Support common patterns: error.status, error.response.status, error.statusCode
    const status = this.extractStatus(error);
    if (status) {
      if (status >= 400 && status < 500) return ErrorType.RENDER; // Client Errors
      if (status >= 500 && status < 600) return ErrorType.NON_RENDER; // Server Errors
    }

    // 3. Check for specific Error Codes
    const errorRecord = error as Record<string, unknown>;
    const code = typeof errorRecord.code === 'string' ? errorRecord.code : undefined;
    if (code) {
      if (['ECONNABORTED', 'ETIMEDOUT', 'NETWORK_ERROR'].includes(code)) return ErrorType.RENDER;
      if (['VALIDATION_ERROR', 'AUTH_ERROR'].includes(code)) return ErrorType.RENDER;
    }

    // 4. Heuristics based on message
    const message = (
      typeof errorRecord.message === 'string' ? errorRecord.message : ''
    ).toLowerCase();
    if (message.includes('validation')) return ErrorType.RENDER;
    if (message.includes('timeout')) return ErrorType.RENDER;
    if (message.includes('network error')) return ErrorType.RENDER;

    // Default: Unknown
    return ErrorType.NONE;
  }

  private static extractStatus(error: unknown): number | undefined {
    const err = error as Record<string, unknown>;
    if (typeof err.status === 'number') return err.status;
    if (typeof err.statusCode === 'number') return err.statusCode;
    const response = err.response as Record<string, unknown> | undefined;
    if (response && typeof response.status === 'number') return response.status;
    return undefined;
  }
}
