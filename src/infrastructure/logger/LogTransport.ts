import { LogLevel } from './LogLevel';
import { LogEntry } from './LogEntry';

export interface LogTransport {
  name: string;
  minLevel?: LogLevel;
  write(entry: LogEntry): void | Promise<void>;
}
