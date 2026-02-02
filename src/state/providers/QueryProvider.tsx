import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Default React Query client configuration
 * - 5 minutes cache time (staleTime 0 by default)
 * - 3 retries for queries
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            refetchOnWindowFocus: false, // Better for mobile apps
        },
    },
});

interface QueryProviderProps {
    children: React.ReactNode;
    client?: QueryClient;
}

/**
 * Provides the React Query context to the application.
 * Wraps the app with QueryClientProvider.
 * 
 * @example
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({
    children,
    client = queryClient
}) => {
    return (
        <QueryClientProvider client={client}>
            {children}
        </QueryClientProvider>
    );
};
