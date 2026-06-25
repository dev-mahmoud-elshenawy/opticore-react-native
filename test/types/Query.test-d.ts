import { expectType } from 'tsd';
import { createQueryHook } from '../../src/query/createQueryHook';
import { RenderError } from '../../src/error/RenderError';

const useThing = createQueryHook(
  (id: string) => ['thing', id] as const,
  (id: string) => Promise.resolve({ id }),
);

const result = useThing('id-1');

// `error` is typed as RenderError | null without a manual cast — consumers
// can read `userMessage`, `status` (via ApiError narrowing), etc.
expectType<RenderError | null>(result.error);
