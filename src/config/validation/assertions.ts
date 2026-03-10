import { ValidationIssue } from './types';

/**
 * Reusable primitive assertion helpers for config validation.
 * Each returns `true` when the value passes, `false` otherwise (and pushes an issue).
 */

export function assertNonEmpty(
  value: unknown,
  path: string,
  errors: ValidationIssue[],
): boolean {
  if (value === undefined || value === null || value === '') {
    errors.push({ path, message: 'is required' });
    return false;
  }
  return true;
}

export function assertString(
  value: unknown,
  path: string,
  errors: ValidationIssue[],
): value is string {
  if (typeof value !== 'string') {
    errors.push({ path, message: 'must be a string', value });
    return false;
  }
  return true;
}

export function assertNonEmptyString(
  value: unknown,
  path: string,
  errors: ValidationIssue[],
): value is string {
  if (!assertString(value, path, errors)) return false;
  if ((value as string).trim() === '') {
    errors.push({ path, message: 'must not be empty', value });
    return false;
  }
  return true;
}

export function assertPositiveNumber(
  value: unknown,
  path: string,
  errors: ValidationIssue[],
): value is number {
  if (typeof value !== 'number' || value <= 0) {
    errors.push({ path, message: 'must be a positive number', value });
    return false;
  }
  return true;
}

export function assertNonNegativeNumber(
  value: unknown,
  path: string,
  errors: ValidationIssue[],
): value is number {
  if (typeof value !== 'number' || value < 0) {
    errors.push({ path, message: 'must be a non-negative number', value });
    return false;
  }
  return true;
}

export function assertPositiveInteger(
  value: unknown,
  path: string,
  errors: ValidationIssue[],
): value is number {
  if (typeof value !== 'number' || value <= 0 || !Number.isInteger(value)) {
    errors.push({ path, message: 'must be a positive integer', value });
    return false;
  }
  return true;
}

export function assertNonNegativeInteger(
  value: unknown,
  path: string,
  errors: ValidationIssue[],
): value is number {
  if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
    errors.push({ path, message: 'must be a non-negative integer', value });
    return false;
  }
  return true;
}

export function assertBoolean(
  value: unknown,
  path: string,
  errors: ValidationIssue[],
): value is boolean {
  if (typeof value !== 'boolean') {
    errors.push({ path, message: 'must be a boolean', value });
    return false;
  }
  return true;
}

export function assertOneOf<T>(
  value: T,
  allowed: readonly T[],
  path: string,
  errors: ValidationIssue[],
): boolean {
  if (!allowed.includes(value)) {
    errors.push({
      path,
      message: `must be one of: ${allowed.join(', ')}`,
      value,
    });
    return false;
  }
  return true;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
