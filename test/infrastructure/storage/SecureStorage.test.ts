import { SecureStorage } from '../../../src/infrastructure/storage/SecureStorage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Mock dependencies
jest.mock('expo-secure-store');

// Make nativeModulePresent report ExpoSecureStore as present so the adapter
// resolver proceeds to require('expo-secure-store'), which is already mapped
// to the test mock via jest.config.js moduleNameMapper.
jest.mock('../../../src/adapters/defaults/nativeModulePresent', () => ({
  nativeModulePresent: () => true,
  loadOptionalNativeModule: (_name: string, load: () => unknown) => {
    try { return load() ?? null; } catch { return null; }
  },
}));

describe('SecureStorage', () => {
  let secureStorage: SecureStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: loadKeys returns null (no persisted keys)
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    // Default to iOS for tests
    Platform.OS = 'ios';
    secureStorage = new SecureStorage();
  });

  describe('Init Guard', () => {
    it('should return stored value when get() is called immediately after construction', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === '__secure_storage_keys__') return Promise.resolve(JSON.stringify(['token']));
        if (key === 'token') return Promise.resolve(JSON.stringify('my-secret-token'));
        return Promise.resolve(null);
      });

      const storage = new SecureStorage();
      const value = await storage.get<string>('token');
      expect(value).toBe('my-secret-token');
    });

    it('should wait for init before executing set()', async () => {
      let resolveLoadKeys!: () => void;
      (SecureStore.getItemAsync as jest.Mock).mockImplementationOnce(
        () => new Promise<string | null>(resolve => { resolveLoadKeys = () => resolve(null); })
      );

      const storage = new SecureStorage();
      let setCompleted = false;
      const setPromise = storage.set('key', 'value').then(() => { setCompleted = true; });

      // set() should be blocked waiting for loadKeys
      await Promise.resolve();
      expect(setCompleted).toBe(false);

      // Unblock loadKeys
      resolveLoadKeys();
      await setPromise;

      expect(setCompleted).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('should handle loadKeys() failure gracefully — get() returns null without crashing', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
        if (key === '__secure_storage_keys__') return Promise.reject(new Error('Storage corrupted'));
        return Promise.resolve(null);
      });

      const storage = new SecureStorage();
      await expect(storage.get<string>('token')).resolves.toBeNull();
    });

    it('should execute operations immediately once init has already completed', async () => {
      const storage = new SecureStorage();
      // Allow readyPromise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify('cached'));
      const value = await storage.get<string>('existing');
      expect(value).toBe('cached');
    });
  });

  describe('on iOS Platform', () => {
    it('set should encrypt and store string data in iOS Keychain', async () => {
      await secureStorage.set('test_key', 'test_value');
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('set should encrypt and store object data in iOS Keychain', async () => {
      const data = { token: '123' };
      await secureStorage.set('auth', data);
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('get should retrieve and decrypt data from iOS Keychain', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify('secret'));
      const value = await secureStorage.get<string>('test_key');
      expect(value).toBe('secret');
    });

    it('get should return null if key not found', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      const value = await secureStorage.get('missing');
      expect(value).toBeNull();
    });

    it('remove should delete data from iOS Keychain', async () => {
      await secureStorage.remove('test_key');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });

    it('clear should remove all stored keys from iOS Keychain', async () => {
      await secureStorage.set('key1', 'value1');
      await secureStorage.set('key2', 'value2');

      await secureStorage.clear();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe('on Android Platform', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      Platform.OS = 'android';
      secureStorage = new SecureStorage();
    });

    it('set should encrypt and store data in Android Keystore', async () => {
      await secureStorage.set('test_key', 'test_value');
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('get should retrieve and decrypt data from Android Keystore', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify('android_secret'));
      const value = await secureStorage.get<string>('test_key');
      expect(value).toBe('android_secret');
    });

    it('remove should delete data from Android Keystore', async () => {
      await secureStorage.remove('test_key');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });

    it('clear should remove all stored keys from Android Keystore', async () => {
      await secureStorage.set('key1', 'value1');
      await secureStorage.set('key2', 'value2');

      await secureStorage.clear();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });

  describe('Concurrency', () => {
    it('should not drop keys when set() is called concurrently', async () => {
      // Real backing store so the key index round-trips through the mock.
      const store: Record<string, string> = {};
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((k: string) =>
        Promise.resolve(k in store ? store[k] : null)
      );
      (SecureStore.setItemAsync as jest.Mock).mockImplementation((k: string, v: string) => {
        store[k] = v;
        return Promise.resolve(undefined);
      });

      const storage = new SecureStorage();
      // Fire many writes in the same tick — the serialized write chain must
      // persist EVERY key into the index (no last-write-wins clobber).
      await Promise.all([
        storage.set('a', 1),
        storage.set('b', 2),
        storage.set('c', 3),
      ]);

      const indexJson = store['__secure_storage_keys__'];
      const keys = JSON.parse(indexJson) as string[];
      expect(keys.sort()).toEqual(['a', 'b', 'c']);
    });
  });

  describe('on Web Platform', () => {
    it('should throw error when instantiated on web', () => {
      Platform.OS = 'web';
      expect(() => new SecureStorage()).toThrow(
        '[SecureStorage] SecureStorage is not available on web platform'
      );
    });
  });
});
