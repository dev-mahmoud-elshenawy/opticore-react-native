import { LogEntry } from '../../../src/infrastructure/logger/LogEntry';
import { LogLevel } from '../../../src/infrastructure/logger/LogLevel';
import { JsonFormatter } from '../../../src/infrastructure/logger/LogFormatter';

describe('LogFormatter', () => {
    describe('JsonFormatter', () => {
        let formatter: JsonFormatter;

        beforeEach(() => {
            formatter = new JsonFormatter();
        });

        it('should format entry as JSON string', () => {
            const entry: LogEntry = {
                level: LogLevel.INFO,
                message: 'test message',
                timestamp: '2023-01-01T00:00:00.000Z'
            };

            const result = formatter.format(entry);
            const parsed = JSON.parse(result);

            expect(parsed).toEqual(expect.objectContaining({
                level: 'INFO',
                message: 'test message',
                timestamp: '2023-01-01T00:00:00.000Z'
            }));
        });

        it('should include metadata', () => {
            const entry: LogEntry = {
                level: LogLevel.DEBUG,
                message: 'test',
                timestamp: '2023-01-01T00:00:00.000Z',
                metadata: { key: 'value' }
            };

            const result = formatter.format(entry);
            const parsed = JSON.parse(result);

            expect(parsed.metadata).toEqual({ key: 'value' });
        });

        it('should serialize errors correctly', () => {
            const error = new Error('Test Error');
            const entry: LogEntry = {
                level: LogLevel.ERROR,
                message: 'fail',
                timestamp: '2023-01-01T00:00:00.000Z',
                error
            };

            const result = formatter.format(entry);
            const parsed = JSON.parse(result);

            expect(parsed.error).toBeDefined();
            expect(parsed.error.message).toBe('Test Error');
            expect(parsed.error.name).toBe('Error');
            expect(parsed.error.stack).toBeDefined();
        });

        it('should handle circular references safely', () => {
            const circular: any = { a: 1 };
            circular.self = circular;

            const entry: LogEntry = {
                level: LogLevel.INFO,
                message: 'circular',
                timestamp: '2023-01-01T00:00:00.000Z',
                metadata: circular
            };

            expect(() => formatter.format(entry)).not.toThrow();
            const result = formatter.format(entry);
            expect(result).toContain('"message":"circular"');
            // Check that circular ref didn't crash
        });
    });
});
