import { ResponsiveConfig } from '../../types';
import { ValidationIssue } from '../types';
import { assertPositiveNumber } from '../assertions';

export function validateResponsiveConfig(
  responsive: ResponsiveConfig,
  errors: ValidationIssue[],
  _warnings: ValidationIssue[],
): void {
  const { breakpoints } = responsive;
  if (!breakpoints) return;

  const { small, medium, large } = breakpoints;

  if (small !== undefined) {
    assertPositiveNumber(small, 'responsive.breakpoints.small', errors);
  }
  if (medium !== undefined) {
    assertPositiveNumber(medium, 'responsive.breakpoints.medium', errors);
  }
  if (large !== undefined) {
    assertPositiveNumber(large, 'responsive.breakpoints.large', errors);
  }

  // Validate ordering only when values are valid positive numbers
  const s = typeof small === 'number' && small > 0 ? small : null;
  const m = typeof medium === 'number' && medium > 0 ? medium : null;
  const l = typeof large === 'number' && large > 0 ? large : null;

  if (s !== null && m !== null && s >= m) {
    errors.push({
      path: 'responsive.breakpoints',
      message: '"small" must be less than "medium"',
      value: { small: s, medium: m },
    });
  }
  if (m !== null && l !== null && m >= l) {
    errors.push({
      path: 'responsive.breakpoints',
      message: '"medium" must be less than "large"',
      value: { medium: m, large: l },
    });
  }
  if (s !== null && l !== null && m === null && s >= l) {
    errors.push({
      path: 'responsive.breakpoints',
      message: '"small" must be less than "large"',
      value: { small: s, large: l },
    });
  }
}
