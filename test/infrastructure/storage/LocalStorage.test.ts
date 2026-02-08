import { LocalStorage } from '../../../src/infrastructure/storage/LocalStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('LocalStorage', () => {
  let localStorage: LocalStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton for clean state
    (LocalStorage as any).instance = null;
    localStorage = LocalStorage.getInstance();
  });

  it('set should store stringified data', async () => {
    const data = { theme: 'dark' };
    await localStorage.set('settings', data);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('settings', JSON.stringify(data));
  });

  it('get should parse stored data', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ volume: 10 }));
    const result = await localStorage.get<{ volume: number }>('audio');
    expect(result).toEqual({ volume: 10 });
  });

  it('get should return null if item not found', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const result = await localStorage.get('missing');
    expect(result).toBeNull();
  });

  it('remove should delete item', async () => {
    await localStorage.remove('old_key');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('old_key');
  });

  it('clear should remove all items', async () => {
    await localStorage.clear();
    expect(AsyncStorage.clear).toHaveBeenCalled();
  });
});
