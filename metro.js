'use strict';
const path = require('path');

/**
 * Wraps an Expo Metro config so that imports inside opticore
 * (peer deps like expo-router, react-native, etc.) resolve from
 * the consuming app's node_modules instead of stopping at the
 * package boundary.
 *
 * Required when using opticore via a `file:` path reference
 * (local development / monorepo). Not needed for normal npm installs.
 *
 * @param {object} config  - Result of getDefaultConfig(__dirname)
 * @param {string} projectRoot - __dirname of the consuming app
 *
 * @example
 * // metro.config.js
 * const { getDefaultConfig } = require('expo/metro-config');
 * const { withOptiCoreMetroConfig } = require('opticore-react-native/metro');
 * const config = getDefaultConfig(__dirname);
 * module.exports = withOptiCoreMetroConfig(config, __dirname);
 */
function withOptiCoreMetroConfig(config, projectRoot) {
  const packageRoot = __dirname;
  const appModules = path.resolve(projectRoot, 'node_modules');

  config.watchFolders = [...(config.watchFolders || []), packageRoot];

  if (!config.resolver) config.resolver = {};

  // Resolve peer deps (expo-router, etc.) from the app's node_modules
  // when Metro walks into opticore's dist/ folder.
  config.resolver.nodeModulesPaths = [
    ...(config.resolver.nodeModulesPaths || []),
    appModules,
  ];

  // Hard override: force shared peers to always resolve from the app's
  // node_modules. extraNodeModules is a fallback — resolveRequest fires first,
  // before Metro's directory-walking finds a second copy of React inside
  // opticore's devDependencies (which breaks hooks with "Invalid hook call").
  // React and React Query both rely on a single shared instance across the
  // app + opticore boundary (shared context / hooks). Force them to the app's
  // copy so a second copy inside opticore's devDependencies can't break them.
  // Native optional peers must also resolve from the app: local file links can
  // otherwise load opticore's devDependency JS wrapper while the app binary is
  // linked against a different copy/version of the native module.
  const APP_RESOLVED_PEERS = [
    'react',
    'react-native',
    'react-dom',
    '@tanstack/react-query',
    '@tanstack/query-core',
    '@react-native-async-storage/async-storage',
    '@react-native-clipboard/clipboard',
    '@react-native-community/netinfo',
    'expo-application',
    'expo-clipboard',
    'expo-device',
    'expo-secure-store',
    'react-native-device-info',
  ];
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const shouldResolveFromApp = APP_RESOLVED_PEERS.some(
      s => moduleName === s || moduleName.startsWith(s + '/'),
    );
    if (shouldResolveFromApp) {
      try {
        const filePath = require.resolve(moduleName, { paths: [projectRoot] });
        return { filePath, type: 'sourceFile' };
      } catch {
        // fall through to Metro's default resolution
      }
    }
    return context.resolveRequest(context, moduleName, platform);
  };

  return config;
}

module.exports = { withOptiCoreMetroConfig };
