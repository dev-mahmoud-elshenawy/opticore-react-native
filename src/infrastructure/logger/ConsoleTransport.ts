import { Platform } from 'react-native';
import { LogTransport } from './LogTransport';
import { LogEntry } from './LogEntry';
import { LogLevel } from './LogLevel';
import { LogFormatter } from './LogFormatter';

export interface ConsoleTransportOptions {
    minLevel?: LogLevel;
    formatter?: LogFormatter;
}

export class ConsoleTransport implements LogTransport {
    public readonly name = 'console';
    public minLevel?: LogLevel;
    private formatter?: LogFormatter;

    constructor(options: ConsoleTransportOptions = {}) {
        this.minLevel = options.minLevel;
        this.formatter = options.formatter;
    }

    public write(entry: LogEntry): void {
        if (this.minLevel !== undefined && entry.level < this.minLevel) {
            return;
        }

        const output = this.formatter
            ? this.formatter.format(entry)
            : this.formatDefault(entry);

        const args = entry.args || [];

        /* eslint-disable no-console */
        switch (entry.level) {
            case LogLevel.DEBUG:
                console.log(output, ...args);
                break;
            case LogLevel.INFO:
                console.info(output, ...args);
                break;
            case LogLevel.WARN:
                console.warn(output, ...args);
                break;
            case LogLevel.ERROR:
                if (entry.error) {
                    // We pass error separately so console can format stack trace nicely
                    console.error(output, entry.error, ...args);
                } else {
                    console.error(output, ...args);
                }
                break;
        }
        /* eslint-enable no-console */
    }

    private formatDefault(entry: LogEntry): string {
        const { level, message, timestamp } = entry;
        const levelLabel = LogLevel[level];

        // ANSI Colors:
        // We suppress them on native devices (iOS/Android) to avoid raw escape codes in Xcode/Logcat.
        // We keep them on other platforms (Web, Node/Test) where terminal output supports it.
        const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
        const useColors = !isNative;

        let colorPrefix = '';
        const reset = '\x1b[0m';

        if (useColors) {
            switch (level) {
                case LogLevel.DEBUG: colorPrefix = '\x1b[90m'; break; // Gray
                case LogLevel.INFO: colorPrefix = '\x1b[34m'; break;  // Blue
                case LogLevel.WARN: colorPrefix = '\x1b[33m'; break;  // Yellow
                case LogLevel.ERROR: colorPrefix = '\x1b[31m'; break; // Red
            }
        }

        const prefix = useColors
            ? `${colorPrefix}[${levelLabel}]${reset}`
            : `[${levelLabel}]`;

        // Format: [INFO] [2023-01-01T...] Message
        // Note: Logger.ts used `[timestamp] ` spacing.
        // timestamp is an ISO string.
        return `${prefix} [${timestamp}] ${message}`;
    }
}
