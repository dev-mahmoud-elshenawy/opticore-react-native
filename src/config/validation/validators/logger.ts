import { LogLevel } from '../../../infrastructure/logger/LogLevel';
import { CoreLoggerConfig } from '../../types';
import { ValidationIssue } from '../types';
import { assertBoolean, assertOneOf } from '../assertions';

export function validateLoggerConfig(
  logger: CoreLoggerConfig,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  if (logger.level !== undefined) {
    assertOneOf(logger.level, Object.values(LogLevel), 'logger.level', errors);
  }

  if (logger.disabled !== undefined) {
    assertBoolean(logger.disabled, 'logger.disabled', errors);
  }

  if (logger.disabled === true && logger.level !== undefined) {
    warnings.push({
      path: 'logger',
      message: 'level is set but logging is disabled — level will have no effect',
    });
  }
}
