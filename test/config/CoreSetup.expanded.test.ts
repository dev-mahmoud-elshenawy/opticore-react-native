import { CoreSetup } from '../../src/config/CoreSetup';
import { ThemeManager } from '../../src/theme/ThemeManager';
import { OfflineSyncManager } from '../../src/offline/OfflineSyncManager';
// import { LogLevel } from '../../src/infrastructure/logger/LogLevel';
// import { ErrorClassifier } from '../../src/error/ErrorClassifier';

// Mocks
jest.mock('../../src/theme/ThemeManager');
jest.mock('../../src/offline/OfflineSyncManager');

describe('CoreSetup Expanded', () => {
  let mockThemeManager: any;
  let mockOfflineManager: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock instances
    mockThemeManager = {
      configure: jest.fn(),
      registerTheme: jest.fn(),
      init: jest.fn().mockResolvedValue(undefined),
    };
    (ThemeManager.getInstance as jest.Mock).mockReturnValue(mockThemeManager);

    mockOfflineManager = {
      configure: jest.fn(),
    };
    (OfflineSyncManager.getInstance as jest.Mock).mockReturnValue(mockOfflineManager);
  });

  it('should configure ThemeManager when theme config is provided', async () => {
    const customTheme: any = {
      name: 'custom',
      mode: 'dark',
      colors: {},
      spacing: {},
      typography: {},
      borderRadius: {},
      shadows: {},
    };
    await CoreSetup.getInstance().init({
      api: { baseURL: 'https://api.example.com' },
      theme: {
        defaultMode: 'dark',
        customThemes: {
          brand: customTheme,
        },
      },
    });

    expect(mockThemeManager.configure).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultMode: 'dark',
      })
    );
    expect(mockThemeManager.registerTheme).toHaveBeenCalledWith('brand', customTheme);
    expect(mockThemeManager.init).toHaveBeenCalled();
  });

  it('should configure OfflineSyncManager when offline config is provided', async () => {
    await CoreSetup.getInstance().init({
      api: { baseURL: 'https://api.example.com' },
      offline: {
        maxRetries: 5,
        syncOnReconnect: false,
      },
    });

    expect(mockOfflineManager.configure).toHaveBeenCalledWith(
      expect.objectContaining({
        maxRetries: 5,
        syncOnReconnect: false,
      })
    );
  });

  it('should handle minimal config without errors', async () => {
    await CoreSetup.getInstance().init({
      api: { baseURL: 'https://api.example.com' },
    });

    expect(mockThemeManager.configure).not.toHaveBeenCalled();
    expect(mockOfflineManager.configure).not.toHaveBeenCalled();
  });

  it('should store responsive configuration', async () => {
    const setup = CoreSetup.getInstance();
    const breakpoints = { small: 300, medium: 600, large: 900 };

    await setup.init({
      api: { baseURL: 'https://api.example.com' },
      responsive: { breakpoints },
    });

    const config = setup.getConfig();
    expect(config.responsive?.breakpoints).toEqual(breakpoints);
  });

  it('should store forms configuration', async () => {
    const setup = CoreSetup.getInstance();

    await setup.init({
      api: { baseURL: 'https://api.example.com' },
      forms: { defaultCurrency: 'EUR' },
    });

    const config = setup.getConfig();
    expect(config.forms?.defaultCurrency).toEqual('EUR');
  });
});
