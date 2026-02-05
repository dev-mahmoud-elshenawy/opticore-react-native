import { expectType } from 'tsd';
import type { ErrorMetadata, ErrorSeverity, RecoveryAction } from '../../src/types/Error.types';
import type { RouteParams, NavigationOptions, ScreenConfig } from '../../src/types/Navigation.types';
import type { StorageConfig, StorageProvider, StorageValue } from '../../src/types/Storage.types';

// Test ErrorMetadata
const errorMetadata: ErrorMetadata = {
    timestamp: Date.now(),
    severity: 'high',
    recoveryAction: 'retry'
};
expectType<number>(errorMetadata.timestamp);
expectType<ErrorSeverity>(errorMetadata.severity);
expectType<RecoveryAction | undefined>(errorMetadata.recoveryAction);

// Test ErrorSeverity
const severity: ErrorSeverity = 'critical';
expectType<ErrorSeverity>(severity);

// Test RecoveryAction
const action: RecoveryAction = 'fallback';
expectType<RecoveryAction>(action);

// Test RouteParams (mapped type with specific routes)
type UserRouteParams = RouteParams['user/[id]'];
expectType<{ id: string }>({ id: '123' } as UserRouteParams);

type SearchParams = RouteParams['search'];
expectType<{ query: string; category?: string }>({ query: 'test' } as SearchParams);

// Test NavigationOptions
const navOptions: NavigationOptions = {
    replace: true,
    animation: 'fade',
    gestureEnabled: false,
    transitionDuration: 300
};
expectType<boolean | undefined>(navOptions.replace);
expectType<'fade' | 'slide' | 'none' | undefined>(navOptions.animation);
expectType<boolean | undefined>(navOptions.gestureEnabled);
expectType<number | undefined>(navOptions.transitionDuration);

// Test ScreenConfig (has title and headerShown)
const screenConfig: ScreenConfig = {
    title: 'Home',
    headerShown: true,
    backgroundColor: '#ffffff'
};
expectType<string | undefined>(screenConfig.title);
expectType<boolean | undefined>(screenConfig.headerShown);
expectType<string | undefined>(screenConfig.backgroundColor);

// Test StorageConfig
const storageConfig: StorageConfig = {
    provider: 'async-storage',
    encryptionKey: 'secret',
    compress: true,
    maxSize: 1024,
    keyPrefix: 'app_'
};
expectType<StorageProvider>(storageConfig.provider);
expectType<string | undefined>(storageConfig.encryptionKey);
expectType<boolean | undefined>(storageConfig.compress);
expectType<number | undefined>(storageConfig.maxSize);
expectType<string | undefined>(storageConfig.keyPrefix);

// Test StorageValue
const storageValue: StorageValue<string> = {
    value: 'test',
    timestamp: Date.now()
};
expectType<string>(storageValue.value);
expectType<number>(storageValue.timestamp);
expectType<number | undefined>(storageValue.expiresAt);
expectType<number | undefined>(storageValue.version);
