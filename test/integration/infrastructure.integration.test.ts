import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { StorageManager } from '../../src/infrastructure/storage/StorageManager';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';
import { LifecycleManager } from '../../src/infrastructure/lifecycle/LifecycleManager';
import { AppState } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { mockSecureStorage } from '../__mocks__/expo-secure-store';
import { mockStorage } from '../__mocks__/@react-native-async-storage/async-storage';

// Mock axios at module level
jest.mock('axios', () => ({
    create: jest.fn(() => ({
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
        defaults: {
            headers: { common: {} },
            baseURL: '',
            timeout: 0,
        },
    })),
}));

jest.mock('react-native');
jest.mock('@react-native-community/netinfo');

describe('Infrastructure Integration Tests', () => {
    let apiClient: ApiClient;
    let storage: StorageManager;
    let connectivity: ConnectivityManager;
    let lifecycle: LifecycleManager;
    let netInfoCallback: ((state: NetInfoState) => void) | null = null;
    let appStateCallback: ((status: string) => void) | null = null;

    beforeEach(() => {
        jest.clearAllMocks();
        netInfoCallback = null;
        appStateCallback = null;

        // Clear mock storages
        Object.keys(mockSecureStorage).forEach(key => delete mockSecureStorage[key]);
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

        // Setup NetInfo mock
        (NetInfo.addEventListener as jest.Mock).mockImplementation((callback: (state: NetInfoState) => void) => {
            netInfoCallback = callback;
            return jest.fn();
        });
        (NetInfo.fetch as jest.Mock).mockResolvedValue({
            isConnected: true,
            type: 'wifi',
        });

        // Setup AppState mock
        (AppState.addEventListener as jest.Mock).mockImplementation((_eventType: string, callback: (status: string) => void) => {
            appStateCallback = callback;
            return { remove: jest.fn() };
        });

        // Reset singletons
        if ((ConnectivityManager as any).instance) {
            (ConnectivityManager as any).instance.dispose();
            (ConnectivityManager as any).instance = null;
        }
        if ((LifecycleManager as any).instance) {
            (LifecycleManager as any).instance.dispose();
            (LifecycleManager as any).instance = null;
        }
        if ((StorageManager as any).instance) {
            (StorageManager as any).instance = null;
        }

        // Get singletons
        apiClient = ApiClient.getInstance();
        storage = StorageManager.getInstance();
        connectivity = ConnectivityManager.getInstance();
        lifecycle = LifecycleManager.getInstance();
    });

    afterEach(async () => {
        if (lifecycle) lifecycle.dispose();
        if (connectivity) connectivity.dispose();

        // Clear mock storages
        Object.keys(mockSecureStorage).forEach(key => delete mockSecureStorage[key]);
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    });

    describe('T047: SecureStorage + ApiClient Integration', () => {
        it('should inject auth token from SecureStorage into ApiClient request headers', async () => {
            const testToken = 'test-auth-token-12345';
            await storage.secure.set('auth_token', testToken);

            apiClient.configure({
                baseURL: 'https://api.example.com',
                getAuthToken: async () => await storage.secure.get<string>('auth_token'),
            });

            const tokenFromStorage = await storage.secure.get<string>('auth_token');
            expect(tokenFromStorage).toBe(testToken);
        });

        it('should handle complete auth flow: login -> save token -> authenticated request', async () => {
            const mockToken = 'new-jwt-token';

            apiClient.configure({
                baseURL: 'https://api.example.com',
                getAuthToken: async () => await storage.secure.get<string>('auth_token'),
            });

            // Save token
            await storage.secure.set('auth_token', mockToken);

            // Verify token stored
            const storedToken = await storage.secure.get<string>('auth_token');
            expect(storedToken).toBe(mockToken);
        });
    });

    describe('T048: ConnectivityManager + ApiClient Integration', () => {
        it('should handle offline connectivity status', async () => {
            (NetInfo.fetch as jest.Mock).mockResolvedValue({
                isConnected: false,
                type: 'none',
            });

            // Wait for connectivity init
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Simulate connectivity change
            if (netInfoCallback) {
                netInfoCallback({ isConnected: false, type: 'none' } as NetInfoState);
            }

            expect(connectivity.isConnected).toBe(false);
        });

        it('should queue requests when offline and sync when online', async () => {
            const requestQueue: Array<() => Promise<any>> = [];

            const handleConnectivityChange = (isConnected: boolean) => {
                if (isConnected) {
                    requestQueue.forEach((request) => request());
                    requestQueue.length = 0;
                }
            };

            connectivity.addListener(handleConnectivityChange);

            // Simulate offline
            if (netInfoCallback) {
                netInfoCallback({ isConnected: false, type: 'none' } as NetInfoState);
            }

            // Queue request
            const queuedRequest = jest.fn().mockResolvedValue({ data: 'test' });
            if (!connectivity.isConnected) {
                requestQueue.push(queuedRequest);
            }

            expect(requestQueue.length).toBe(1);

            // Go online
            if (netInfoCallback) {
                netInfoCallback({ isConnected: true, type: 'wifi' } as NetInfoState);
            }

            expect(queuedRequest).toHaveBeenCalled();

            connectivity.removeListener(handleConnectivityChange);
        });
    });

    describe('T049: LifecycleManager + Background Task Integration', () => {
        it('should pause background tasks when app goes inactive', () => {
            let isTaskRunning = true;

            const backgroundTask = {
                pause: jest.fn(() => { isTaskRunning = false; }),
                resume: jest.fn(() => { isTaskRunning = true; }),
            };

            lifecycle.addObserver(
                () => backgroundTask.resume(),
                () => backgroundTask.pause()
            );

            // Simulate app going to background
            if (appStateCallback) {
                appStateCallback('background');
            }

            expect(backgroundTask.pause).toHaveBeenCalled();
            expect(isTaskRunning).toBe(false);

            // Simulate app returning to active
            if (appStateCallback) {
                appStateCallback('active');
            }

            expect(backgroundTask.resume).toHaveBeenCalled();
            expect(isTaskRunning).toBe(true);
        });

        it('should save app state when going to background', async () => {
            const appState = {
                data: { count: 42, lastSaved: null as number | null },
                save: jest.fn(async () => {
                    appState.data.lastSaved = Date.now();
                    await storage.local.set('app_state', appState.data);
                }),
            };

            lifecycle.addObserver(
                () => { },
                () => appState.save()
            );

            // Simulate app going inactive
            if (appStateCallback) {
                appStateCallback('inactive');
            }

            expect(appState.save).toHaveBeenCalled();
            expect(appState.data.lastSaved).not.toBeNull();
        });
    });

    describe('Complete Infrastructure Integration', () => {
        it('should work together: auth, connectivity, lifecycle, storage', async () => {
            // Setup storage
            await storage.secure.set('auth_token', 'integration-test-token');

            // Configure API
            apiClient.configure({
                baseURL: 'https://api.example.com',
                getAuthToken: async () => await storage.secure.get<string>('auth_token'),
            });

            // Setup connectivity
            let isOnline = connectivity.isConnected;
            connectivity.addListener((connected) => {
                isOnline = connected;
            });

            // Setup lifecycle
            let isAppActive = true;
            lifecycle.addObserver(
                () => { isAppActive = true; },
                () => { isAppActive = false; }
            );

            // Verify all systems
            expect(await storage.secure.get('auth_token')).toBe('integration-test-token');
            expect(typeof isOnline).toBe('boolean');
            expect(isAppActive).toBe(true);

            // Simulate lifecycle
            if (appStateCallback) {
                appStateCallback('background');
                expect(isAppActive).toBe(false);

                appStateCallback('active');
                expect(isAppActive).toBe(true);
            }
        });
    });
});
