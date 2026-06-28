import {
  copyToClipboard,
  getClipboard,
  isIOS,
  isAndroid,
  isWeb,
  configurePlatformAdapters,
} from '../../src/utils/platform';
import { Platform } from 'react-native';

describe('Platform Utilities', () => {
  describe('Clipboard', () => {
    const mockSetString = jest.fn();
    const mockGetString = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      configurePlatformAdapters({
        clipboard: { setString: mockSetString, getString: mockGetString },
      });
    });

    it('copies text to clipboard', () => {
      copyToClipboard('test');
      expect(mockSetString).toHaveBeenCalledWith('test');
    });

    it('gets text from clipboard', async () => {
      mockGetString.mockResolvedValue('test');
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
