/**
 * A single validation issue with its field path.
 */
export interface ValidationIssue {
  /** Dot-separated path to the field, e.g. "api.timeout" */
  path: string;
  /** Human-readable description of the problem */
  message: string;
  /** The actual value that failed validation (omitted for missing fields) */
  value?: unknown;
}

/**
 * Result of validating a CoreConfig.
 */
export interface ValidationResult {
  /** True when there are zero errors (warnings are allowed) */
  valid: boolean;
  /** Hard failures that must be fixed */
  errors: ValidationIssue[];
  /** Non-blocking issues that indicate likely misconfiguration */
  warnings: ValidationIssue[];
}

/**
 * Thrown by ConfigValidator.validateOrThrow when validation fails.
 * Carries the full ValidationResult for programmatic inspection.
 */
export class ConfigValidationError extends Error {
  public readonly result: ValidationResult;

  constructor(result: ValidationResult) {
    const summary = result.errors
      .map((e) => `  • ${e.path}: ${e.message}`)
      .join('\n');
    super(`Configuration validation failed:\n${summary}`);
    this.name = 'ConfigValidationError';
    this.result = result;
  }
}
