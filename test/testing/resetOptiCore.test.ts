import { resetOptiCore } from '../../src/testing/resetOptiCore';
import { createMemoryAdapters } from '../../src/testing/createMemoryAdapters';
import { StorageManager } from '../../src/infrastructure/storage/StorageManager';
import { Logger } from '../../src/infrastructure/logger/Logger';

describe('resetOptiCore', () => {
  it('does not throw / resolves when OptiCore was never configured', async () => {
    await expect(resetOptiCore()).resolves.toBeUndefined();
  });

  it('clears logger transports', async () => {
    const write = jest.fn();
    Logger.getInstance().addTransport({ name: 'test-sink', write });

    await resetOptiCore();
    Logger.getInstance().error('after reset');

    expect(write).not.toHaveBeenCalled();
  });

  it('clears secure + local storage', async () => {
    const { secureStorage, localStorage } = createMemoryAdapters();
    StorageManager.getInstance().configure({
      secureAdapter: secureStorage,
      localAdapter: localStorage,
    });

    await StorageManager.getInstance().local.set('k', { v: 1 });
    await StorageManager.getInstance().secure.set('s', 'x');

    await resetOptiCore();

    expect(await StorageManager.getInstance().local.get('k')).toBeNull();
    expect(await StorageManager.getInstance().secure.get('s')).toBeNull();
  });

  it('is idempotent (safe to call repeatedly)', async () => {
    await resetOptiCore();
    await expect(resetOptiCore()).resolves.toBeUndefined();
  });
});
