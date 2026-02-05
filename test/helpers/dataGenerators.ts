import { PaginatedResponse } from '../../src/types/Api.types';

/**
 * Generate mock user data
 */
export function generateMockUser(overrides?: Partial<User>): User {
    return {
        id: Math.floor(Math.random() * 10000).toString(),
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}

interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

/**
 * Generate mock API response
 */
export function generateMockApiResponse<T>(
    data: T,
    overrides?: Partial<Omit<MockApiResponse<T>, 'data'>>
): MockApiResponse<T> {
    return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
        ...overrides,
    };
}

interface MockApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: any;
}

/**
 * Generate paginated API response
 */
export function generateMockPaginatedResponse<T>(
    items: T[],
    overrides?: Partial<PaginatedResponse<T>>
): PaginatedResponse<T> {
    return {
        data: items,
        page: 1,
        pageSize: items.length,
        totalPages: 1,
        totalItems: items.length,
        hasNext: false,
        hasPrev: false,
        ...overrides,
    };
}

/**
 * Generate mock error
 */
export function generateMockError(overrides?: Partial<Error>): Error {
    const error = new Error('Mock error');
    return Object.assign(error, overrides);
}

/**
 * Generate array of mock items
 */
export function generateMockArray<T>(
    generator: (index: number) => T,
    count: number
): T[] {
    return Array.from({ length: count }, (_, i) => generator(i));
}

/**
 * Generate random string
 */
export function generateRandomString(length = 10): string {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}

/**
 * Generate random number in range
 */
export function generateRandomNumber(min = 0, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
