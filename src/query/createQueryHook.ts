import { useQuery, type QueryKey, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import { RenderError } from '../error/RenderError';

type QueryHookOptions<TData> = Omit<UseQueryOptions<TData, RenderError>, 'queryKey' | 'queryFn'>;

/**
 * Build a typed query hook from a key factory + a fetcher, collapsing the
 * repeated `useQuery({ queryKey, queryFn })` boilerplate into one definition.
 *
 * The error channel is typed as `RenderError` (the base class for `ApiError`
 * and friends) so consumers can read `error.userMessage`, `error.status`
 * (when it's an `ApiError`), etc. without a manual cast. At runtime, any
 * rejection is passed through unchanged — this only sharpens the type.
 *
 * @example
 * ```typescript
 * const useThing = createQueryHook(
 *   (id: string) => ['thing', id],
 *   (id) => repository.getById(id),
 * );
 * // in a component:
 * const { data, isLoading, error } = useThing('id-1');
 * if (error) console.warn(error.userMessage);
 * ```
 */
export function createQueryHook<TArg, TData>(
  keyFn: (arg: TArg) => QueryKey,
  fetcher: (arg: TArg) => Promise<TData>,
  defaultOptions?: QueryHookOptions<TData>,
): (arg: TArg, options?: QueryHookOptions<TData>) => UseQueryResult<TData, RenderError> {
  return (arg, options) =>
    useQuery<TData, RenderError>({
      queryKey: keyFn(arg),
      queryFn: () => fetcher(arg),
      ...defaultOptions,
      ...options,
    });
}
