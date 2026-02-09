import { ThemeManager } from '../../src/theme/ThemeManager';
import { lightTheme, darkTheme } from '../../src/theme/defaultThemes';
import { LocalStorage } from '../../src/infrastructure/storage/LocalStorage';
import { Appearance } from 'react-native';

// Mock dependencies
jest.mock('../../src/infrastructure/storage/LocalStorage');
jest.mock('react-native', () => ({
    Appearance: {
        getColorScheme: jest.fn(),
        addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
    },
}));

describe('ThemeManager', () => {
    let manager: ThemeManager;
    let mockStorage: { get: jest.Mock; set: jest.Mock };

    beforeEach(() => {
        // Setup LocalStorage mock
        mockStorage = {
            get: jest.fn(),
            set: jest.fn().mockResolvedValue(undefined),
        };
        // Mock the static getInstance method
        (LocalStorage.getInstance as jest.Mock).mockReturnValue(mockStorage);

        // Reset mocks
        jest.clearAllMocks();
        (Appearance.getColorScheme as jest.Mock).mockReturnValue('light');

        // Get instance and reset
        manager = ThemeManager.getInstance();
        manager.dispose();
        // Re-trigger constructor logic simulation if needed, but since it's singleton
        // we rely on dispose() clearing state. 
        // However, constructor runs only once. logic in constructor:
        // 1. register themes (persists)
        // 2. setupAppearanceListener (we need to ensure this is re-called or persists)

        // dispose() removes the listener. We need to re-add it if we want to test it.
        // ThemeManager doesn't expose a way to re-run constructor logic.
        // But we can call setupAppearanceListener via private access or just rely on init() if it did it?
        // Actually, dispose() removes listener. Manager expects to be done.
        // If we want to reuse it, we might need a "reset" or "reinit" method for testing,
        // or we just modify the test to manually re-enable it or expose a method.
        //
        // Let's check ThemeManager.ts: dispose() sets initialized=false, removes listener.
        // It does NOT clear themes.
        // It does NOT re-add listener automatically on next use unless we call something.
        // Explicitly, the class has no "start" method other than init() which handles persistence.
        // The listener is set in constructor.
        //
        // Problem: dispose() kills the listener forever for that singleton instance.
        // Fix: We should probably move listener setup to init() or have a reset() method.
        // For now, let's create a new instance via prototype manipulation or just accept we need to fix the class.
        //
        // Actually, let's look at `configure` or `init`.
        // Let's modify ThemeManager to allow re-setup of listener in init() or similar?
        // Or just hack it for tests.
        //
        // Better: Allow `init()` to setup listener if missing?
        // in ThemeManager.ts:
        // setupAppearanceListener() is called in constructor.
        // dispose() removes it.
        // Nothing calls setupAppearanceListener() again.
        //
        // I should modify ThemeManager.ts to call setupAppearanceListener() in init() if it's null?
        //
        // Let's verify this behavior.

        manager.configure({ persistMode: false });
    });

    describe('Initialization', () => {
        it('should initialize with default system mode', () => {
            expect(manager.getMode()).toBe('system');
        });

        it('should register default themes', () => {
            expect(manager.getTheme()).toBeDefined();
        });
    });

    describe('Mode Management', () => {
        it('should set mode correctly', () => {
            manager.setMode('dark');
            expect(manager.getMode()).toBe('dark');
            expect(manager.getActiveMode()).toBe('dark');
            expect(manager.getTheme().name).toBe('dark');

            manager.setMode('light');
            expect(manager.getMode()).toBe('light');
            expect(manager.getActiveMode()).toBe('light');
            expect(manager.getTheme().name).toBe('light');
        });

        it('should resolve system mode correctly', () => {
            manager.setMode('system');

            (Appearance.getColorScheme as jest.Mock).mockReturnValue('dark');
            expect(manager.getActiveMode()).toBe('dark');
            expect(manager.getTheme().name).toBe('dark');

            (Appearance.getColorScheme as jest.Mock).mockReturnValue('light');
            expect(manager.getActiveMode()).toBe('light');
            expect(manager.getTheme().name).toBe('light');
        });
    });

    describe('Persistence', () => {
        it('should save mode to LocalStorage', () => {
            manager.configure({ persistMode: true, storageKey: 'test_key' });
            manager.setMode('dark');
            expect(mockStorage.set).toHaveBeenCalledWith('test_key', 'dark');
        });

        it('should load mode from LocalStorage on init', async () => {
            manager.configure({ persistMode: true, storageKey: 'test_key' });
            mockStorage.get.mockResolvedValue('dark');

            await manager.init();
            expect(manager.getMode()).toBe('dark');
        });
    });

    describe('Listeners', () => {
        it('should notify listeners on mode change', () => {
            const listener = jest.fn();
            manager.addThemeListener(listener);

            manager.setMode('dark');
            expect(listener).toHaveBeenCalledWith(darkTheme, 'dark');
        });
    });

    describe('Custom Themes', () => {
        it('should allow registering and using custom themes', () => {
            const customTheme = { ...lightTheme, name: 'custom' };
            manager.registerTheme('light', customTheme);

            manager.setMode('light');
            expect(manager.getTheme().name).toBe('custom');
        });
    });
});
