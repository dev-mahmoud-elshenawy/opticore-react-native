/**
 * Compile-time guards for the public API surface. NOT run by jest (filename is
 * not *.test/*.spec); validated by `npm run type-check` (and thus `validate`).
 * If any of these stop compiling, a public type regressed.
 */
import type { TextStyle } from 'react-native';
import type { QueryClient } from '@tanstack/react-query';
import { lightTheme, createQueryClient, buildUrl } from '../../src';
import type { ApiResult, ThemeTextVariant } from '../../src';

// Regression guard for the ThemeTextVariant.fontWeight bug:
// a semantic variant must spread/assign into an RN TextStyle.
const bodyStyle: TextStyle = { color: '#000', ...lightTheme.typography.body };
const h2Style: TextStyle = lightTheme.typography.h2;
const variant: ThemeTextVariant = { fontSize: 14, fontWeight: '400', lineHeight: 20 };

// createQueryClient returns a real QueryClient.
const client: QueryClient = createQueryClient();

// buildUrl returns a string and accepts mixed param value types.
const url: string = buildUrl('/x', { a: 1, b: true, c: null, d: 'q' });

// ApiResult is extensible per data source.
interface ArticlesResponse extends ApiResult {
  articles?: string[];
}
const res: ApiResult = { status: 'ok' } as ArticlesResponse;

// Consume bindings so noUnusedLocals (if enabled) stays satisfied.
void bodyStyle;
void h2Style;
void variant;
void client;
void url;
void res;
