import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApiMutation } from '../../src/query/useApiMutation';
import { RenderError } from '../../src/error/RenderError';

function wrapper({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () => new QueryClient({ defaultOptions: { mutations: { retry: false } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useApiMutation', () => {
  it('errorMessage is null on success', async () => {
    const { result } = await renderHook(() => useApiMutation(async (n: number) => n * 2), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(3);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(6);
    expect(result.current.errorMessage).toBeNull();
  });

  it('surfaces RenderError.userMessage as errorMessage on failure', async () => {
    const fn = jest.fn(async () => {
      throw new RenderError('technical', 'Could not save');
    });
    const { result } = await renderHook(() => useApiMutation(fn), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(undefined as never).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe('Could not save');
  });
});
