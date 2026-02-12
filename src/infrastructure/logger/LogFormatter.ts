import { LogEntry } from './LogEntry';

export interface LogFormatter {
    format(entry: LogEntry): string;
}

export class JsonFormatter implements LogFormatter {
    public format(entry: LogEntry): string {
        return JSON.stringify(entry, this.getReplacer());
    }

    private getReplacer() {
        const seen = new WeakSet();
        return (_key: string, value: any) => {
            // Handle Error objects specifically as they don't stringify well
            if (value instanceof Error) {
                // Extract known properties and rest
                const { name, message, stack, ...rest } = value as any;
                return {
                    name,
                    message,
                    stack,
                    ...rest
                };
            }

            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        };
    }
}
