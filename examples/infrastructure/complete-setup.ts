/**
 * Complete Infrastructure Setup Example
 *
 * This example demonstrates how to configure and use all 5 infrastructure modules together:
 * - ApiClient: HTTP requests with auth
 * - StorageManager: Secure and local storage
 * - Logger: Configurable logging
 * - ConnectivityManager: Network monitoring
 * - LifecycleManager: App state tracking
 */

import {
    ApiClient,
    StorageManager,
    Logger,
    LogLevel,
    ConnectivityManager,
    LifecycleManager,
} from '../../src/infrastructure';

// =============================================================================
// 1. LOGGER CONFIGURATION
// =============================================================================

const logger = Logger.getInstance();

// Configure for development
logger.configure({
    level: LogLevel.DEBUG,
    enabled: true,
    showTimestamp: true,
    isProduction: false, // Set to true in production to disable all logs
});

logger.info('🚀 Infrastructure setup started');

// =============================================================================
// 2. STORAGE SETUP
// =============================================================================

const storage = StorageManager.getInstance();

async function setupStorage() {
    logger.debug('Setting up storage...');

    // Store user preferences in local storage
    await storage.local.set('theme', 'dark');
    await storage.local.set('language', 'en');
    await storage.local.set('notifications_enabled', true);

    // Store sensitive data in secure storage
    await storage.secure.set('user_credentials', {
        email: 'user@example.com',
        // Note: In real apps, never store passwords - use tokens!
    });

    logger.info('✓ Storage configured');
}

// =============================================================================
// 3. API CLIENT CONFIGURATION
// =============================================================================

const apiClient = ApiClient.getInstance();

async function setupApiClient() {
    logger.debug('Setting up API client...');

    apiClient.configure({
        baseURL: 'https://jsonplaceholder.typicode.com', // Example API
        timeout: 10000,
        headers: {
            'X-App-Version': '1.0.0',
            'X-Platform': 'react-native',
        },
        // Provide auth token from secure storage
        getAuthToken: async () => {
            return await storage.secure.get<string>('auth_token');
        },
        // Handle token refresh
        onTokenRefresh: async () => {
            logger.warn('Token refresh required');
            // In real app, call refresh endpoint here
            const newToken = 'refreshed-token-' + Date.now();
            await storage.secure.set('auth_token', newToken);
            return newToken;
        },
    });

    logger.info('✓ API client configured');
}

// =============================================================================
// 4. CONNECTIVITY MONITORING
// =============================================================================

const connectivity = ConnectivityManager.getInstance();

function setupConnectivity() {
    logger.debug('Setting up connectivity monitoring...');

    // Listen for connectivity changes
    connectivity.addListener((isConnected) => {
        if (isConnected) {
            logger.info('📶 Network: ONLINE - Syncing data...');
            // Sync offline queue here
            syncOfflineData();
        } else {
            logger.warn('📵 Network: OFFLINE - Queueing requests...');
            // Queue requests for later
        }
    });

    // Check current status
    if (connectivity.isConnected) {
        logger.info('📶 Initial network status: ONLINE');
    } else {
        logger.warn('📵 Initial network status: OFFLINE');
    }

    logger.info('✓ Connectivity monitoring active');
}

// =============================================================================
// 5. LIFECYCLE MONITORING
// =============================================================================

const lifecycle = LifecycleManager.getInstance();

function setupLifecycle() {
    logger.debug('Setting up lifecycle monitoring...');

    lifecycle.addObserver(
        // onActive callback
        () => {
            logger.info('🟢 App became ACTIVE');
            // Resume background tasks
            resumeTasks();
            // Refresh data
            refreshData();
        },
        // onInactive callback
        () => {
            logger.info('🟡 App became INACTIVE/BACKGROUND');
            // Pause background tasks
            pauseTasks();
            // Save app state
            saveAppState();
        }
    );

    logger.info('✓ Lifecycle monitoring active');
}

// =============================================================================
// EXAMPLE: MAKING API REQUESTS
// =============================================================================

async function fetchUserData() {
    try {
        logger.debug('Fetching user data...');

        // Check connectivity before making request
        if (!connectivity.isConnected) {
            logger.warn('Cannot fetch data: offline');
            // Return cached data if available
            return await storage.local.get('cached_user');
        }

        // Make API request
        const response = await apiClient.get<{ id: number; name: string; email: string }>(
            '/users/1'
        );

        logger.info('User data fetched:', response.data);

        // Cache the result
        await storage.local.set('cached_user', response.data);

        return response.data;
    } catch (error) {
        logger.error('Failed to fetch user data', error instanceof Error ? error : undefined);

        // Return cached data on error
        const cached = await storage.local.get('cached_user');
        if (cached) {
            logger.info('Returning cached user data');
            return cached;
        }

        throw error;
    }
}

async function createPost() {
    try {
        logger.debug('Creating new post...');

        const response = await apiClient.post('/posts', {
            title: 'Example Post',
            body: 'This is an example post created from the infrastructure demo.',
            userId: 1,
        });

        logger.info('Post created:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Failed to create post', error instanceof Error ? error : undefined);
        throw error;
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const offlineQueue: Array<() => Promise<unknown>> = [];

async function syncOfflineData() {
    logger.info(`Syncing ${offlineQueue.length} queued requests...`);

    while (offlineQueue.length > 0) {
        const request = offlineQueue.shift();
        if (request) {
            try {
                await request();
            } catch (error) {
                logger.error('Failed to sync request', error instanceof Error ? error : undefined);
            }
        }
    }

    logger.info('✓ Offline sync complete');
}

function pauseTasks() {
    logger.debug('Pausing background tasks...');
    // Stop timers, intervals, etc.
}

function resumeTasks() {
    logger.debug('Resuming background tasks...');
    // Restart timers, intervals, etc.
}

async function refreshData() {
    logger.debug('Refreshing data...');
    await fetchUserData();
}

async function saveAppState() {
    logger.debug('Saving app state...');

    const appState = {
        lastActive: new Date().toISOString(),
        // Add other state here
    };

    await storage.local.set('app_state', appState);
    logger.info('✓ App state saved');
}

// =============================================================================
// LOGIN FLOW EXAMPLE
// =============================================================================

export async function login(email: string, password: string) {
    try {
        logger.info('Logging in...');

        // In real app, this would call your auth endpoint
        const response = await apiClient.post<{ token: string; user: Record<string, unknown> }>('/auth/login', {
            email,
            password,
        });

        // Save auth token to secure storage
        await storage.secure.set('auth_token', response.data.token);

        // Save user data to local storage
        await storage.local.set('user', response.data.user);

        logger.info('✓ Login successful');
        return response.data.user;
    } catch (error) {
        logger.error('Login failed', error instanceof Error ? error : undefined);
        throw error;
    }
}

export async function logout() {
    logger.info('Logging out...');

    // Clear all stored data
    await storage.clearAll();

    logger.info('✓ Logout complete');
}

// =============================================================================
// MAIN SETUP FUNCTION
// =============================================================================

export async function setupInfrastructure() {
    logger.info('========================================');
    logger.info('  INFRASTRUCTURE SETUP');
    logger.info('========================================');

    // 1. Setup storage
    await setupStorage();

    // 2. Setup API client
    await setupApiClient();

    // 3. Setup connectivity monitoring
    setupConnectivity();

    // 4. Setup lifecycle monitoring
    setupLifecycle();

    logger.info('========================================');
    logger.info('  ✓ ALL SYSTEMS OPERATIONAL');
    logger.info('========================================');
}

// =============================================================================
// DEMO EXECUTION
// =============================================================================

export async function runDemo() {
    // Setup infrastructure
    await setupInfrastructure();

    // Demo API calls
    logger.info('\n--- API Demo ---');
    await fetchUserData();
    await createPost();

    // Demo login (would fail with placeholder API, but shows the flow)
    // await login('user@example.com', 'password');

    logger.info('\n✓ Demo complete!');
    logger.info('In a real React Native app, call setupInfrastructure() in your App.tsx');
}

// Run demo if executed directly
if (require.main === module) {
    runDemo().catch((error) => {
        logger.error('Demo failed', error instanceof Error ? error : undefined);
        process.exit(1);
    });
}
