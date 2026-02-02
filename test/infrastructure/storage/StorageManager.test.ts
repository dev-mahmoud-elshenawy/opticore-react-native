import { StorageManager } from '../../../src/infrastructure/storage/StorageManager';

describe('StorageManager', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    // Reset instance for testing if it's a singleton?
    // StorageManager might be a singleton or just a facade class with static members
    // or an instance that holds references to the others.
    // Based on plan: "Facade providing both secure and local storage"
    // "Export singleton instances: secureStorage, localStorage"

    // Actually, checking the plan: "Export singleton instances: secureStorage, localStorage"
    // and "StorageManager.ts: Facade providing both"

    // Let's assume StorageManager has static accessors or is a singleton holding both.
    storageManager = StorageManager.getInstance();
  });

  it('should expose secure storage', () => {
    expect(storageManager.secure).toBeDefined();
    // Verify it implements IStorage-like interface (check methods exist)
    expect(storageManager.secure.get).toBeDefined();
    expect(storageManager.secure.set).toBeDefined();
  });

  it('should expose local storage', () => {
    expect(storageManager.local).toBeDefined();
    expect(storageManager.local.get).toBeDefined();
    expect(storageManager.local.set).toBeDefined();
  });

  it('clearAll should clear both storages', async () => {
    // Mock the inner storages
    const mockSecureClear = jest.fn();
    const mockLocalClear = jest.fn();

    // We need to be able to inject mocks or spy on them
    // This depends on implementation.
    // Assuming we can spy on the exposed instances:
    storageManager.secure.clear = mockSecureClear;
    storageManager.local.clear = mockLocalClear;

    await storageManager.clearAll();

    expect(mockSecureClear).toHaveBeenCalled();
    expect(mockLocalClear).toHaveBeenCalled();
  });
});
