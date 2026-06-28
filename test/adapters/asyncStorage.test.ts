describe('createAsyncStorageAdapter', () => {
  const nativeNullError = new Error('Native module is null, cannot access legacy storage');

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('falls back to memory when AsyncStorage rejects because its native module is null', async () => {
    jest.doMock('../../src/adapters/defaults/nativeModulePresent', () => ({
      nativeModulePresent: () => true,
    }));
    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        setItem: jest.fn().mockRejectedValue(nativeNullError),
        getItem: jest.fn().mockRejectedValue(nativeNullError),
        removeItem: jest.fn().mockRejectedValue(nativeNullError),
        clear: jest.fn().mockRejectedValue(nativeNullError),
      },
    }));

    const { createAsyncStorageAdapter } = require('../../src/adapters/defaults/asyncStorage');
    const adapter = createAsyncStorageAdapter();

    await expect(adapter.setItem('theme', 'dark')).resolves.toBeUndefined();
    await expect(adapter.getItem('theme')).resolves.toBe('dark');
    await expect(adapter.removeItem('theme')).resolves.toBeUndefined();
    await expect(adapter.getItem('theme')).resolves.toBeNull();
  });

  it('still surfaces ordinary AsyncStorage operation failures', async () => {
    const diskFullError = new Error('database or disk is full');
    jest.doMock('../../src/adapters/defaults/nativeModulePresent', () => ({
      nativeModulePresent: () => true,
    }));
    jest.doMock('@react-native-async-storage/async-storage', () => ({
      __esModule: true,
      default: {
        setItem: jest.fn().mockRejectedValue(diskFullError),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
    }));

    const { createAsyncStorageAdapter } = require('../../src/adapters/defaults/asyncStorage');
    const adapter = createAsyncStorageAdapter();

    await expect(adapter.setItem('theme', 'dark')).rejects.toThrow('database or disk is full');
  });
});
