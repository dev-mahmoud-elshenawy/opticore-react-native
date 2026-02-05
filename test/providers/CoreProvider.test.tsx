import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { CoreProvider } from '../../src/providers/CoreProvider';

// Test component that uses React Query
const TestQueryComponent: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['core-test'],
    queryFn: async () => 'query-works',
  });

  if (isLoading) return <Text>Loading...</Text>;
  return <Text>{data}</Text>;
};

describe('CoreProvider', () => {
  it('should render children successfully', async () => {
    const { getByText } = await render(
      <CoreProvider>
        <Text>Test Child</Text>
      </CoreProvider>
    );

    expect(getByText('Test Child')).toBeTruthy();
  });

  it('should provide React Query context', async () => {
    const { getByText } = await render(
      <CoreProvider>
        <TestQueryComponent />
      </CoreProvider>
    );

    await waitFor(() => {
      expect(getByText('query-works')).toBeTruthy();
    });
  });

  it('should support custom configuration', async () => {
    const { getByText } = await render(
      <CoreProvider
        config={{
          query: {
            queryClientConfig: {
              defaultOptions: {
                queries: {
                  staleTime: 1000,
                },
              },
            },
          },
        }}
      >
        <TestQueryComponent />
      </CoreProvider>
    );

    await waitFor(() => {
      expect(getByText('query-works')).toBeTruthy();
    });
  });

  it('should allow disabling features via config', async () => {
    const { getByText } = await render(
      <CoreProvider
        config={{
          enableConnectivity: false,
          enableLifecycle: false,
          enableDevTools: false,
        }}
      >
        <Text>Config Test</Text>
      </CoreProvider>
    );

    expect(getByText('Config Test')).toBeTruthy();
  });

  it('should nest providers correctly', async () => {
    const Component = () => {
      const { data } = useQuery({
        queryKey: ['nested-test'],
        queryFn: async () => 'nested-works',
      });

      return (
        <View>
          <Text>{data || 'loading'}</Text>
        </View>
      );
    };

    const { getByText } = await render(
      <CoreProvider>
        <Component />
      </CoreProvider>
    );

    await waitFor(() => {
      expect(getByText('nested-works')).toBeTruthy();
    });
  });

  it('should handle multiple children', async () => {
    const { getByText } = await render(
      <CoreProvider>
        <Text>Child 1</Text>
        <Text>Child 2</Text>
        <Text>Child 3</Text>
      </CoreProvider>
    );

    expect(getByText('Child 1')).toBeTruthy();
    expect(getByText('Child 2')).toBeTruthy();
    expect(getByText('Child 3')).toBeTruthy();
  });
});
