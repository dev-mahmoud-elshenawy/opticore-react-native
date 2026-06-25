// NOTE: no `jest.mock('expo-router')` here on purpose. The main entry
// (`src/index.ts`) must NOT import navigation/expo-router — see spec 028.
// If importing the barrel ever pulls in expo-router again, that coupling
// regression should surface here.
import * as OptiCore from '../src/index';
import { VERSION } from '../src/index';

describe('OptiCore Package', () => {
  it('should export VERSION constant', () => {
    expect(VERSION).toBe('2.7.0');
  });

  it('should have valid semver version', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should NOT re-export navigation helpers from the main entry (expo-router decoupling)', () => {
    // Navigation lives at the `opticore-react-native/navigation` subpath only,
    // so React Navigation / non-expo-router apps never bundle expo-router.
    const surface = OptiCore as Record<string, unknown>;
    expect(surface.useRouteHelper).toBeUndefined();
  });
});
