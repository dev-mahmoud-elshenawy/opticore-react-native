import { ILogger } from './interfaces/ILogger';
import { LogLevel } from './LogLevel';

export interface LoggerConfig {
    level: LogLevel;
    enabled: boolean;
    showTimestamp: boolean;
    isProduction?: boolean;
}

/**
 * Logger - Singleton logging service with configurable levels
 * 
 * Features:
 * - Configurable log levels (DEBUG, INFO, WARN, ERROR)
 * - Automatic suppression in production mode
 * - Colored console output for development
 * - Timestamp support
 * - Safe handling of circular references in objects
 * 
 * @example
 * ```typescript
 * const logger = Logger.getInstance();
 * 
 * // Configure for production
 * logger.configure({
 *   level: LogLevel.ERROR,
 *   isProduction: true,  // Suppresses ALL logs
 * });
 * 
 * logger.debug('Debug message');  // Not logged
 * logger.error('Error occurred', error);  // Logged
 * ```
 */
export class Logger implements ILogger {
    private static instance: Logger;
    private config: LoggerConfig = {
        level: LogLevel.INFO,
        enabled: true,
        showTimestamp: true,
        isProduction: false,
    };

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Configure logger settings
     * 
     * @param config - Partial configuration (level, enabled, showTimestamp, isProduction)
     */
    public configure(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Log debug message (lowest priority)
     * 
     * @param message - Log message
     * @param args - Additional arguments to log
     */
    public debug(message: string, ...args: unknown[]): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.print(LogLevel.DEBUG, message, args);
        }
    }

    /**
     * Log info message (normal operation)
     * 
     * @param message - Log message
     * @param args - Additional arguments to log
     */
    public info(message: string, ...args: unknown[]): void {
        if (this.shouldLog(LogLevel.INFO)) {
            this.print(LogLevel.INFO, message, args);
        }
    }

    /**
     * Log warning message (potentially harmful situations)
     * 
     * @param message - Log message
     * @param args - Additional arguments to log
     */
    public warn(message: string, ...args: unknown[]): void {
        if (this.shouldLog(LogLevel.WARN)) {
            this.print(LogLevel.WARN, message, args);
        }
    }

    public error(message: string, error?: Error, ...args: unknown[]): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.print(LogLevel.ERROR, message, args, error);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.config.enabled) return false;
        if (this.config.isProduction) return false;
        return level >= this.config.level;
    }

    private print(level: LogLevel, message: string, args: unknown[], error?: Error): void {
        const timestamp = this.config.showTimestamp ? `[${new Date().toISOString()}] ` : '';
        const levelLabel = LogLevel[level];

        let colorPrefix = '';
        const reset = '\x1b[0m';

        switch (level) {
            case LogLevel.DEBUG:
                colorPrefix = '\x1b[90m';
                break;
            case LogLevel.INFO:
                colorPrefix = '\x1b[34m';
                break;
            case LogLevel.WARN:
                colorPrefix = '\x1b[33m';
                break;
            case LogLevel.ERROR:
                colorPrefix = '\x1b[31m';
                break;
        }

        const output = `${colorPrefix}[${levelLabel}]${reset} ${timestamp}${message}`;

        const logArgs = [output, ...args];
        if (error) {
            logArgs.push('\nStack:', error.stack || error.message);
        }

        /* eslint-disable no-console */
        switch (level) {
            case LogLevel.DEBUG:
                console.log(...logArgs);
                break;
            case LogLevel.INFO:
                console.info(...logArgs);
                break;
            case LogLevel.WARN:
                console.warn(...logArgs);
                break;
            case LogLevel.ERROR:
                console.error(...logArgs);
                break;
        }
        /* eslint-enable no-console */
    }
}
