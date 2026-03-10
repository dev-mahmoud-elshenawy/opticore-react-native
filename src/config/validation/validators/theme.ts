import { CoreThemeConfig } from '../../types';
import { ValidationIssue } from '../types';
import { assertNonEmptyString, assertOneOf } from '../assertions';

export function validateThemeConfig(
  theme: CoreThemeConfig,
  errors: ValidationIssue[],
  _warnings: ValidationIssue[],
): void {
  if (theme.defaultMode !== undefined) {
    assertOneOf(
      theme.defaultMode,
      ['light', 'dark', 'system'] as const,
      'theme.defaultMode',
      errors,
    );
  }

  if (theme.storageKey !== undefined) {
    assertNonEmptyString(theme.storageKey, 'theme.storageKey', errors);
  }

  if (theme.customThemes) {
    for (const [key, themeObj] of Object.entries(theme.customThemes)) {
      const base = `theme.customThemes.${key}`;

      if (!themeObj.name) {
        errors.push({ path: `${base}.name`, message: 'is required' });
      }

      if (!themeObj.mode || !['light', 'dark'].includes(themeObj.mode)) {
        errors.push({
          path: `${base}.mode`,
          message: 'must be "light" or "dark"',
          value: themeObj.mode,
        });
      }

      if (!themeObj.colors) {
        errors.push({ path: `${base}.colors`, message: 'is required' });
      }

      if (!themeObj.spacing) {
        errors.push({ path: `${base}.spacing`, message: 'is required' });
      }

      if (!themeObj.typography) {
        errors.push({ path: `${base}.typography`, message: 'is required' });
      }

      if (!themeObj.borderRadius) {
        errors.push({ path: `${base}.borderRadius`, message: 'is required' });
      }

      if (!themeObj.shadows) {
        errors.push({ path: `${base}.shadows`, message: 'is required' });
      }
    }
  }
}
