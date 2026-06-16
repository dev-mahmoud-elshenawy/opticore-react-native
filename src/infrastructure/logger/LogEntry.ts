import { LogLevel } from './LogLevel';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    args?: unknown[];
    error?: Error;
    metadata?: Record<string, unknown>;
    /** When false, formatters should omit the timestamp (honors LoggerConfig.showTimestamp). */
    showTimestamp?: boolean;
}
