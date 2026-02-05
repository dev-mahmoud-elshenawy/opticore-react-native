import { expectType } from 'tsd';
import type { ErrorState, ErrorSeverity } from '../../src/types/Error.types';
import type { RouteParams, NavigationOptions } from '../../src/types/Navigation.types';
import type { StorageConfig, StorageValue } from '../../src/types/Storage.types';

// Test ErrorState
const errorState: ErrorState = {
    message: 'Something went wrong',
    timestamp: Date.now(),
    recoverable: true
};
expectType<string>(errorState.message);
expectType<number>(errorState.timestamp);

// Test Navigation Types
const routeParams: RouteParams = {
    id: '123',
    mode: 'edit'
};
expectType<string | undefined>(routeParams.id);
expectType<string>(routeParams.mode as string);

const navOptions: NavigationOptions = {
    title: 'Home',
    headerShown: true
};
expectType<string | undefined>(navOptions.title);

// Test Storage Types
const storageConfig: StorageConfig = {
    namespace: 'app',
    encrypted: true
};
expectType<string>(storageConfig.namespace);
expectType<boolean | undefined>(storageConfig.encrypted);
