import { SecureStorage } from '../../../src/infrastructure/storage/SecureStorage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('expo-secure-store');
jest.mock('@react-native-async-storage/async-storage');

describe('SecureStorage', () => {
    let secureStorage: SecureStorage;

    beforeEach(() => {
        jest.clearAllMocks();
        secureStorage = new SecureStorage();
        // Default to 'ios' for tests unless overridden
        Platform.OS = 'ios';
    });

    describe('on Native Platforms (iOS/Android)', () => {
        it('set should encrypt and store string data', async () => {
            await secureStorage.set('test_key', 'test_value');
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith('test_key', JSON.stringify('test_value'));
        });

        it('set should encrypt and store object data', async () => {
            const data = { token: '123' };
            await secureStorage.set('auth', data);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth', JSON.stringify(data));
        });

        it('get should retrieve and decrypt data', async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(JSON.stringify('secret'));
            const value = await secureStorage.get<string>('test_key');
            expect(value).toBe('secret');
        });

        it('get should return null if key not found', async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
            const value = await secureStorage.get('missing');
            expect(value).toBeNull();
        });

        it('remove should delete data', async () => {
            await secureStorage.remove('test_key');
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('test_key');
        });
    });

    describe('on Web Platform', () => {
        beforeEach(() => {
            Platform.OS = 'web';
        });

        it('should fallback to AsyncStorage on web', async () => {
            // Need to spy on console.warn to suppress during test?
            // Or verify warning logged?
            await secureStorage.set('web_key', 'web_value');
            expect(AsyncStorage.setItem).toHaveBeenCalled();
            expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
        });
    });
});
