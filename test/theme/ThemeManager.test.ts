import { ThemeManager } from '../../src/theme/ThemeManager';
import { lightTheme, darkTheme } from '../../src/theme/defaultThemes';
import { LocalStorage } from '../../src/infrastructure/storage/LocalStorage';
import { Logger } from '../../src/infrastructure/logger/Logger';
import { Appearance } from 'react-native';

// Mock dependencies
jest.mock('../../src/infrastructure/storage/LocalStorage');
jest.mock('../../src/infrastructure/logger/Logger');
jest.mock('react-native', () => ({
  Appearance: {
    getColorScheme: jest.fn(),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

describe('ThemeManager', () => {
  let manager: ThemeManager;
  let mockStorage: { get: jest.Mock; set: jest.Mock };
  let mockLogger: { warn: jest.Mock; info: jest.Mock; error: jest.Mock };

  beforeEach(() => {
    // Setup LocalStorage mock
    mockStorage = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
    };
    (LocalStorage.getInstance as jest.Mock).mockReturnValue(mockStorage);

    // Setup Logger mock
    mockLogger = {
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    };
    (Logger.getInstance as jest.Mock).mockReturnValue(mockLogger);

    // Reset mocks
    jest.clearAllMocks();
    (Appearance.getColorScheme as jest.Mock).mockReturnValue('light');
    (Appearance.addChangeListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
    (LocalStorage.getInstance as jest.Mock).mockReturnValue(mockStorage);
    (Logger.getInstance as jest.Mock).mockReturnValue(mockLogger);

    // Get singleton and reset it via dispose
    manager = ThemeManager.getInstance();
    manager.dispose();

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

  describe('Appearance Listener Deduplication', () => {
    it('should have exactly 1 appearance listener after init()', async () => {
      await manager.init();
      // init() calls setupAppearanceListener() once (idempotent)
      expect(Appearance.addChangeListener).toHaveBeenCalledTimes(1);
    });

    it('should not add a second listener when init() is called again', async () => {
      await manager.init();
      const callCountAfterFirst = (Appearance.addChangeListener as jest.Mock).mock.calls.length;

      // init() returns early on second call
      await manager.init();
      expect(Appearance.addChangeListener).toHaveBeenCalledTimes(callCountAfterFirst);
    });

    it('should create exactly 1 listener after dispose() + init()', async () => {
      await manager.init();
      manager.dispose();

      jest.clearAllMocks();
      (Appearance.addChangeListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
      (LocalStorage.getInstance as jest.Mock).mockReturnValue(mockStorage);
      (Logger.getInstance as jest.Mock).mockReturnValue(mockLogger);

      await manager.init();
      expect(Appearance.addChangeListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logger Integration', () => {
    it('should use Logger.warn instead of console.warn for storage restore failure', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      manager.configure({ persistMode: true, storageKey: 'test_key' });
      mockStorage.get.mockRejectedValue(new Error('storage error'));

      await manager.init();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('[ThemeManager]'),
        expect.any(Error)
      );
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should use Logger for unregisterTheme warning on default themes', () => {
      manager.unregisterTheme('light');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('[ThemeManager]'),
        expect.anything()
      );
    });

    it('should use Logger for setTheme warning when theme not found', () => {
      manager.setTheme('nonexistent');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('[ThemeManager]'),
        expect.anything()
      );
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
