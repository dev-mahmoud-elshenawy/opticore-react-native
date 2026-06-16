import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { toMessage } from '../error/toMessage';

/** A `useMutation` result plus a ready-to-display, user-facing error message. */
export type ApiMutationResult<TData, TError, TVars> = UseMutationResult<TData, TError, TVars> & {
  /** `toMessage(error)` when the mutation failed, otherwise `null`. */
  errorMessage: string | null;
};

/**
 * `useMutation` wrapper that surfaces a user-facing `errorMessage` (resolved via
 * {@link toMessage}, preferring `RenderError.userMessage`). Saves wiring
 * error→message in every screen. All standard mutation options pass through.
 *
 * @example
 * ```tsx
 * const save = useApiMutation((input: Input) => repository.create(input));
 * <Button onPress={() => save.mutate(input)} />
 * {save.errorMessage && <Text>{save.errorMessage}</Text>}
 * ```
 */
export function useApiMutation<TData, TVars, TError = Error>(
  mutationFn: (vars: TVars) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVars>, 'mutationFn'>,
): ApiMutationResult<TData, TError, TVars> {
  const mutation = useMutation<TData, TError, TVars>({ mutationFn, ...options });
  return {
    ...mutation,
    errorMessage: mutation.isError ? toMessage(mutation.error) : null,
  };
}
