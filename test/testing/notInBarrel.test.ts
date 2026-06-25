import * as barrel from '../../src/index';
import * as testing from '../../src/testing';

describe('test utilities are subpath-only (prod-safe)', () => {
  it('are NOT re-exported from the main barrel', () => {
    const exports = barrel as Record<string, unknown>;
    expect(exports.createMemoryAdapters).toBeUndefined();
    expect(exports.resetOptiCore).toBeUndefined();
  });

  it('ARE exported from opticore-react-native/testing', () => {
    expect(typeof testing.createMemoryAdapters).toBe('function');
    expect(typeof testing.resetOptiCore).toBe('function');
  });
});
