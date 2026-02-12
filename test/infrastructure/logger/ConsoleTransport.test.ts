import { Platform } from 'react-native';
import { ConsoleTransport } from '../../../src/infrastructure/logger/ConsoleTransport';
import { LogLevel } from '../../../src/infrastructure/logger/LogLevel';
import { LogEntry } from '../../../src/infrastructure/logger/LogEntry';

describe('ConsoleTransport', () => {
    let transport: ConsoleTransport;

    beforeEach(() => {
        transport = new ConsoleTransport();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'info').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should have correct name', () => {
        expect(transport.name).toBe('console');
    });

    it('should respect minLevel', () => {
        transport = new ConsoleTransport({ minLevel: LogLevel.WARN });

        transport.write({
            level: LogLevel.INFO,
            message: 'test',
            timestamp: new Date().toISOString()
        });

        expect(console.info).not.toHaveBeenCalled();

        transport.write({
            level: LogLevel.WARN,
            message: 'test',
            timestamp: new Date().toISOString()
        });

        expect(console.warn).toHaveBeenCalled();
    });

    it('should map log levels to console methods', () => {
        const entry: LogEntry = {
            level: LogLevel.DEBUG,
            message: 'test',
            timestamp: new Date().toISOString()
        };

        transport.write({ ...entry, level: LogLevel.DEBUG });
        expect(console.log).toHaveBeenCalled();

        transport.write({ ...entry, level: LogLevel.INFO });
        expect(console.info).toHaveBeenCalled();

        transport.write({ ...entry, level: LogLevel.WARN });
        expect(console.warn).toHaveBeenCalled();

        transport.write({ ...entry, level: LogLevel.ERROR });
        expect(console.error).toHaveBeenCalled();
    });

    it('should handle errors correctly', () => {
        const error = new Error('Test Error');
        transport.write({
            level: LogLevel.ERROR,
            message: 'fail',
            timestamp: new Date().toISOString(),
            error
        });

        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('fail'),
            error
        );
    });

    describe('Platform specific behavior', () => {
        it('should use ANSI colors on web/terminal', () => {
            Object.defineProperty(Platform, 'OS', { get: () => 'web', configurable: true });

            transport.write({
                level: LogLevel.INFO,
                message: 'colored',
                timestamp: new Date().toISOString()
            });

            const calls = (console.info as jest.Mock).mock.calls;
            expect(calls.length).toBeGreaterThan(0);
            const loggedMessage = calls[0][0];

            expect(loggedMessage).toMatch(/\x1b\[/); // Has ANSI
            expect(loggedMessage).toContain('colored');
        });

        it('should NOT use ANSI colors on iOS', () => {
            Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });

            transport.write({
                level: LogLevel.INFO,
                message: 'plain',
                timestamp: new Date().toISOString()
            });

            const calls = (console.info as jest.Mock).mock.calls;
            expect(calls.length).toBeGreaterThan(0);
            const loggedMessage = calls[0][0];

            expect(loggedMessage).not.toMatch(/\x1b\[/); // No ANSI
            expect(loggedMessage).toContain('plain');
        });
    });
});
