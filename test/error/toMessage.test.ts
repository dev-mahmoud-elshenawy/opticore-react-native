import { toMessage } from '../../src/error/toMessage';
import { RenderError } from '../../src/error/RenderError';
import { ApiError } from '../../src/infrastructure/network/ApiError';

describe('toMessage', () => {
  it('prefers RenderError.userMessage', () => {
    const err = new RenderError('technical detail', 'Please try again.');
    expect(toMessage(err)).toBe('Please try again.');
  });

  it('uses the user-friendly message from an ApiError', () => {
    const err = new ApiError(404, 'not found');
    expect(toMessage(err)).toBe('The requested resource was not found.');
  });

  it('falls back to a plain Error message', () => {
    expect(toMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back to the default for non-errors', () => {
    expect(toMessage(undefined)).toBe('Something went wrong');
    expect(toMessage('nope')).toBe('Something went wrong');
  });

  it('honors a custom fallback', () => {
    expect(toMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});
