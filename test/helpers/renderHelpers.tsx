import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CoreProvider } from '../../src/providers/CoreProvider';

/**
 * Create a fresh QueryClient for each test
 */
export function createTestQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

/**
 * Render component wrapped with QueryProvider
 */
export function renderWithQuery(
    ui: ReactElement,
    queryClient?: QueryClient,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    const client = queryClient || createTestQueryClient();

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    return {
        ...render(ui, { wrapper: Wrapper, ...options }),
        queryClient: client,
    };
}

/**
 * Render component wrapped with all CoreProvider infrastructure
 */
export function renderWithProviders(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <CoreProvider>{children}</CoreProvider>
    );

    return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Render component with custom providers
 */
export function renderWithCustomProviders(
    ui: ReactElement,
    providers: Array<React.ComponentType<{ children: React.ReactNode }>>,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        return providers.reduceRight(
            (acc, Provider) => <Provider>{acc}</Provider>,
            children as ReactElement
        );
    };

    return render(ui, { wrapper: Wrapper, ...options });
}
