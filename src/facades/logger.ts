import { Logger } from '../infrastructure/logger/Logger';

/**
 * Ergonomic facade over the {@link Logger} singleton — call `logger.info(...)`
 * instead of `Logger.getInstance().info(...)`.
 *
 * Each method resolves the singleton lazily per call, so importing this module
 * has no side effects (the singleton is never touched at module-evaluation time).
 * Behavior is identical to calling the singleton directly.
 */
export const logger = {
  debug: (message: string, ...args: unknown[]): void => Logger.getInstance().debug(message, ...args),
  info: (message: string, ...args: unknown[]): void => Logger.getInstance().info(message, ...args),
  warn: (message: string, ...args: unknown[]): void => Logger.getInstance().warn(message, ...args),
  error: (message: string, error?: Error, ...args: unknown[]): void =>
    Logger.getInstance().error(message, error, ...args),
} as const;
