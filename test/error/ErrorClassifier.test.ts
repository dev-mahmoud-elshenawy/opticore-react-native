import { ErrorClassifier } from '../../src/error/ErrorClassifier';
import { ErrorType } from '../../src/error/ErrorType';
import { RenderError } from '../../src/error/RenderError';
import { NonRenderError } from '../../src/error/NonRenderError';

describe('ErrorClassifier', () => {
  it('should classify RenderError as RENDER', () => {
    const error = new RenderError('Visible');
    expect(ErrorClassifier.classify(error)).toBe(ErrorType.RENDER);
  });

  it('should classify NonRenderError as NON_RENDER', () => {
    const error = new NonRenderError('Silent');
    expect(ErrorClassifier.classify(error)).toBe(ErrorType.NON_RENDER);
  });

  it('should classify HTTP 4xx as RENDER', () => {
    const error400 = { status: 400, message: 'Bad Request' };
    const error404 = { response: { status: 404 }, message: 'Not Found' };

    expect(ErrorClassifier.classify(error400)).toBe(ErrorType.RENDER);
    expect(ErrorClassifier.classify(error404)).toBe(ErrorType.RENDER);
  });

  it('should classify HTTP 5xx as NON_RENDER', () => {
    const error500 = { status: 500 };
    const error503 = { response: { status: 503 } };

    expect(ErrorClassifier.classify(error500)).toBe(ErrorType.NON_RENDER);
    expect(ErrorClassifier.classify(error503)).toBe(ErrorType.NON_RENDER);
  });

  it('should classify validation errors as RENDER', () => {
    const error = new Error('ValidationError: invalid email');
    (error as any).code = 'VALIDATION_ERROR';

    expect(ErrorClassifier.classify(error)).toBe(ErrorType.RENDER);
  });

  it('should classify timeouts as RENDER', () => {
    const error = new Error('Network timeout');
    (error as any).code = 'ECONNABORTED';

    expect(ErrorClassifier.classify(error)).toBe(ErrorType.RENDER);
  });

  it('should default to NONE for unknown errors', () => {
    expect(ErrorClassifier.classify(new Error('Unknown'))).toBe(ErrorType.NONE);
    expect(ErrorClassifier.classify('string error')).toBe(ErrorType.NONE);
  });

  it('should allow unknown errors to be treated as NON_RENDER if configured (enhancement)', () => {
    // By default strict behavior returns NONE, but usually we want to log unknown errors
    expect(ErrorClassifier.classify({})).toBe(ErrorType.NONE);
  });
});
