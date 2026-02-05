import { copyToClipboard, getClipboard, isIOS, isAndroid, isWeb } from '../../src/utils/platform';
import Clipboard from '@react-native-clipboard/clipboard';
import { Platform } from 'react-native';

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(),
}));

describe('Platform Utilities', () => {
  describe('Clipboard', () => {
    it('copies text to clipboard', () => {
      copyToClipboard('test');
      expect(Clipboard.setString).toHaveBeenCalledWith('test');
    });

    it('gets text from clipboard', async () => {
      (Clipboard.getString as jest.Mock).mockResolvedValue('test');
      const text = await getClipboard();
      expect(text).toBe('test');
    });
  });

  describe('Platform Checks', () => {
    it('detects iOS', () => {
      Platform.OS = 'ios';
      expect(isIOS()).toBe(true);
      expect(isAndroid()).toBe(false);
      expect(isWeb()).toBe(false);
    });

    it('detects Android', () => {
      Platform.OS = 'android';
      expect(isIOS()).toBe(false);
      expect(isAndroid()).toBe(true);
      expect(isWeb()).toBe(false);
    });

    it('detects Web', () => {
      Platform.OS = 'web';
      expect(isIOS()).toBe(false);
      expect(isAndroid()).toBe(false);
      expect(isWeb()).toBe(true);
    });
  });
});
