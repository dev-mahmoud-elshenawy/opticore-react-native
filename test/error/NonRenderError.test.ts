import { NonRenderError } from '../../src/error/NonRenderError';
import { ErrorType } from '../../src/error/ErrorType';
import { Logger } from '../../src/infrastructure/logger/Logger';

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

// US2: NonRenderError is used as a descriptor / log payload — constructed and
// handed to Logger or read at the catch site, never thrown as control flow.
describe('NonRenderError as a log/descriptor payload', () => {
  it('serializes code, metadata, and cause via toJSON for logging', () => {
    const cause = new Error('root network failure');
    const err = new NonRenderError('background sync failed', {
      code: 'SYNC_FAILED',
      shouldMonitor: true,
      metadata: { userMessage: 'Could not sync. We will retry.', attempt: 2 },
      cause,
    });

    const json = err.toJSON();

    expect(json.code).toBe('SYNC_FAILED');
    expect(json.metadata).toMatchObject({
      userMessage: 'Could not sync. We will retry.',
      attempt: 2,
    });
    expect(json.cause?.message).toBe('root network failure');
  });

  it('can be passed to Logger.error without being thrown', () => {
    const logSpy = jest.spyOn(Logger.getInstance(), 'error').mockImplementation(() => {});
    const err = new NonRenderError('telemetry failed', { code: 'TELEMETRY' });

    Logger.getInstance().error('background failure', err);

    expect(logSpy).toHaveBeenCalledWith('background failure', err);
    logSpy.mockRestore();
  });

  it('exposes descriptor fields the catch site reads to drive feedback', () => {
    const silent = new NonRenderError('silent', { isSilent: true });
    const loud = new NonRenderError('loud', {
      isSilent: false,
      metadata: { userMessage: 'Something went wrong in the background.' },
    });

    // Simulated catch-site decision — no throw, no boundary involved.
    const decide = (e: NonRenderError): string | null =>
      e.isSilent ? null : ((e.metadata.userMessage as string | undefined) ?? null);

    expect(decide(silent)).toBeNull();
    expect(decide(loud)).toBe('Something went wrong in the background.');
  });
});
