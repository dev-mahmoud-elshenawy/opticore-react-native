import { LogLevel } from '../infrastructure/logger/LogLevel';
import { ErrorHandler } from '../types/Error.types';

/**
 * Configuration for the API client
 */
import { ThemeConfig, Theme } from '../theme/types';
import { OfflineSyncConfig } from '../offline/types';
import { ErrorClassificationRule } from '../error/ErrorClassifier';

// ... imports

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
 * Configuration for Responsive Design
 */
export interface ResponsiveConfig {
  /**
   * Custom breakpoints for responsive hooks
   * @default { small: 360, medium: 768, large: 1024 }
   */
  breakpoints?: {
    small?: number;
    medium?: number;
    large?: number;
  };
}

/**
 * Configuration for Forms
 */
export interface FormsConfig {
  /**
   * Default format pattern for phone numbers
   */
  defaultPhoneFormat?: string;

  /**
   * Default currency code
   */
  defaultCurrency?: string;

  /**
   * Custom regex patterns for credit card validation
   */
  customCardPatterns?: Record<string, RegExp>;
}

/**
 * Configuration for Error Classification
 */
export interface ErrorClassificationConfig {
  /**
   * Custom rules for classifying errors
   */
  customRules?: ErrorClassificationRule[];
}

/**
 * Configuration for Theming
 */
export interface CoreThemeConfig extends ThemeConfig {
  /**
   * Custom themes to register on initialization
   */
  customThemes?: Record<string, Theme>;
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

  /** Theme configuration */
  theme?: CoreThemeConfig;

  /** Offline sync configuration */
  offline?: OfflineSyncConfig;

  /** Responsive design configuration */
  responsive?: ResponsiveConfig;

  /** Forms configuration */
  forms?: FormsConfig;

  /** Error classification configuration */
  errorClassification?: ErrorClassificationConfig;
}
