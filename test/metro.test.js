const path = require('path');
const { withOptiCoreMetroConfig } = require('../metro');

describe('withOptiCoreMetroConfig', () => {
  it('resolves optional native peers from the consuming app during file-link development', () => {
    const projectRoot = process.cwd();
    const defaultResolve = jest.fn();
    const config = withOptiCoreMetroConfig(
      { resolver: { resolveRequest: defaultResolve } },
      projectRoot,
    );

    const result = config.resolver.resolveRequest(
      { resolveRequest: defaultResolve },
      '@react-native-async-storage/async-storage',
      'ios',
    );

    expect(result.type).toBe('sourceFile');
    expect(result.filePath).toContain(
      path.join(projectRoot, 'node_modules', '@react-native-async-storage/async-storage'),
    );
    expect(defaultResolve).not.toHaveBeenCalled();
  });
});
