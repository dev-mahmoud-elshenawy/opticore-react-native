import * as registry from '../../src/adapters/registry';
import type { SecureStorageAdapter } from '../../src/adapters/interfaces';

// Force the expo-secure-store default to be "absent" so the resolver falls
// through to the in-memory adapter and triggers the dev warning.
jest.mock('../../src/adapters/defaults/expoSecureStore', () => ({
  createExpoSecureStoreAdapter: () => null,
}));

describe('adapter registry — missing-peer dev warning (spec 028)', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    registry._resetAdapterWarnings();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('falls back to in-memory and warns once when the peer is absent', () => {
    const adapter = registry.resolveSecureStorageAdapter();

    // memory secure adapter implements the SecureStorageAdapter contract
    expect(typeof adapter.setItemAsync).toBe('function');
    expect(typeof adapter.getItemAsync).toBe('function');
    expect(typeof adapter.deleteItemAsync).toBe('function');

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/SecureStorage/);
    expect(warnSpy.mock.calls[0][0]).toMatch(/expo-secure-store/);
    expect(warnSpy.mock.calls[0][0]).toMatch(/in-memory/);
  });

  it('warns only once across repeated resolves (deduped)', () => {
    registry.resolveSecureStorageAdapter();
    registry.resolveSecureStorageAdapter();
    registry.resolveSecureStorageAdapter();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('does NOT warn when a consumer override is supplied', () => {
    const override: SecureStorageAdapter = {
      setItemAsync: jest.fn(async () => undefined),
      getItemAsync: jest.fn(async () => null),
      deleteItemAsync: jest.fn(async () => undefined),
    };

    const adapter = registry.resolveSecureStorageAdapter(override);

    expect(adapter).toBe(override);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
