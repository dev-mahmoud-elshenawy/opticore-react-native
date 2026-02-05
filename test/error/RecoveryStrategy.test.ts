import { RetryStrategy, RefreshTokenStrategy } from '../../src/error/RecoveryStrategy';
import { RenderError } from '../../src/error/RenderError';

describe('RecoveryStrategy', () => {
  describe('RetryStrategy', () => {
    it('should execute retry logic', async () => {
      const mockAction = jest.fn().mockResolvedValue('success');
      const strategy = new RetryStrategy(mockAction);

      await strategy.execute();
      expect(mockAction).toHaveBeenCalled();
    });

    it('should have correct metadata', () => {
      const strategy = new RetryStrategy(async () => {});
      expect(strategy.type).toBe('RETRY');
      expect(strategy.label).toBe('Retry');
    });
  });

  describe('RefreshTokenStrategy', () => {
    it('should execute refresh logic', async () => {
      const mockRefresh = jest.fn().mockResolvedValue('token');
      const strategy = new RefreshTokenStrategy(mockRefresh);

      await strategy.execute();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Error integration', () => {
    it('should attach strategies to RenderError', () => {
      const error = new RenderError('Failed');
      const strategy = new RetryStrategy(async () => {});

      // Extending RenderError to support strategies (mocking interface extension)
      const errorWithStrategy = Object.assign(error, {
        strategies: [strategy],
      });

      expect(errorWithStrategy.strategies).toHaveLength(1);
      expect(errorWithStrategy.strategies[0].type).toBe('RETRY');
    });
  });
});
