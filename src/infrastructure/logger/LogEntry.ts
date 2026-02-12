import { LogLevel } from './LogLevel';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    args?: unknown[];
    error?: Error;
    metadata?: Record<string, unknown>;
}
