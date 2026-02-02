import { createBaseStore } from '../../src/state/BaseStore';

interface TestState {
    count: number;
    user: { name: string } | null;
}

interface TestActions {
    increment: () => void;
    setUser: (name: string) => void;
}

describe('BaseStore', () => {
    const createTestStore = () => createBaseStore<TestState & TestActions>({
        name: 'test-store',
        initialState: {
            count: 0,
            user: null,
            increment: () => { }, // Placeholder, will be overwritten
            setUser: () => { }    // Placeholder
        },
        devtools: false,
        immer: true
        // @ts-ignore - simplified for test
    }, (set: any) => ({
        increment: () => set((state: any) => { state.count += 1 }),
        setUser: (name: string) => set((state: any) => { state.user = { name } })
    }));

    it('should initialize with correct state', () => {
        const useStore = createTestStore();
        const state = useStore.getState();

        expect(state.count).toBe(0);
        expect(state.user).toBeNull();
    });

    it('should update state via actions', () => {
        const useStore = createTestStore();

        useStore.getState().increment();
        expect(useStore.getState().count).toBe(1);

        useStore.getState().setUser('Alice');
        expect(useStore.getState().user).toEqual({ name: 'Alice' });
    });

    it('should reset to initial state', () => {
        const useStore = createTestStore();

        useStore.getState().increment();
        useStore.getState().setUser('Bob');
        expect(useStore.getState().count).toBe(1);

        useStore.getState().reset();
        expect(useStore.getState().count).toBe(0);
        expect(useStore.getState().user).toBeNull();
    });

    it('should hydrate state', () => {
        const useStore = createTestStore();

        useStore.getState().hydrate({ count: 10, user: { name: 'Hydrated' } });
        expect(useStore.getState().count).toBe(10);
        expect(useStore.getState().user).toEqual({ name: 'Hydrated' });
    });

    it('should use default devtools config when not explicitly set', () => {
        const useStore = createBaseStore<TestState & TestActions>({
            name: 'test-store-default-devtools',
            initialState: {
                count: 0,
                user: null,
                increment: () => { },
                setUser: () => { }
            },
            immer: true
            // @ts-ignore - simplified for test
        }, (set: any) => ({
            increment: () => set((state: any) => { state.count += 1 }),
            setUser: (name: string) => set((state: any) => { state.user = { name } })
        }));

        const state = useStore.getState();
        expect(state.count).toBe(0);
        expect(typeof state.increment).toBe('function');
    });

    it('should work with devtools explicitly enabled', () => {
        const useStore = createBaseStore<TestState & TestActions>({
            name: 'test-store-devtools-on',
            initialState: {
                count: 0,
                user: null,
                increment: () => { },
                setUser: () => { }
            },
            devtools: true,
            immer: true
            // @ts-ignore - simplified for test
        }, (set: any) => ({
            increment: () => set((state: any) => { state.count += 1 }),
            setUser: (name: string) => set((state: any) => { state.user = { name } })
        }));

        useStore.getState().increment();
        expect(useStore.getState().count).toBe(1);
    });
});
