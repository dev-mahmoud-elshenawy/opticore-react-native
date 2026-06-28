import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createQueryHook } from '../../src/query/createQueryHook';

function wrapper({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('createQueryHook', () => {
  it('keys and fetches with the arg, returning the data', async () => {
    const keyFn = jest.fn((id: string) => ['thing', id]);
    const fetcher = jest.fn(async (id: string) => `data-${id}`);
    const useThing = createQueryHook(keyFn, fetcher);

    const { result } = await renderHook(() => useThing('42'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(keyFn).toHaveBeenCalledWith('42');
    expect(fetcher).toHaveBeenCalledWith('42');
    expect(result.current.data).toBe('data-42');
  });
});
