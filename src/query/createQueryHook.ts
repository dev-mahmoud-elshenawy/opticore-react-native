import { useQuery, type QueryKey, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

type QueryHookOptions<TData> = Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>;

/**
 * Build a typed query hook from a key factory + a fetcher, collapsing the
 * repeated `useQuery({ queryKey, queryFn })` boilerplate into one definition.
 *
 * @example
 * ```typescript
 * const useThing = createQueryHook(
 *   (id: string) => ['thing', id],
 *   (id) => repository.getById(id),
 * );
 * // in a component:
 * const { data, isLoading } = useThing('id-1');
 * ```
 */
export function createQueryHook<TArg, TData>(
  keyFn: (arg: TArg) => QueryKey,
  fetcher: (arg: TArg) => Promise<TData>,
  defaultOptions?: QueryHookOptions<TData>,
): (arg: TArg, options?: QueryHookOptions<TData>) => UseQueryResult<TData, Error> {
  return (arg, options) =>
    useQuery<TData, Error>({
      queryKey: keyFn(arg),
      queryFn: () => fetcher(arg),
      ...defaultOptions,
      ...options,
    });
}
