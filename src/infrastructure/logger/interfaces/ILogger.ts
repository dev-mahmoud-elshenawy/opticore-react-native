import type { LoggerConfig } from '../Logger';

export interface ILogger {
  configure(config: Partial<LoggerConfig>): void;
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, error?: Error, ...args: unknown[]): void;
}
