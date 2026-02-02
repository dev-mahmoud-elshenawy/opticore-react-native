import { createBaseStore } from '../../../src/state/BaseStore';
import { StateObserver } from '../../../src/state/StateObserver';
import { AsyncState, toLoading, toSuccess } from '../../../src/state/AsyncState';

describe('State Management Integration', () => {

    // T031: AsyncState + BaseStore
    it('should manage AsyncState within BaseStore', () => {
        interface DataState {
            status: AsyncState<string>;
            fetch: () => void;
            complete: (data: string) => void;
        }

        const store = createBaseStore<DataState>({
            name: 'integration-async-store',
            initialState: {
                status: { type: 'idle' },
                fetch: () => { },
                complete: () => { }
            },
            devtools: false
        }, (set) => ({
            fetch: () => set((state: any) => { state.status = toLoading(state.status) }),
            complete: (data: string) => set((state: any) => { state.status = toSuccess(data) })
        }) as any);

        expect(store.getState().status.type).toBe('idle');

        store.getState().fetch();
        expect(store.getState().status.type).toBe('loading');

        store.getState().complete('test-data');
        expect(store.getState().status.type).toBe('success');
        if (store.getState().status.type === 'success') {
            expect((store.getState().status as any).data).toBe('test-data');
        }
    });

    // T032: BaseStore + StateObserver
    it('should observe BaseStore changes via StateObserver', () => {
        const observer = StateObserver.getInstance();
        const callback = jest.fn();

        interface CounterState {
            count: number;
            inc: () => void;
        }

        const store = createBaseStore<CounterState>({
            name: 'integration-observer-store',
            initialState: { count: 0, inc: () => { } },
            devtools: false
        }, (set) => ({
            inc: () => set((state: any) => { state.count += 1 })
        }) as any);

        const unsubscribe = observer.subscribe(store, callback);

        store.getState().inc();

        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ count: 1 }),
            expect.objectContaining({ count: 0 }),
            undefined
        );

        unsubscribe();
    });

    // T033: StoreFactory + AsyncState + StateObserver (full pattern)
    it('should integrate StoreFactory with AsyncState and Observer', () => {
        const observer = StateObserver.getInstance();
        const callback = jest.fn();

        interface User { id: string; name: string; }

        // Mock API
        const api = {
            fetchAll: async () => [{ id: '1', name: 'Alice' }],
            fetchById: async (id: string) => ({ id, name: 'Alice' }),
            create: async (data: Partial<User>) => ({ ...data, id: '2' }),
            update: async (id: string, data: Partial<User>) => ({ ...data, id }),
            delete: async (_id: string) => { }
        };

        // Create store via factory
        const useStore = require('../../../src/state/StoreFactory').createCrudStore({
            name: 'integration-factory-store',
            api,
            devtools: false
        });

        // Subscribe to changes
        const unsubscribe = observer.subscribe(useStore, callback);

        // Perform action
        useStore.getState().fetchAll();

        // Should have transitioned: idle -> loading
        expect(callback).toHaveBeenCalled();

        // Cleanup
        unsubscribe();
    });
});
