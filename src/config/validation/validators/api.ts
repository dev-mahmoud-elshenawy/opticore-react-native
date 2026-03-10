import { ApiConfig } from '../../types';
import { ValidationIssue } from '../types';
import { assertNonEmpty, assertPositiveNumber, assertString, isValidUrl } from '../assertions';

export function validateApiConfig(
  api: ApiConfig,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
): void {
  if (!assertNonEmpty(api, 'api', errors)) return;

  if (assertNonEmpty(api.baseURL, 'api.baseURL', errors)) {
    if (assertString(api.baseURL, 'api.baseURL', errors)) {
      if (!isValidUrl(api.baseURL)) {
        errors.push({
          path: 'api.baseURL',
          message: 'must be a valid URL',
          value: api.baseURL,
        });
      }
    }
  }

  if (api.timeout !== undefined) {
    if (assertPositiveNumber(api.timeout, 'api.timeout', errors)) {
      if (api.timeout < 1000) {
        warnings.push({
          path: 'api.timeout',
          message: 'is less than 1 second — this may cause premature request timeouts',
          value: api.timeout,
        });
      }
      if (api.timeout > 120_000) {
        warnings.push({
          path: 'api.timeout',
          message: 'exceeds 120 seconds — consider a shorter timeout for mobile networks',
          value: api.timeout,
        });
      }
    }
  }
}
