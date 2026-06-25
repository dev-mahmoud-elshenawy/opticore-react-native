import { ApiError } from '../../../src/infrastructure/network/ApiError';

describe('ApiError classification', () => {
  describe.each([
    { status: 0, isActionable: false, isRetryable: true, severity: 'error' },
    { status: -1, isActionable: false, isRetryable: true, severity: 'critical' },
    { status: 400, isActionable: true, isRetryable: false, severity: 'error' },
    { status: 401, isActionable: true, isRetryable: false, severity: 'warning' },
    { status: 403, isActionable: true, isRetryable: false, severity: 'warning' },
    { status: 404, isActionable: true, isRetryable: false, severity: 'error' },
    { status: 408, isActionable: false, isRetryable: true, severity: 'error' },
    { status: 409, isActionable: true, isRetryable: false, severity: 'error' },
    { status: 422, isActionable: true, isRetryable: false, severity: 'error' },
    { status: 429, isActionable: false, isRetryable: true, severity: 'error' },
    { status: 500, isActionable: false, isRetryable: true, severity: 'critical' },
    { status: 503, isActionable: false, isRetryable: true, severity: 'critical' },
  ])('status $status', ({ status, isActionable, isRetryable, severity }) => {
    it(`isActionable=${isActionable}, isRetryable=${isRetryable}, severity=${severity}`, () => {
      const error = new ApiError(status, 'message');
      expect(error.isActionable).toBe(isActionable);
      expect(error.isRetryable).toBe(isRetryable);
      expect(error.severity).toBe(severity);
    });
  });
});

describe('ApiError retryAfterMs parsing', () => {
  it('parses delta-seconds form', () => {
    const error = new ApiError(429, 'rate limited', undefined, undefined, undefined, '2');
    expect(error.retryAfterMs).toBe(2000);
  });

  it('parses HTTP-date form in the future', () => {
    const future = new Date(Date.now() + 3000).toUTCString();
    const error = new ApiError(429, 'rate limited', undefined, undefined, undefined, future);
    // toUTCString() truncates sub-second precision, so allow slack on the lower bound.
    expect(error.retryAfterMs).toBeGreaterThan(1500);
    expect(error.retryAfterMs).toBeLessThanOrEqual(3000);
  });

  it('clamps HTTP-date in the past to 0', () => {
    const past = new Date(Date.now() - 5000).toUTCString();
    const error = new ApiError(429, 'rate limited', undefined, undefined, undefined, past);
    expect(error.retryAfterMs).toBe(0);
  });

  it('returns undefined for malformed header values', () => {
    const error = new ApiError(429, 'rate limited', undefined, undefined, undefined, 'soon');
    expect(error.retryAfterMs).toBeUndefined();
  });

  it('returns undefined when header is missing', () => {
    const error = new ApiError(429, 'rate limited');
    expect(error.retryAfterMs).toBeUndefined();
  });

  it('clamps delta-seconds values above the 30s cap', () => {
    const error = new ApiError(429, 'rate limited', undefined, undefined, undefined, '3600');
    expect(error.retryAfterMs).toBe(30000);
  });
});
