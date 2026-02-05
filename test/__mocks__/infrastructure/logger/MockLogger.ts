type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    data?: any;
    timestamp: Date;
}

/**
 * MockLogger - Test double for Logger
 *
 * Captures all log calls for testing and assertions.
 * Does not output to console unless explicitly enabled.
 */
export class MockLogger {
    public logs: LogEntry[] = [];
    public silent: boolean = true;

    /**
     * Log debug message
     */
    debug(message: string, data?: any): void {
        this.log('debug', message, data);
    }

    /**
     * Log info message
     */
    info(message: string, data?: any): void {
        this.log('info', message, data);
    }

    /**
     * Log warning message
     */
    warn(message: string, data?: any): void {
        this.log('warn', message, data);
    }

    /**
     * Log error message
     */
    error(message: string, data?: any): void {
        this.log('error', message, data);
    }

    /**
     * Internal log method
     */
    private log(level: LogLevel, message: string, data?: any): void {
        const entry: LogEntry = {
            level,
            message,
            data,
            timestamp: new Date(),
        };

        this.logs.push(entry);

        if (!this.silent) {
            console[level](message, data);
        }
    }

    /**
     * Get logs by level
     */
    getLogsByLevel(level: LogLevel): LogEntry[] {
        return this.logs.filter((log) => log.level === level);
    }

    /**
     * Check if message was logged
     */
    hasMessage(message: string): boolean {
        return this.logs.some((log) => log.message.includes(message));
    }

    /**
     * Check if message was logged at specific level
     */
    hasMessageAtLevel(message: string, level: LogLevel): boolean {
        return this.logs.some((log) => log.level === level && log.message.includes(message));
    }

    /**
     * Get last log entry
     */
    getLastLog(): LogEntry | undefined {
        return this.logs[this.logs.length - 1];
    }

    /**
     * Clear all logs
     */
    clear(): void {
        this.logs = [];
    }

    /**
     * Get log count
     */
    get count(): number {
        return this.logs.length;
    }

    /**
     * Enable console output
     */
    enableConsole(): void {
        this.silent = false;
    }

    /**
     * Disable console output (default)
     */
    disableConsole(): void {
        this.silent = true;
    }
}
