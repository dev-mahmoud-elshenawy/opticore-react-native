jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}), { virtual: true });

import { VERSION } from '../src/index';

describe('OptiCore Package', () => {
  it('should export VERSION constant', () => {
    expect(VERSION).toBe('1.0.0');
  });

  it('should have valid semver version', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
