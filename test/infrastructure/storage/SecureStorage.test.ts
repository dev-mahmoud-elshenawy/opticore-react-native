import { SecureStorage } from '../../../src/infrastructure/storage/SecureStorage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Mock dependencies
jest.mock('expo-secure-store');

describe('SecureStorage', () => {
  let secureStorage: SecureStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to iOS for tests
    Platform.OS = 'ios';
    secureStorage = new SecureStorage();
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

  describe('on Web Platform', () => {
    it('should throw error when instantiated on web', () => {
      Platform.OS = 'web';
      expect(() => new SecureStorage()).toThrow(
        '[SecureStorage] SecureStorage is not available on web platform'
      );
    });
  });
});
