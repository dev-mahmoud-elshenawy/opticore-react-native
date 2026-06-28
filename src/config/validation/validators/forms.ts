import { FormsConfig } from '../../types';
import { ValidationIssue } from '../types';
import { assertNonEmptyString } from '../assertions';

export function validateFormsConfig(
  forms: FormsConfig,
  errors: ValidationIssue[],
  _warnings: ValidationIssue[]
): void {
  if (forms.defaultCurrency !== undefined) {
    assertNonEmptyString(forms.defaultCurrency, 'forms.defaultCurrency', errors);
  }

  if (forms.defaultPhoneFormat !== undefined) {
    assertNonEmptyString(forms.defaultPhoneFormat, 'forms.defaultPhoneFormat', errors);
  }
}
