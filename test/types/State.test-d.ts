import { expectType } from 'tsd';
import type { LoadingState, AsyncValue } from '../../src/types/State.types';

// Test LoadingState
const loading: LoadingState<string> = {
    status: 'success',
    data: 'test'
};
expectType<string | undefined>(loading.data);
expectType<'idle' | 'loading' | 'success' | 'error'>(loading.status);

// Test AsyncValue
const asyncValue: AsyncValue<string> = { status: 'success', data: 'test' };
if (asyncValue.status === 'success') {
    expectType<string>(asyncValue.data);
}
