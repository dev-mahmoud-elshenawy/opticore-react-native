import { ErrorType } from './ErrorType';
import { BaseError } from './BaseError';
import type { ClassificationRule } from './ClassificationRule';

/**
 * Utility to automatically classify errors into RENDER (UI) or NON_RENDER (Background)
 * based on error types, HTTP status codes, or error codes.
 */

/**
 * Legacy rule interface (parameter-based, kept for backward compatibility).
 * Prefer {@link ClassificationRule} with {@link ErrorClassifier.addRule} for new code.
 */
export interface ErrorClassificationRule {
  /**
   * Function to determine error type.
   * Returns ErrorType if matched, or undefined/null to continue to next rule.
   */
  classify: (error: unknown) => ErrorType | undefined | null;
}

export class ErrorClassifier {
  /** Registered custom rules. Evaluated in LIFO order (last added = highest priority). */
  private static customRules: ClassificationRule[] = [];

  /**
   * Register a custom classification rule.
   * Rules run before built-in defaults and are evaluated in LIFO order
   * (last added wins when multiple rules match).
   */
  public static addRule(rule: ClassificationRule): void {
    ErrorClassifier.customRules.push(rule);
  }

  /**
   * Remove all registered custom rules.
   * Primarily useful in tests to reset state between test cases.
   */
  public static clearCustomRules(): void {
    ErrorClassifier.customRules = [];
  }

  /**
   * Classify an unknown error object.
   *
   * @param error - The error to classify.
   * @param legacyRules - Optional legacy parameter-based rules (backward compat).
   */
  public static classify(error: unknown, legacyRules?: ErrorClassificationRule[]): ErrorType {
    if (!error) return ErrorType.NONE;

    // 0a. Static custom rules — LIFO (last added has highest priority)
    for (let i = ErrorClassifier.customRules.length - 1; i >= 0; i--) {
      const rule = ErrorClassifier.customRules[i];
      try {
        if (rule.match(error)) return rule.type;
      } catch {
        // Broken match function — skip and continue
      }
    }

    // 0b. Legacy parameter-based custom rules (backward compat)
    if (legacyRules && legacyRules.length > 0) {
      for (const rule of legacyRules) {
        const result = rule.classify(error);
        if (result) return result;
      }
    }

    // 1. Already a strongly typed BaseError
    if (error instanceof BaseError) {
      return error.maxErrorType;
    }

    // 2. HTTP Status Codes (axios, fetch, etc.)
    const status = this.extractStatus(error);
    if (status) {
      if (status >= 400 && status < 500) return ErrorType.RENDER;
      if (status >= 500 && status < 600) return ErrorType.NON_RENDER;
    }

    // 3. Specific Error Codes
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
