// Mock implementation of expo-secure-store for testing
export const getItemAsync = jest.fn().mockResolvedValue(null);
export const setItemAsync = jest.fn().mockResolvedValue(undefined);
export const deleteItemAsync = jest.fn().mockResolvedValue(undefined);

export default {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
};
