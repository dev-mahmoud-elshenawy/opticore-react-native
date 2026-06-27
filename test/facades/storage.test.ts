import { storage } from '../../src/facades/storage';
import { StorageManager } from '../../src/infrastructure/storage/StorageManager';

describe('storage facade', () => {
  it('exposes the live secure/local instances from the StorageManager singleton', () => {
    const mgr = StorageManager.getInstance();
    expect(storage.secure).toBe(mgr.secure);
    expect(storage.local).toBe(mgr.local);
  });

  it('clearAll delegates to StorageManager', async () => {
    const spy = jest.spyOn(StorageManager.getInstance(), 'clearAll').mockResolvedValue();
    await storage.clearAll();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
