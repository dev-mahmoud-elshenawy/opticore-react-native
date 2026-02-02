import { createCrudStore } from '../../src/state/StoreFactory';

// Define entity type
interface User {
    id: string;
    name: string;
}

// Define custom actions
interface CustomActions {
    activate: () => void;
}

describe('StoreFactory', () => {
    it('should generate CRUD store with async helpers', () => {
        const useStore = createCrudStore<User, CustomActions>({
            name: 'user-store',
            api: {
                fetchAll: async () => [{ id: '1', name: 'Alice' }],
                fetchById: async (id: string) => ({ id, name: 'Alice' }),
                create: async (data: Partial<User>) => ({ id: '2', name: 'Bob', ...data }),
                update: async (id: string, data: Partial<User>) => ({ id, name: 'Updated', ...data }),
                delete: async (_id: string) => { }
            },
            initialState: {}, // Optional custom state
            devtools: false,
        }, (_set: any) => ({
            activate: () => { }
        }));

        const state = useStore.getState();

        // Check initial state
        expect(state.items).toEqual([]);
        expect(state.status).toEqual({ type: 'idle' });

        // Check generated methods exist
        expect(typeof state.fetchAll).toBe('function');
        expect(typeof state.fetchById).toBe('function');
        expect(typeof state.create).toBe('function');
        expect(typeof state.update).toBe('function');
        expect(typeof state.delete).toBe('function');

        // Check custom actions
        expect(typeof state.activate).toBe('function');

        // Check base actions
        expect(typeof state.reset).toBe('function');
    });

    it('should handle fetchAll flow', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                fetchAll: async () => [{ id: '1', name: 'Alice' }],
            },
            devtools: false
        });

        // Initial
        expect(useStore.getState().status.type).toBe('idle');

        // Start fetch
        const promise = useStore.getState().fetchAll();

        // Loading state sync check might be tricky if it updates strictly async
        // But typically zustand updates are sync
        expect(useStore.getState().status.type).toBe('loading');

        await promise;

        // Success
        expect(useStore.getState().status.type).toBe('success');
        expect(useStore.getState().items).toHaveLength(1);
        expect(useStore.getState().items[0].name).toBe('Alice');
    });

    it('should handle create flow', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                create: async (data: Partial<User>) => ({ ...data, id: '123', name: 'Bob' }),
            },
            devtools: false
        });

        await useStore.getState().create({ id: 'temp', name: 'Bob' });

        expect(useStore.getState().items).toHaveLength(1);
        expect(useStore.getState().items[0].id).toBe('123');
        expect(useStore.getState().items[0].name).toBe('Bob');
    });

    it('should handle update flow', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            // Preload state
            initialState: {
                items: [{ id: '1', name: 'Alice' }]
            },
            api: {
                update: async (id: string, data: Partial<User>) => ({ id, name: 'Alice Updated', ...data }),
            },
            devtools: false
        });

        // Manually set initial state for test if needed, or rely on setup
        // But createCrudStore should accept initial state overrides
        // Let's use setState for test setup if needed, or just trust the mock
        useStore.setState({ items: [{ id: '1', name: 'Alice' }] });

        await useStore.getState().update('1', { name: 'Alice Updated' });

        expect(useStore.getState().items[0].name).toBe('Alice Updated');
    });

    it('should handle delete flow', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                delete: async (_id: string) => { },
            },
            devtools: false
        });

        useStore.setState({ items: [{ id: '1', name: 'Alice' }] });

        await useStore.getState().delete('1');

        expect(useStore.getState().items).toHaveLength(0);
    });

    it('should handle fetchById happy path', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                fetchById: async (id: string) => ({ id, name: 'Alice' }),
            },
            devtools: false
        });

        const promise = useStore.getState().fetchById('1');
        expect(useStore.getState().status.type).toBe('loading');

        await promise;

        expect(useStore.getState().status.type).toBe('success');
        expect(useStore.getState().selectedItem).toEqual({ id: '1', name: 'Alice' });
    });

    it('should no-op when API method is not provided', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {},
            devtools: false
        });

        await useStore.getState().fetchAll();
        expect(useStore.getState().status.type).toBe('idle');

        await useStore.getState().fetchById('1');
        expect(useStore.getState().status.type).toBe('idle');

        await useStore.getState().create({ name: 'Test' });
        expect(useStore.getState().status.type).toBe('idle');

        await useStore.getState().update('1', { name: 'Test' });
        expect(useStore.getState().status.type).toBe('idle');

        await useStore.getState().delete('1');
        expect(useStore.getState().status.type).toBe('idle');
    });

    it('should handle fetchAll error', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                fetchAll: async () => { throw new Error('Network error'); },
            },
            devtools: false
        });

        await useStore.getState().fetchAll();

        expect(useStore.getState().status.type).toBe('error');
        if (useStore.getState().status.type === 'error') {
            expect((useStore.getState().status as any).error.message).toBe('Network error');
        }
    });

    it('should handle fetchById error', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                fetchById: async () => { throw new Error('Not found'); },
            },
            devtools: false
        });

        await useStore.getState().fetchById('1');

        expect(useStore.getState().status.type).toBe('error');
    });

    it('should handle create error', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                create: async () => { throw new Error('Create failed'); },
            },
            devtools: false
        });

        await useStore.getState().create({ name: 'Test' });

        expect(useStore.getState().status.type).toBe('error');
    });

    it('should handle update error', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                update: async () => { throw new Error('Update failed'); },
            },
            devtools: false
        });

        await useStore.getState().update('1', { name: 'Test' });

        expect(useStore.getState().status.type).toBe('error');
    });

    it('should handle delete error', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                delete: async () => { throw new Error('Delete failed'); },
            },
            devtools: false
        });

        await useStore.getState().delete('1');

        expect(useStore.getState().status.type).toBe('error');
    });

    it('should handle non-Error throw in fetchAll', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                fetchAll: async () => { throw 'string error'; },
            },
            devtools: false
        });

        await useStore.getState().fetchAll();

        expect(useStore.getState().status.type).toBe('error');
        if (useStore.getState().status.type === 'error') {
            expect((useStore.getState().status as any).error.message).toBe('string error');
        }
    });

    it('should handle non-Error throw in fetchById', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                fetchById: async () => { throw 42; },
            },
            devtools: false
        });

        await useStore.getState().fetchById('1');

        expect(useStore.getState().status.type).toBe('error');
        if (useStore.getState().status.type === 'error') {
            expect((useStore.getState().status as any).error.message).toBe('42');
        }
    });

    it('should handle non-Error throw in create', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                create: async () => { throw 'create string error'; },
            },
            devtools: false
        });

        await useStore.getState().create({ name: 'Test' });

        expect(useStore.getState().status.type).toBe('error');
    });

    it('should handle non-Error throw in update', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                update: async () => { throw 'update string error'; },
            },
            devtools: false
        });

        await useStore.getState().update('1', { name: 'Test' });

        expect(useStore.getState().status.type).toBe('error');
    });

    it('should handle non-Error throw in delete', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                delete: async () => { throw 'delete string error'; },
            },
            devtools: false
        });

        await useStore.getState().delete('1');

        expect(useStore.getState().status.type).toBe('error');
    });

    it('should handle update when item not found in list', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                update: async (id: string, data: Partial<User>) => ({ id, name: 'Updated', ...data }),
            },
            devtools: false
        });

        useStore.setState({ items: [{ id: '1', name: 'Alice' }] });

        // Update non-existent item
        await useStore.getState().update('999', { name: 'Updated' });

        expect(useStore.getState().status.type).toBe('success');
        // Item with id '1' should remain unchanged
        expect(useStore.getState().items[0].name).toBe('Alice');
    });

    it('should update selectedItem when it matches updated id', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                update: async (id: string, data: Partial<User>) => ({ id, name: 'Updated', ...data }),
            },
            devtools: false
        });

        useStore.setState({
            items: [{ id: '1', name: 'Alice' }],
            selectedItem: { id: '1', name: 'Alice' }
        });

        await useStore.getState().update('1', { name: 'Updated' });

        expect(useStore.getState().selectedItem?.name).toBe('Updated');
    });

    it('should clear selectedItem when it matches deleted id', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                delete: async (_id: string) => { },
            },
            devtools: false
        });

        useStore.setState({
            items: [{ id: '1', name: 'Alice' }],
            selectedItem: { id: '1', name: 'Alice' }
        });

        await useStore.getState().delete('1');

        expect(useStore.getState().items).toHaveLength(0);
        expect(useStore.getState().selectedItem).toBeUndefined();
    });

    it('should not clear selectedItem when a different id is deleted', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                delete: async (_id: string) => { },
            },
            devtools: false
        });

        useStore.setState({
            items: [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }],
            selectedItem: { id: '1', name: 'Alice' }
        });

        await useStore.getState().delete('2');

        expect(useStore.getState().items).toHaveLength(1);
        expect(useStore.getState().selectedItem).toEqual({ id: '1', name: 'Alice' });
    });

    it('should not update selectedItem when it does not match updated id', async () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {
                update: async (id: string, data: Partial<User>) => ({ id, name: 'Updated', ...data }),
            },
            devtools: false
        });

        useStore.setState({
            items: [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }],
            selectedItem: { id: '1', name: 'Alice' }
        });

        await useStore.getState().update('2', { name: 'Updated' });

        expect(useStore.getState().selectedItem).toEqual({ id: '1', name: 'Alice' });
    });

    it('should create store without custom actions', () => {
        const useStore = createCrudStore<User>({
            name: 'user-store',
            api: {},
            devtools: false
        });

        const state = useStore.getState();
        expect(state.items).toEqual([]);
        expect(state.status).toEqual({ type: 'idle' });
    });
});
