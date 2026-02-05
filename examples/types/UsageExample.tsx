import type {
    ApiResponse,
    LoadingState,
    AsyncValue,
    PaginationState,
    RouteParams,
    StorageConfig
} from '../../src/types';

// Example 1: Type-safe API Response
interface User {
    id: string;
    name: string;
    email: string;
}

export async function fetchUser(id: string): Promise<ApiResponse<User>> {
    // Simulated API call
    return {
        success: true,
        status: 200,
        data: { id, name: 'John Doe', email: 'john@example.com' }
    };
}

// Example 2: State Management with LoadingState
export interface UserState {
    profile: LoadingState<User>;
    settings: AsyncValue<Record<string, boolean>>;
}

const initialState: UserState = {
    profile: {
        status: 'idle'
    },
    settings: {
        status: 'idle'
    }
};

// Example 3: Pagination State
export const initialPagination: PaginationState = {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
    hasMore: false
};

// Example 4: Type-safe Navigation Params
// Extend the global RouteParams interface
declare module '../../src/types' {
    interface RouteParams {
        'profile/settings': { theme: 'dark' | 'light' };
    }
}

// Example 5: Storage Configuration
export const storageConfig: StorageConfig = {
    provider: 'secure-store',
    encryptionKey: 'my-secret-key',
    keyPrefix: 'app_v1_'
};
