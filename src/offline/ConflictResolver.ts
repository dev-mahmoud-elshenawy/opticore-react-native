import { ConflictStrategy, ConflictHandler } from './types';
import { Logger } from '../infrastructure/logger/Logger';

/**
 * Handles data conflicts during synchronization
 */
export class ConflictResolver {
    private strategy: ConflictStrategy;
    private onConflict?: ConflictHandler;

    /**
     * Creates a new ConflictResolver
     * @param strategy - Resolution strategy ('client-wins', 'server-wins', 'manual')
     * @param onConflict - Callback for manual resolution (required if strategy is 'manual')
     */
    constructor(strategy: ConflictStrategy = 'server-wins', onConflict?: ConflictHandler) {
        this.strategy = strategy;
        this.onConflict = onConflict;

        if (this.strategy === 'manual' && !this.onConflict) {
            Logger.getInstance().warn('ConflictResolver: Strategy is "manual" but no onConflict handler provided. Falling back to "server-wins".');
        }
    }

    /**
     * Resolves a conflict between local and server data
     * @param localData - Data currently on the client/request
     * @param serverData - Data received from the server
     * @returns The resolved data to keep
     */
    public async resolve<T>(localData: T, serverData: T): Promise<T> {
        const logger = Logger.getInstance();

        try {
            switch (this.strategy) {
                case 'client-wins':
                    return localData;

                case 'server-wins':
                    return serverData;

                case 'manual':
                    if (this.onConflict) {
                        try {
                            const result = await this.onConflict(localData, serverData);
                            return result as T;
                        } catch (error) {
                            logger.error('ConflictResolver: Manual resolution failed', error as Error);
                            // Fallback to server-wins on failure
                            return serverData;
                        }
                    } else {
                        // Fallback if no handler
                        logger.warn('ConflictResolver: No manual handler, defaulting to server-wins');
                        return serverData;
                    }

                default:
                    logger.warn(`ConflictResolver: Unknown strategy "${this.strategy}", defaulting to server-wins`);
                    return serverData;
            }
        } catch (error) {
            logger.error('ConflictResolver: Unexpected error during resolution', error as Error);
            return serverData;
        }
    }
}
