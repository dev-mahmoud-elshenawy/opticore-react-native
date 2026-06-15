import { RenderError } from './RenderError';

/**
 * Resolve a user-facing message from any thrown value.
 *
 * OptiCore surfaces failures as `RenderError` (e.g. `ApiError`), which carries a
 * friendly `userMessage` distinct from the technical `message` — prefer it.
 * Falls back to a plain `Error` message, then to a generic string.
 *
 * @example
 * ```typescript
 * catch (e) { toast(toMessage(e)); }
 * ```
 */
export function toMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof RenderError) return error.userMessage;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
