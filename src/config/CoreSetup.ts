import { CoreConfig } from './types';
import { ApiClient } from '../infrastructure/network/ApiClient';
import { Logger } from '../infrastructure/logger/Logger';
import { LogLevel } from '../infrastructure/logger/LogLevel';
import { ErrorHandler } from '../types/Error.types';
import { ConfigValidator } from './ConfigValidator';

/**
 * Singleton class to handle OptiCore configuration and initialization
 */
export class CoreSetup {
    private static instance: CoreSetup;
    private config: CoreConfig | null = null;
    private initialized = false;
    private errorHandler?: ErrorHandler;

    private constructor() { }

    /**
     * Get the singleton instance
     */
    public static getInstance(): CoreSetup {
        if (!CoreSetup.instance) {
            CoreSetup.instance = new CoreSetup();
        }
        return CoreSetup.instance;
    }

    /**
     * Initialize the package with configuration
     *
     * @param config The configuration object
     *
     * @remarks
     * **Debug Mode Override**: When `config.features.debugMode` is enabled,
     * it will override the `config.logger.level` setting and force `LogLevel.DEBUG`.
     * This ensures maximum verbosity during debugging sessions regardless of the
     * configured log level.
     *
     * @example
     * ```typescript
     * CoreSetup.getInstance().init({
     *   api: { baseURL: 'https://api.example.com' },
     *   logger: { level: LogLevel.ERROR },  // This will be overridden
     *   features: { debugMode: true }        // Forces DEBUG level
     * });
     * ```
     */
    public init(config: CoreConfig): void {
        ConfigValidator.validate(config);

        this.config = config;

        // Configure API Client
        const apiClient = ApiClient.getInstance();
        apiClient.configure({
            baseURL: config.api.baseURL,
            timeout: config.api.timeout,
            headers: config.api.headers,
            getAuthToken: config.api.getAuthToken
                ? async () => Promise.resolve(config.api.getAuthToken!())
                : undefined,
        });

        // Configure Logger
        if (config.logger || config.features?.debugMode) {
            const logger = Logger.getInstance();
            let level = config.logger?.level ?? LogLevel.ERROR;

            // Force DEBUG level if debugMode is enabled
            // IMPORTANT: debugMode takes precedence over configured logger.level
            // This ensures maximum log verbosity during debugging sessions
            if (config.features?.debugMode) {
                level = LogLevel.DEBUG;
            }

            logger.configure({
                level: level,
                enabled: config.logger ? !config.logger.disabled : true,
            });
        }

        // Configure Global Error Handler if provided
        if (config.onError) {
            this.errorHandler = config.onError;
        }

        this.initialized = true;
    }

    /**
     * Get the current configuration
     * @throws Error if not initialized
     */
    public getConfig(): CoreConfig {
        if (!this.initialized || !this.config) {
            throw new Error('OptiCore not initialized. Call CoreSetup.init() first.');
        }
        return this.config;
    }

    /**
     * Get the registered global error handler
     */
    public getErrorHandler(): ErrorHandler | undefined {
        return this.errorHandler;
    }
}

export const coreSetup = CoreSetup.getInstance();
