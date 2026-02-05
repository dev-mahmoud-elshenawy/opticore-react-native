/**
 * Classification of errors within the application.
 * Mirrors the opticore/flutter categorization strategy.
 */
export enum ErrorType {
  /**
   * Errors that directly affect the UI and require user feedback.
   * Examples: Validation errors, Network timeouts, Auth failures.
   */
  RENDER = 'RENDER',

  /**
   * Background errors that should be logged but do not necessarily disrupt the user flow.
   * Examples: Analytics failures, Cache write errors, Pre-fetching failures.
   */
  NON_RENDER = 'NON_RENDER',

  /**
   * Unclassified or unknown errors.
   */
  NONE = 'NONE',
}
