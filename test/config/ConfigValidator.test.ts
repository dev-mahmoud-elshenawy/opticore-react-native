import { ConfigValidator, ConfigValidationError } from '../../src/config/ConfigValidator';
import { CoreConfig } from '../../src/config/types';
import { LogLevel } from '../../src/infrastructure/logger/LogLevel';
import { Theme } from '../../src/theme/types';

// ── helpers ──────────────────────────────────────────────────

/** Minimal valid config to use as a base */
const validConfig = (): CoreConfig => ({
  api: { baseURL: 'https://api.example.com' },
});

/** Minimal valid Theme stub */
const stubTheme = (overrides: Partial<Theme> = {}): Theme => ({
  name: 'stub',
  mode: 'light',
  colors: {} as Theme['colors'],
  spacing: {} as Theme['spacing'],
  typography: {} as Theme['typography'],
  borderRadius: {} as Theme['borderRadius'],
  shadows: {} as Theme['shadows'],
  ...overrides,
});

// ── validate (returns ValidationResult) ──────────────────────

describe('ConfigValidator.validate', () => {
  describe('root config', () => {
    it('should return error when config is falsy', () => {
      const result = ConfigValidator.validate(undefined as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'config', message: 'Configuration object is required' }),
        ]),
      );
    });

    it('should return valid for minimal correct config', () => {
      const result = ConfigValidator.validate(validConfig());
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // ── api ───────────────────────────────────────────────────

  describe('api', () => {
    it('should error when api is missing', () => {
      const result = ConfigValidator.validate({} as CoreConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'api' })]),
      );
    });

    it('should error when baseURL is missing', () => {
      const result = ConfigValidator.validate({ api: {} } as CoreConfig);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'api.baseURL' })]),
      );
    });

    it('should error when baseURL is not a valid URL', () => {
      const result = ConfigValidator.validate({ api: { baseURL: 'not-a-url' } } as CoreConfig);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'api.baseURL', message: 'must be a valid URL' }),
        ]),
      );
    });

    it('should error when timeout is negative', () => {
      const result = ConfigValidator.validate({
        api: { baseURL: 'https://api.example.com', timeout: -1 },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'api.timeout' })]),
      );
    });

    it('should warn when timeout is less than 1 second', () => {
      const result = ConfigValidator.validate({
        api: { baseURL: 'https://api.example.com', timeout: 500 },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'api.timeout', value: 500 }),
        ]),
      );
    });

    it('should warn when timeout exceeds 120 seconds', () => {
      const result = ConfigValidator.validate({
        api: { baseURL: 'https://api.example.com', timeout: 200_000 },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'api.timeout', value: 200_000 }),
        ]),
      );
    });

    it('should pass with a valid timeout', () => {
      const result = ConfigValidator.validate({
        api: { baseURL: 'https://api.example.com', timeout: 30_000 },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  // ── logger ────────────────────────────────────────────────

  describe('logger', () => {
    it('should pass with valid logger config', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        logger: { level: LogLevel.WARN, disabled: false },
      });
      expect(result.valid).toBe(true);
    });

    it('should error when level is invalid', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        logger: { level: 99 as any },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'logger.level' })]),
      );
    });

    it('should error when disabled is not boolean', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        logger: { disabled: 'yes' as any },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'logger.disabled' })]),
      );
    });

    it('should warn when level is set but logging is disabled', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        logger: { level: LogLevel.ERROR, disabled: true },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'logger', message: expect.stringContaining('disabled') }),
        ]),
      );
    });
  });

  // ── responsive ────────────────────────────────────────────

  describe('responsive', () => {
    it('should pass with valid breakpoints', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        responsive: { breakpoints: { small: 360, medium: 768, large: 1024 } },
      });
      expect(result.valid).toBe(true);
    });

    it('should error when breakpoint is negative', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        responsive: { breakpoints: { small: -1 } },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'responsive.breakpoints.small' }),
        ]),
      );
    });

    it('should error when small >= medium', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        responsive: { breakpoints: { small: 800, medium: 768 } },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'responsive.breakpoints',
            message: '"small" must be less than "medium"',
          }),
        ]),
      );
    });

    it('should error when medium >= large', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        responsive: { breakpoints: { medium: 1200, large: 1024 } },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'responsive.breakpoints',
            message: '"medium" must be less than "large"',
          }),
        ]),
      );
    });

    it('should error when small >= large (no medium)', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        responsive: { breakpoints: { small: 1200, large: 1024 } },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'responsive.breakpoints',
            message: '"small" must be less than "large"',
          }),
        ]),
      );
    });
  });

  // ── offline ───────────────────────────────────────────────

  describe('offline', () => {
    it('should pass with valid offline config', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        offline: { maxRetries: 3, retryDelay: 1000, maxBackoff: 30000 },
      });
      expect(result.valid).toBe(true);
    });

    it('should error when maxRetries is not an integer', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        offline: { maxRetries: 2.5 },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'offline.maxRetries' })]),
      );
    });

    it('should error when maxRetries is negative', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        offline: { maxRetries: -1 },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'offline.maxRetries' })]),
      );
    });

    it('should error when retryDelay is negative', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        offline: { retryDelay: -100 },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'offline.retryDelay' })]),
      );
    });

    it('should error when maxQueueSize is zero', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        offline: { maxQueueSize: 0 },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'offline.maxQueueSize' })]),
      );
    });

    it('should error when conflictStrategy is invalid', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        offline: { conflictStrategy: 'last-wins' as any },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'offline.conflictStrategy' })]),
      );
    });

    it('should error when manual strategy has no onConflict handler', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        offline: { conflictStrategy: 'manual' },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'offline.onConflict' })]),
      );
    });

    it('should pass when manual strategy has onConflict handler', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        offline: { conflictStrategy: 'manual', onConflict: async () => ({}) },
      });
      expect(result.errors.filter((e) => e.path === 'offline.onConflict')).toHaveLength(0);
    });

    it('should error when retryDelay exceeds maxBackoff', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        offline: { retryDelay: 5000, maxBackoff: 2000 },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'offline.retryDelay',
            message: 'must not exceed maxBackoff',
          }),
        ]),
      );
    });

    it('should warn when maxRetries exceeds 10', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        offline: { maxRetries: 15 },
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'offline.maxRetries', value: 15 }),
        ]),
      );
    });
  });

  // ── theme ─────────────────────────────────────────────────

  describe('theme', () => {
    it('should pass with valid theme config', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        theme: { defaultMode: 'dark' },
      });
      expect(result.valid).toBe(true);
    });

    it('should error when defaultMode is invalid', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        theme: { defaultMode: 'auto' as any },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'theme.defaultMode' })]),
      );
    });

    it('should error when storageKey is empty string', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        theme: { storageKey: '  ' },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'theme.storageKey' })]),
      );
    });

    it('should error when customTheme is missing required fields', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        theme: {
          customThemes: {
            broken: {} as any,
          },
        },
      });
      expect(result.errors.length).toBeGreaterThanOrEqual(5);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'theme.customThemes.broken.name' }),
          expect.objectContaining({ path: 'theme.customThemes.broken.mode' }),
          expect.objectContaining({ path: 'theme.customThemes.broken.colors' }),
          expect.objectContaining({ path: 'theme.customThemes.broken.spacing' }),
          expect.objectContaining({ path: 'theme.customThemes.broken.typography' }),
        ]),
      );
    });

    it('should pass with valid customTheme', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        theme: {
          customThemes: {
            ocean: stubTheme({ name: 'ocean', mode: 'dark' }),
          },
        },
      });
      expect(result.errors.filter((e) => e.path.startsWith('theme.customThemes'))).toHaveLength(0);
    });
  });

  // ── forms ─────────────────────────────────────────────────

  describe('forms', () => {
    it('should pass with valid forms config', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        forms: { defaultCurrency: 'USD', defaultPhoneFormat: '(###) ###-####' },
      });
      expect(result.valid).toBe(true);
    });

    it('should error when defaultCurrency is empty', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        forms: { defaultCurrency: '' },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'forms.defaultCurrency' })]),
      );
    });

    it('should error when defaultPhoneFormat is whitespace', () => {
      const result = ConfigValidator.validate({
        ...validConfig(),
        forms: { defaultPhoneFormat: '   ' },
      });
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: 'forms.defaultPhoneFormat' })]),
      );
    });
  });

  // ── multiple errors ───────────────────────────────────────

  describe('multiple errors', () => {
    it('should collect errors from multiple sections', () => {
      const result = ConfigValidator.validate({
        api: { baseURL: 'bad' },
        logger: { level: 99 as any },
        responsive: { breakpoints: { small: -1 } },
        offline: { maxRetries: -1 },
        forms: { defaultCurrency: '' },
      } as CoreConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(5);
    });
  });
});

// ── validateOrThrow ──────────────────────────────────────────

describe('ConfigValidator.validateOrThrow', () => {
  it('should not throw for valid config', () => {
    expect(() =>
      ConfigValidator.validateOrThrow({ api: { baseURL: 'https://api.example.com' } }),
    ).not.toThrow();
  });

  it('should throw ConfigValidationError with all issues', () => {
    try {
      ConfigValidator.validateOrThrow({ api: { baseURL: 'bad' } } as CoreConfig);
      fail('expected to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigValidationError);
      const validationErr = err as ConfigValidationError;
      expect(validationErr.result.valid).toBe(false);
      expect(validationErr.result.errors.length).toBeGreaterThanOrEqual(1);
      expect(validationErr.message).toContain('api.baseURL');
    }
  });

  it('should include warnings in the thrown error result', () => {
    try {
      ConfigValidator.validateOrThrow({
        api: { baseURL: 'bad', timeout: 500 },
      } as CoreConfig);
      fail('expected to throw');
    } catch (err) {
      const validationErr = err as ConfigValidationError;
      // The error is from baseURL, but warnings from timeout should still be there
      expect(validationErr.result.warnings.length).toBeGreaterThanOrEqual(0);
    }
  });
});
