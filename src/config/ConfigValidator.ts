import { CoreConfig } from './types';
import { ConfigValidationError, ValidationResult, ValidationIssue } from './validation/types';
import {
  validateApiConfig,
  validateLoggerConfig,
  validateResponsiveConfig,
  validateOfflineConfig,
  validateThemeConfig,
  validateFormsConfig,
} from './validation/validators';

export { ConfigValidationError };
export type { ValidationIssue, ValidationResult };

/**
 * Runtime validator for {@link CoreConfig}.
 *
 * - `validate(config)` — returns a {@link ValidationResult} with all issues.
 * - `validateOrThrow(config)` — throws {@link ConfigValidationError} on failure.
 */
export class ConfigValidator {
  /**
   * Validate config and return all issues at once.
   */
  public static validate(config: CoreConfig): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    if (!config) {
      errors.push({ path: 'config', message: 'Configuration object is required' });
      return { valid: false, errors, warnings };
    }

    // Required section
    validateApiConfig(config.api, errors, warnings);

    // Optional sections
    if (config.logger) {
      validateLoggerConfig(config.logger, errors, warnings);
    }
    if (config.responsive) {
      validateResponsiveConfig(config.responsive, errors, warnings);
    }
    if (config.offline) {
      validateOfflineConfig(config.offline, errors, warnings);
    }
    if (config.theme) {
      validateThemeConfig(config.theme, errors, warnings);
    }
    if (config.forms) {
      validateFormsConfig(config.forms, errors, warnings);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate config and throw if invalid.
   * Warnings are accessible on the thrown error's `result` property.
   */
  public static validateOrThrow(config: CoreConfig): void {
    const result = this.validate(config);
    if (!result.valid) {
      throw new ConfigValidationError(result);
    }
  }
}
