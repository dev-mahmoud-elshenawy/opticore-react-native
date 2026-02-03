// Mock for react-native-device-info
export default {
  getVersion: jest.fn(() => '1.0.0'),
  getBuildNumber: jest.fn(() => '1'),
  getSystemVersion: jest.fn(() => '15.0'),
  getModel: jest.fn(() => 'iPhone'),
  getPlatform: jest.fn(() => ({ os: 'ios' })),
  getSystemName: jest.fn(() => 'iOS'),
};
