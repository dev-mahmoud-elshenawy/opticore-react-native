import { Logger } from '../infrastructure/logger/Logger';
import type { LogTransport } from '../infrastructure/logger/LogTransport';
import type { LogLevel } from '../infrastructure/logger/LogLevel';

/**
 * Logging for app code — level-filtered logging plus transport and level
 * management. No `.getInstance()`.
 *
 * ```ts
 * logger.info('ready', { userId: '123' });
 * logger.setLevel(LogLevel.WARN);
 * logger.addTransport(sentryTransport);
 * ```
 *
 * Each method resolves the singleton lazily, so importing this module has no
 * side effects.
 */
export const logger = {
  // --- logging ---
  debug: (message: string, ...args: unknown[]): void =>
    Logger.getInstance().debug(message, ...args),
  info: (message: string, ...args: unknown[]): void => Logger.getInstance().info(message, ...args),
  warn: (message: string, ...args: unknown[]): void => Logger.getInstance().warn(message, ...args),
  error: (message: string, error?: Error, ...args: unknown[]): void =>
    Logger.getInstance().error(message, error, ...args),

  // --- level ---
  /** Change the minimum level emitted at runtime. */
  setLevel: (level: LogLevel): void => Logger.getInstance().configure({ level }),

  // --- transports ---
  addTransport: (transport: LogTransport): void => Logger.getInstance().addTransport(transport),
  removeTransport: (name: string): boolean => Logger.getInstance().removeTransport(name),
  clearTransports: (): void => Logger.getInstance().clearTransports(),
} as const;
