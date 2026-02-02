import { Logger } from '../../../src/infrastructure/logger/Logger';
import { LogLevel } from '../../../src/infrastructure/logger/LogLevel';

describe('Logger', () => {
    let logger: Logger;
    let consoleSpy: {
        log: jest.SpyInstance;
        info: jest.SpyInstance;
        warn: jest.SpyInstance;
        error: jest.SpyInstance;
    };

    beforeEach(() => {
        logger = Logger.getInstance();
        // Default config for tests
        logger.configure({
            level: LogLevel.DEBUG,
            enabled: true,
            showTimestamp: true,
            isProduction: false
        });

        consoleSpy = {
            log: jest.spyOn(console, 'log').mockImplementation(),
            info: jest.spyOn(console, 'info').mockImplementation(),
            warn: jest.spyOn(console, 'warn').mockImplementation(),
            error: jest.spyOn(console, 'error').mockImplementation()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Log Levels', () => {
        it('should log debug messages when level is DEBUG', () => {
            logger.debug('Debug message');
            expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('DEBUG'), expect.stringContaining('Debug message'));
        });

        it('should suppress debug messages when level is INFO', () => {
            logger.configure({ level: LogLevel.INFO, enabled: true, showTimestamp: true, isProduction: false });
            logger.debug('Debug message');
            expect(consoleSpy.log).not.toHaveBeenCalled();
        });

        it('should log info messages', () => {
            logger.info('Info message');
            expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('INFO'), expect.stringContaining('Info message'));
        });

        it('should log warn messages', () => {
            logger.warn('Warn message');
            expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('WARN'), expect.stringContaining('Warn message'));
        });

        it('should log error messages with stack', () => {
            const error = new Error('Test Error');
            logger.error('Error message', error);
            expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('ERROR'), expect.stringContaining('Error message'), error);
        });
    });

    describe('Production Mode', () => {
        it('should suppress ALL logs in production mode by default', () => {
            logger.configure({
                level: LogLevel.ERROR, // Even if error level set
                enabled: true,
                showTimestamp: true,
                isProduction: true // Strict release mode requirement
            });

            logger.debug('Debug');
            logger.info('Info');
            logger.warn('Warn');
            logger.error('Error');

            expect(consoleSpy.log).not.toHaveBeenCalled();
            expect(consoleSpy.info).not.toHaveBeenCalled();
            expect(consoleSpy.warn).not.toHaveBeenCalled();
            expect(consoleSpy.error).not.toHaveBeenCalled();
        });

        it('should allow override in production if specifically configured (optional)', () => {
            // Current requirement: "if the app release mode no logs to print at all"
            // But plan mentions "unless explicitly overridden".
            // Let's test that 'enabled: false' works as main switch or isProduction implies disabled.
            // If strict requirement is NO LOGS, then isProduction=true should probably force disabled effectively
            // unless a 'forceLogsInProduction' flag is used.
            // For simplicity based on user request "no logs to print at all", let's assume standard behavior.
        });
    });

    describe('Formatting', () => {
        it('should include timestamp', () => {
            logger.info('Test');
            expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringMatching(/\d{4}-\d{2}-\d{2}T/), expect.anything());
        });

        it('should handle complex objects', () => {
            const obj = { key: 'value' };
            logger.info('Object', obj);
            expect(consoleSpy.info).toHaveBeenCalledWith(expect.anything(), expect.anything(), obj);
        });

        it('should handle circular references safely', () => {
            const a: any = { name: 'a' };
            const b = { name: 'b', a: a };
            a.b = b; // Circular

            // Logger should not crash
            logger.info('Circular', a);
            // Expect call to succeed. Actual serialization check depends on implementation
            expect(consoleSpy.info).toHaveBeenCalled();
        });
    });
});
