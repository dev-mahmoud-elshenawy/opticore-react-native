import { createQueryPersister } from '../../src/query/createQueryPersister';
import { StorageManager } from '../../src/infrastructure/storage/StorageManager';

describe('createQueryPersister', () => {
  it('persists, restores, and removes through StorageManager.local', async () => {
    const store: Record<string, unknown> = {};
    const local = {
      set: jest.fn(async (k: string, v: unknown) => {
        store[k] = v;
      }),
      get: jest.fn(async (k: string) => store[k] ?? null),
      remove: jest.fn(async (k: string) => {
        delete store[k];
      }),
    };
    jest
      .spyOn(StorageManager, 'getInstance')
      .mockReturnValue({ local } as unknown as StorageManager);

    const persister = createQueryPersister('test-cache');

    await persister.persistClient({ a: 1 });
    expect(local.set).toHaveBeenCalledWith('test-cache', { a: 1 });

    await expect(persister.restoreClient()).resolves.toEqual({ a: 1 });

    await persister.removeClient();
    expect(local.remove).toHaveBeenCalledWith('test-cache');
    await expect(persister.restoreClient()).resolves.toBeUndefined();
  });
});
