// Mock for @react-native-clipboard/clipboard
export default {
  setString: jest.fn().mockResolvedValue(true),
  getString: jest.fn().mockResolvedValue(''),
};
