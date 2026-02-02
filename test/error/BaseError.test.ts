import { BaseError } from '../../src/error/BaseError';
import { ErrorType } from '../../src/error/ErrorType';

describe('BaseError', () => {
    // Concrete implementation for testing abstract class
    class TestError extends BaseError {
        public readonly maxErrorType = ErrorType.NONE;

        constructor(message: string, code: string = 'TEST_ERROR', cause?: Error) {
            super(message, code, cause);
        }
    }

    it('should initialize with correct properties', () => {
        const error = new TestError('Something went wrong');

        expect(error.message).toBe('Something went wrong');
        expect(error.code).toBe('TEST_ERROR');
        expect(error.timestamp).toBeInstanceOf(Date);
        expect(error.name).toBe('TestError');
        expect(error.stack).toBeDefined();
    });

    it('should handle nested causes', () => {
        const originalError = new Error('Root cause');
        const error = new TestError('Wrapper error', undefined, originalError);

        expect(error.cause).toBe(originalError);
        expect(error.getCause()).toBe(originalError);
    });

    it('should support metadata', () => {
        const error = new TestError('With metadata');
        error.addMetadata('userId', '123');
        error.addMetadata('context', { attempt: 1 });

        expect(error.metadata).toEqual({
            userId: '123',
            context: { attempt: 1 }
        });
    });

    it('should serialize to JSON correctly', () => {
        const error = new TestError('Serialization test');
        error.addMetadata('key', 'value');

        const json = error.toJSON();

        expect(json).toEqual(expect.objectContaining({
            message: 'Serialization test',
            code: 'TEST_ERROR',
            name: 'TestError',
            metadata: { key: 'value' }
        }));
        expect(json.timestamp).toBeDefined();
        expect(json.stack).toBeDefined();
    });
});
