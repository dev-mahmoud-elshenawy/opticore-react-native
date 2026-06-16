import { ErrorType } from './ErrorType';

/**
 * A custom rule for error classification.
 * Rules are checked before the default classification logic,
 * allowing consuming apps to override how specific errors are classified.
 *
 * @example
 * ```typescript
 * // Treat 429 (Too Many Requests) as NonRenderError instead of the default RenderError
 * ErrorClassifier.addRule({
 *   name: 'rate-limit',
 *   match: (error) => (error as any)?.status === 429,
 *   type: ErrorType.NON_RENDER,
 * });
 * ```
 */
export interface ClassificationRule {
  /** Unique name for this rule (used for debugging and deduplication). */
  name: string;

  /**
   * Returns true when this rule should apply to the given error.
   * Wrap any unsafe access in try/catch — the classifier handles thrown errors gracefully.
   */
  match(error: unknown): boolean;

  /** The ErrorType to assign when this rule matches. */
  type: ErrorType;
}
