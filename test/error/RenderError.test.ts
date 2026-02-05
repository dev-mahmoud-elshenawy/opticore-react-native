import { RenderError } from '../../src/error/RenderError';
import { ErrorType } from '../../src/error/ErrorType';

describe('RenderError', () => {
  it('should have RENDER error type', () => {
    const error = new RenderError('User visible error', 'Display this to user');
    expect(error.maxErrorType).toBe(ErrorType.RENDER);
  });

  it('should have user-facing message', () => {
    const error = new RenderError('Tech message', 'User message');
    expect(error.userMessage).toBe('User message');
    expect(error.message).toBe('Tech message');
  });

  it('should set default severity and flags', () => {
    const error = new RenderError('Msg');
    expect(error.severity).toBe('error');
    expect(error.isDismissible).toBe(true);
    expect(error.isActionable).toBe(false);
  });

  it('should support custom options via constructor', () => {
    const error = new RenderError('Msg', 'UserMsg', {
      code: 'CUSTOM_CODE',
      severity: 'critical',
      isDismissible: false,
      isActionable: true,
    });

    expect(error.code).toBe('CUSTOM_CODE');
    expect(error.severity).toBe('critical');
    expect(error.isDismissible).toBe(false);
    expect(error.isActionable).toBe(true);
  });
});
