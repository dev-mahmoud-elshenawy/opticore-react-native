import { CoreSetup } from '../../src/config/CoreSetup';
import { CoreConfig } from '../../src/config/types';

// Create mock instances with Jest functions
const mockApiClientInstance = {
  configure: jest.fn(),
};
const mockLoggerInstance = {
  configure: jest.fn(),
};

// Mock dependencies
jest.mock('../../src/infrastructure/network/ApiClient', () => ({
  ApiClient: {
    getInstance: jest.fn(() => mockApiClientInstance),
  },
}));

jest.mock('../../src/infrastructure/logger/Logger', () => ({
  Logger: {
    getInstance: jest.fn(() => mockLoggerInstance),
  },
  LogLevel: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  },
}));

// Mock ConfigValidator
jest.mock('../../src/config/ConfigValidator', () => ({
  ConfigValidator: {
    validate: jest.fn(),
  },
}));

describe('CoreSetup', () => {
  let coreSetup: CoreSetup;

  const validConfig: CoreConfig = {
    api: {
      baseURL: 'https://api.test.com',
      timeout: 5000,
      headers: { 'X-Test': 'true' },
    },
    logger: {
      level: 3,
      disabled: false,
    },
    onError: jest.fn(),
    features: {
      maintenanceMode: false,
      offlineMode: false,
      debugMode: false,
    },
  };

  beforeEach(() => {
    // Reset singleton via private property
    // @ts-ignore
    CoreSetup.instance = undefined;
    coreSetup = CoreSetup.getInstance();
    jest.clearAllMocks();
  });

  describe('init()', () => {
    it('should configure ApiClient with provided config', () => {
      coreSetup.init(validConfig);
      expect(mockApiClientInstance.configure).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.test.com',
          timeout: 5000,
          headers: { 'X-Test': 'true' },
        })
      );
    });

    it('should configure Logger with provided config', () => {
      coreSetup.init(validConfig);
      expect(mockLoggerInstance.configure).toHaveBeenCalledWith({
        level: 3,
        enabled: true,
      });
    });

    it('should register global error handler', () => {
      coreSetup.init(validConfig);
      expect(coreSetup.getErrorHandler()).toBe(validConfig.onError);
    });

    it('should force debug level when debugMode is true', () => {
      const debugConfig = {
        ...validConfig,
        logger: { ...validConfig.logger!, level: 3 },
        features: { ...validConfig.features!, debugMode: true },
      };
      coreSetup.init(debugConfig);
      expect(mockLoggerInstance.configure).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 0,
          enabled: true,
        })
      );
    });

    it('should configure logger when debugMode is true but logger config is missing', () => {
      const configWithoutLogger: CoreConfig = {
        api: { baseURL: 'https://api.test.com' },
        features: { debugMode: true },
      };
      coreSetup.init(configWithoutLogger);
      expect(mockLoggerInstance.configure).toHaveBeenCalledWith({
        level: 0,
        enabled: true,
      });
    });

    it('should store the configuration', () => {
      coreSetup.init(validConfig);
      expect(coreSetup.getConfig()).toBe(validConfig);
    });
  });

  describe('getConfig()', () => {
    it('should throw if getConfig called before init', () => {
      expect(() => coreSetup.getConfig()).toThrow();
    });
  });
});
