import { LogLevel } from '../LogLevel';

export interface ILogger {
    /**
     * Configure the logger
     */
    configure(config: { level: LogLevel; enabled: boolean; showTimestamp: boolean }): void;

    /**
     * Log a debug message (gray)
     */
    debug(message: string, ...args: any[]): void;

    /**
     * Log an info message (blue)
     */
    info(message: string, ...args: any[]): void;

    /**
     * Log a warning message (yellow)
     */
    warn(message: string, ...args: any[]): void;

    /**
     * Log an error message (red)
     */
    error(message: string, error?: unknown, ...args: any[]): void;
}
