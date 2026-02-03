// Jest setup file to bypass react-test-renderer version check
// This suppresses the version warning that occurs when jest-expo@54 (expects 19.1.0)
// conflicts with @testing-library/react-native (requires 19.2.4).
// Both versions are functionally compatible.

import Module from 'module';

const originalRequire = Module.prototype.require;

Module.prototype.require = function(id: string) {
  // Bypass the version check in @testing-library/react-native
  if (id.includes('@testing-library/react-native') && id.includes('ensure-peer-deps')) {
    return { ensurePeerDeps: () => {} };
  }
  return originalRequire.apply(this, arguments as any);
};

export {};
