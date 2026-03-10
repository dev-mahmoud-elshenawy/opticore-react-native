import { ILogger } from './interfaces/ILogger';
import { LogLevel } from './LogLevel';
import { LogTransport } from './LogTransport';
import { ConsoleTransport } from './ConsoleTransport';
import { LogEntry } from './LogEntry';

export interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  showTimestamp: boolean;
  isProduction?: boolean;
}

/**
 * Logger - Singleton logging service with configurable levels and transports
 */
export class Logger implements ILogger {
  private static instance: Logger;
  private transports: LogTransport[] = [];
  private config: LoggerConfig = {
    level: LogLevel.INFO,
    enabled: true,
    showTimestamp: true,
    isProduction: false,
  };

  private constructor() {
    // Default transport
    // We don't set minLevel here so it relies on the Logger's global level configuration
    this.addTransport(new ConsoleTransport());
  }

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

    // Update existing console transport if level changed?
    // Or we expect users to manage transports separately.
    // For backward compatibility, if 'level' is updated in config, 
    // we might want to update the default console transport if it exists?
    // But referencing specific transport is hard.
    // We'll rely on global filtering in `shouldLog` or `print`.
  }

  /**
   * Add a custom transport
   */
  public addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Remove a transport by name
   */
  public removeTransport(name: string): boolean {
    const initialLength = this.transports.length;
    this.transports = this.transports.filter(t => t.name !== name);
    return this.transports.length !== initialLength;
  }

  /**
   * Clear all transports
   */
  public clearTransports(): void {
    this.transports = [];
  }

  public debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }

  public info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, args);
  }

  public warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, args);
  }

  public error(message: string, error?: Error, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, args, error);
  }

  private log(level: LogLevel, message: string, args: unknown[], error?: Error): void {
    // Global filter first
    if (!this.config.enabled) return;
    if (this.config.isProduction) return;
    if (level < this.config.level) return;

    // Safety check: if no transports, add console
    if (this.transports.length === 0) {
      this.addTransport(new ConsoleTransport({ minLevel: this.config.level }));
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      args: args.length > 0 ? args : undefined,
      error,
    };

    this.transports.forEach(transport => {
      try {
        // Transport-level filtering
        if (transport.minLevel !== undefined && level < transport.minLevel) {
          return;
        }
        transport.write(entry);
      } catch (err) {
        // Cannot use Logger here (would cycle), so fall back to console
        console.error('Logger transport failed:', err);
      }
    });
  }
}
