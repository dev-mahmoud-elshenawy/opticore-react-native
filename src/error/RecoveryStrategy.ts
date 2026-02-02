/**
 * Defines a recovery strategy that can be attached to an error.
 */
export interface RecoveryStrategy {
    /** Unique type identifier for the strategy */
    readonly type: string;

    /** User-facing label (e.g., "Retry", "Log In") */
    readonly label: string;

    /** Execute the recovery action */
    execute(): Promise<void>;
}

/**
 * Standard Retry Strategy
 * Re-executes a failed operation.
 */
export class RetryStrategy implements RecoveryStrategy {
    public readonly type = 'RETRY';
    public readonly label = 'Retry';

    constructor(private action: () => Promise<unknown>) { }

    async execute(): Promise<void> {
        await this.action();
    }
}

/**
 * Refresh Token Strategy
 * Refreshes authentication token.
 */
export class RefreshTokenStrategy implements RecoveryStrategy {
    public readonly type = 'REFRESH_TOKEN';
    public readonly label = 'Reconnect Session';

    constructor(private refreshAction: () => Promise<unknown>) { }

    async execute(): Promise<void> {
        await this.refreshAction();
    }
}

/**
 * Clear Cache Strategy
 * Clears local data/cache.
 */
export class ClearCacheStrategy implements RecoveryStrategy {
    public readonly type = 'CLEAR_CACHE';
    public readonly label = 'Clear Data';

    constructor(private clearAction: () => Promise<unknown>) { }

    async execute(): Promise<void> {
        await this.clearAction();
    }
}
