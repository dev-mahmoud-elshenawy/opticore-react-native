import React, { createContext } from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createStore } from 'zustand/vanilla';
import { QueryProvider } from '../../../src/providers/QueryProvider';
import { StoreProvider, createStoreHook } from '../../../src/state/providers/StoreProvider';

afterEach(() => {
  cleanup();
});

describe('QueryProvider', () => {
  it('should provide QueryClient to children', async () => {
    const TestComponent = () => {
      const client = useQueryClient();
      return <Text testID="client-status">{client ? 'Client Exists' : 'No Client'}</Text>;
    };

    render(
      <QueryProvider>
        <TestComponent />
      </QueryProvider>
    );

    expect(screen.getByTestId('client-status')).toHaveTextContent('Client Exists');
  });

  it('should execute queries', async () => {
    const TestQuery = () => {
      const { data, isLoading } = useQuery({
        queryKey: ['test'],
        queryFn: async () => 'Hello Query',
      });

      if (isLoading) return <Text>Loading...</Text>;
      return <Text testID="data">{data}</Text>;
    };

    render(
      <QueryProvider>
        <TestQuery />
      </QueryProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('Hello Query');
    });
  });
});

describe('StoreProvider', () => {
  interface TestState {
    count: number;
    inc: () => void;
  }

  const createTestStore = () =>
    createStore<TestState>((set) => ({
      count: 0,
      inc: () => set((state) => ({ count: state.count + 1 })),
    }));

  const TestContext = createContext<ReturnType<typeof createTestStore> | null>(null);
  const useTestStore = createStoreHook(TestContext);

  const TestConsumer = () => {
    const store = useTestStore();
    // We need to subscribe to use it reactively, but for provider check existence is enough
    const state = store.getState();
    return <Text testID="store-val">{state.count}</Text>;
  };

  it('should provide store to children', () => {
    const store = createTestStore();

    render(
      <StoreProvider store={store} context={TestContext}>
        <TestConsumer />
      </StoreProvider>
    );

    expect(screen.getByTestId('store-val')).toHaveTextContent('0');
  });

  it('should allow multiple providers independently', () => {
    const store1 = createTestStore();
    const store2 = createTestStore();
    store2.getState().inc();

    const TestContext2 = createContext<ReturnType<typeof createTestStore> | null>(null);
    const useTestStore2 = createStoreHook(TestContext2);

    const Consumer1 = () => <Text testID="val1">{useTestStore().getState().count}</Text>;
    const Consumer2 = () => <Text testID="val2">{useTestStore2().getState().count}</Text>;

    render(
      <StoreProvider store={store1} context={TestContext}>
        <StoreProvider store={store2} context={TestContext2}>
          <Consumer1 />
          <Consumer2 />
        </StoreProvider>
      </StoreProvider>
    );

    expect(screen.getByTestId('val1')).toHaveTextContent('0');
    expect(screen.getByTestId('val2')).toHaveTextContent('1');
  });
});
