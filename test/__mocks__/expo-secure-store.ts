// Mock implementation of expo-secure-store for testing

const mockSecureStorage: Record<string, string> = {};

export const getItemAsync = jest.fn((key: string) => {
  return Promise.resolve(mockSecureStorage[key] || null);
});

export const setItemAsync = jest.fn((key: string, value: string) => {
  mockSecureStorage[key] = value;
  return Promise.resolve(undefined);
});

export const deleteItemAsync = jest.fn((key: string) => {
  delete mockSecureStorage[key];
  return Promise.resolve(undefined);
});

export default {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
};

export { mockSecureStorage };
