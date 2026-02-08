module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/test'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/test/**/*.(test|spec).(ts|tsx|js)'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|expo-secure-store|expo-modules-core|zustand|immer|@tanstack))',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg|ttf|woff|woff2)$': '<rootDir>/test/__mocks__/empty.ts',
    '^expo-secure-store$': '<rootDir>/test/__mocks__/expo-secure-store.ts',
    '^react-native$': '<rootDir>/test/__mocks__/react-native.ts',
    '^@react-native-community/netinfo$': '<rootDir>/test/__mocks__/@react-native-community/netinfo.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/test/__mocks__/@react-native-async-storage/async-storage.ts',
    '^@react-native-clipboard/clipboard$': '<rootDir>/test/__mocks__/@react-native-clipboard/clipboard.ts',
    '^react-native-device-info$': '<rootDir>/test/__mocks__/react-native-device-info.ts',
    'expo/src': '<rootDir>/test/__mocks__/empty.ts',
    'expo/virtual': '<rootDir>/test/__mocks__/empty.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: 'coverage',
  verbose: true,
  globals: {
    __DEV__: true,
  },
};
