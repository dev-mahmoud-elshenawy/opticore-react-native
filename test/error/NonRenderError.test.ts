import { NonRenderError } from '../../src/error/NonRenderError';
import { ErrorType } from '../../src/error/ErrorType';

describe('NonRenderError', () => {
  it('should have NON_RENDER error type', () => {
    const error = new NonRenderError('Background error');
    expect(error.maxErrorType).toBe(ErrorType.NON_RENDER);
  });

  it('should set default monitoring flags', () => {
    const error = new NonRenderError('Log me');
    expect(error.isSilent).toBe(false);
    expect(error.shouldMonitor).toBe(true);
  });

  it('should support custom configuration', () => {
    const error = new NonRenderError('Silent error', {
      isSilent: true,
      shouldMonitor: false,
      code: 'SILENT_ERR',
    });

    expect(error.isSilent).toBe(true);
    expect(error.shouldMonitor).toBe(false);
    expect(error.code).toBe('SILENT_ERR');
  });

  it('should support retry configuration', () => {
    const error = new NonRenderError('Retry me', {
      retryConfig: { maxRetries: 3, delayMs: 1000 },
    });

    expect(error.retryConfig).toEqual({ maxRetries: 3, delayMs: 1000 });
  });
});
