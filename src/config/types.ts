import { LogLevel } from '../infrastructure/logger/LogLevel';
import { ErrorHandler } from '../types/Error.types';

/**
 * Configuration for the API client
 */
export interface ApiConfig {
  /**
   * Base URL for all API requests
   * @example "https://api.example.com/v1"
   */
  baseURL: string;

  /**
   * Default request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Default headers to include in all requests
   */
  headers?: Record<string, string>;

  /**
   * Callback to retrieve the current authentication token
   * @returns The bearer token string or null if not authenticated
   */
  getAuthToken?: () => string | null | Promise<string | null>;
}

/**
 * Configuration for the Logger
 */
export interface CoreLoggerConfig {
  /**
   * Minimum log level to output
   * @default LogLevel.INFO
   */
  level?: LogLevel;

  /**
   * Whether to disable all logs (useful for production)
   * @default false
   */
  disabled?: boolean;
}

/**
 * Configuration for special app modes
 */
export interface FeaturesConfig {
  /**
   * maintenance mode active state
   */
  maintenanceMode?: boolean;

  /**
   * offline mode active state
   */
  offlineMode?: boolean;

  /**
   * debug mode active state
   */
  debugMode?: boolean;
}

/**
 * Main OptiCore configuration interface
 */
export interface CoreConfig {
  /** API Client configuration */
  api: ApiConfig;

  /** Logger configuration */
  logger?: CoreLoggerConfig;

  /** Global error handler */
  onError?: ErrorHandler;

  /** Feature flags and special modes */
  features?: FeaturesConfig;
}
