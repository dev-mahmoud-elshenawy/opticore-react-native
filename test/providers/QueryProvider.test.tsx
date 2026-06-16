import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { QueryProvider } from '../../src/providers/QueryProvider';

// Test component that uses React Query
const TestQueryComponent: React.FC<{ shouldFail?: boolean }> = ({ shouldFail = false }) => {
  const { data, isLoading, error, failureCount } = useQuery({
    queryKey: ['test-query'],
    queryFn: async () => {
      if (shouldFail) {
        throw new Error('Test error');
      }
      return 'test-data';
    },
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error)
    return (
      <Text>
        Error: {error.message} (Retries: {failureCount})
      </Text>
    );
  return <Text>{data}</Text>;
};

describe('QueryProvider', () => {
  it('should render children successfully', async () => {
    const { getByText } = await render(
      <QueryProvider>
        <Text>Test Child</Text>
      </QueryProvider>
    );

    expect(getByText('Test Child')).toBeTruthy();
  });

  it('should provide React Query context for queries', async () => {
    const { getByText } = await render(
      <QueryProvider>
        <TestQueryComponent />
      </QueryProvider>
    );

    // Should show loading initially
    expect(getByText('Loading...')).toBeTruthy();

    // Should show data after query completes
    await waitFor(() => {
      expect(getByText('test-data')).toBeTruthy();
    });
  });

  it('should apply default staleTime configuration', async () => {
    const { getByText, rerender } = await render(
      <QueryProvider>
        <TestQueryComponent />
      </QueryProvider>
    );

    await waitFor(() => {
      expect(getByText('test-data')).toBeTruthy();
    });

    // Re-render should not trigger loading (data is not stale yet)
    await rerender(
      <QueryProvider>
        <TestQueryComponent />
      </QueryProvider>
    );

    // Should still show cached data without loading
    expect(getByText('test-data')).toBeTruthy();
  });

  it('should retry failed queries based on configuration', async () => {
    const { getByText } = await render(
      <QueryProvider
        config={{
          defaultOptions: {
            queries: {
              retryDelay: 10,
            },
          },
        }}
      >
        <TestQueryComponent shouldFail={true} />
      </QueryProvider>
    );

    // Should eventually show error after retries
    await waitFor(
      () => {
        const errorText = getByText(/Error:.*Test error/);
        expect(errorText).toBeTruthy();
        // Verify that retries occurred (failureCount > 1)
        expect(getByText(/Retries: [1-9]/)).toBeTruthy();
      },
      { timeout: 5000 }
    );
  });

  it('should support custom configuration via props', async () => {
    const { getByText } = await render(
      <QueryProvider
        config={{
          defaultOptions: {
            queries: {
              retry: 1, // Custom retry count (instead of default 3)
              retryDelay: 100, // Fast retry for testing
            },
          },
        }}
      >
        <TestQueryComponent shouldFail={true} />
      </QueryProvider>
    );

    // Should fail quickly with only 1 retry
    await waitFor(
      () => {
        expect(getByText(/Error:/)).toBeTruthy();
      },
      { timeout: 2000 }
    );
  });

  it('keeps the same QueryClient across re-renders with an inline config (no cache wipe)', async () => {
    const seen: QueryClient[] = [];
    const Capture = () => {
      seen.push(useQueryClient());
      return <Text>captured</Text>;
    };

    const { rerender } = await render(
      <QueryProvider config={{ defaultOptions: { queries: { staleTime: 0 } } }}>
        <Capture />
      </QueryProvider>
    );
    // New inline config object on the re-render — must NOT rebuild the client.
    await rerender(
      <QueryProvider config={{ defaultOptions: { queries: { staleTime: 0 } } }}>
        <Capture />
      </QueryProvider>
    );

    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[seen.length - 1]).toBe(seen[0]);
  });

  it('uses an injected custom QueryClient', async () => {
    const custom = new QueryClient();
    let received: QueryClient | undefined;
    const Capture = () => {
      received = useQueryClient();
      return <Text>captured</Text>;
    };

    await render(
      <QueryProvider queryClient={custom}>
        <Capture />
      </QueryProvider>
    );

    expect(received).toBe(custom);
  });

  it('should handle multiple queries independently', async () => {
    const Component = () => {
      const query1 = useQuery({
        queryKey: ['query-1'],
        queryFn: async () => 'data-1',
      });

      const query2 = useQuery({
        queryKey: ['query-2'],
        queryFn: async () => 'data-2',
      });

      return (
        <View>
          <Text>{query1.data || 'loading-1'}</Text>
          <Text>{query2.data || 'loading-2'}</Text>
        </View>
      );
    };

    const { getByText } = await render(
      <QueryProvider>
        <Component />
      </QueryProvider>
    );

    await waitFor(() => {
      expect(getByText('data-1')).toBeTruthy();
      expect(getByText('data-2')).toBeTruthy();
    });
  });
});
