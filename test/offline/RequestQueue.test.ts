
import { RequestQueue } from '@/offline/RequestQueue';
import { LocalStorage } from '@/infrastructure/storage/LocalStorage';
import type { QueuedRequest } from '@/offline/types';

jest.mock('@/infrastructure/storage/LocalStorage');
jest.mock('@/infrastructure/logger/Logger');

describe('RequestQueue', () => {
    let queue: RequestQueue;
    let mockStorage: jest.Mocked<LocalStorage>;

    beforeEach(() => {
        // Reset singletons
        (LocalStorage as any).instance = null;

        // Create mocked storage
        mockStorage = {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
        } as any;

        (LocalStorage.getInstance as jest.Mock).mockReturnValue(mockStorage);

        queue = new RequestQueue(100, 'test_queue');
    });

    afterEach(() => {
        queue.clear();
    });

    describe('add', () => {
        it('should add a request to the queue', () => {
            const request: QueuedRequest = {
                method: 'POST',
                url: '/api/test',
                data: { foo: 'bar' },
            };

            const id = queue.add(request);

            expect(id).toBeDefined();
            expect(queue.size()).toBe(1);
            expect(mockStorage.set).toHaveBeenCalled();
        });

        it('should assign a generated ID if not provided', () => {
            const request: QueuedRequest = {
                method: 'GET',
                url: '/api/test',
            };

            const id = queue.add(request);

            expect(id).toMatch(/^req_\d+_/);
        });

        it('should use provided ID', () => {
            const request: QueuedRequest = {
                id: 'custom-id',
                method: 'GET',
                url: '/api/test',
            };

            const id = queue.add(request);

            expect(id).toBe('custom-id');
        });

        it('should set default priority to normal', () => {
            const request: QueuedRequest = {
                method: 'GET',
                url: '/api/test',
            };

            const id = queue.add(request);
            const item = queue.getById(id);

            expect(item?.priority).toBe('normal');
        });

        it('should set default maxRetries to 3', () => {
            const request: QueuedRequest = {
                method: 'GET',
                url: '/api/test',
            };

            const id = queue.add(request);
            const item = queue.getById(id);

            expect(item?.maxRetries).toBe(3);
        });

        it('should throw error when queue is full', () => {
            const smallQueue = new RequestQueue(2, 'small_queue');

            smallQueue.add({ method: 'GET', url: '/1' });
            smallQueue.add({ method: 'GET', url: '/2' });

            expect(() => {
                smallQueue.add({ method: 'GET', url: '/3' });
            }).toThrow('Queue is full');
        });
    });

    describe('remove', () => {
        it('should remove a request from the queue', () => {
            const id = queue.add({ method: 'GET', url: '/test' });

            const removed = queue.remove(id);

            expect(removed).toBe(true);
            expect(queue.size()).toBe(0);
            expect(mockStorage.set).toHaveBeenCalledTimes(2); // add + remove
        });

        it('should return false if request not found', () => {
            const removed = queue.remove('non-existent');

            expect(removed).toBe(false);
        });
    });

    describe('getAll', () => {
        it('should return all queued requests', () => {
            queue.add({ method: 'GET', url: '/1' });
            queue.add({ method: 'POST', url: '/2' });
            queue.add({ method: 'PUT', url: '/3' });

            const all = queue.getAll();

            expect(all).toHaveLength(3);
        });

        it('should return a copy of the array', () => {
            queue.add({ method: 'GET', url: '/1' });

            const all = queue.getAll();
            all.push({ id: 'fake', method: 'DELETE', url: '/fake', priority: 'normal', maxRetries: 3, retryCount: 0, createdAt: Date.now() });

            expect(queue.size()).toBe(1); // Original unchanged
        });
    });

    describe('getById', () => {
        it('should return a specific request by ID', () => {
            const id = queue.add({ method: 'GET', url: '/test' });

            const item = queue.getById(id);

            expect(item).toBeDefined();
            expect(item?.id).toBe(id);
        });

        it('should return undefined for non-existent ID', () => {
            const item = queue.getById('non-existent');

            expect(item).toBeUndefined();
        });
    });

    describe('update', () => {
        it('should update a request', () => {
            const id = queue.add({ method: 'GET', url: '/test', retryCount: 0 });

            const updated = queue.update(id, { retryCount: 1 });

            expect(updated).toBe(true);
            expect(queue.getById(id)?.retryCount).toBe(1);
        });

        it('should return false for non-existent ID', () => {
            const updated = queue.update('non-existent', { retryCount: 1 });

            expect(updated).toBe(false);
        });

        it('should re-sort after update', () => {
            const id1 = queue.add({ method: 'GET', url: '/1', priority: 'normal' });
            const id2 = queue.add({ method: 'GET', url: '/2', priority: 'low' });

            // Update id2 to high priority
            queue.update(id2, { priority: 'high' });

            const all = queue.getAll();
            expect(all[0].id).toBe(id2); // Now first
            expect(all[1].id).toBe(id1);
        });
    });

    describe('clear', () => {
        it('should remove all requests', () => {
            queue.add({ method: 'GET', url: '/1' });
            queue.add({ method: 'GET', url: '/2' });
            queue.add({ method: 'GET', url: '/3' });

            queue.clear();

            expect(queue.size()).toBe(0);
        });
    });

    describe('priority sorting', () => {
        it('should sort by priority: high > normal > low', () => {
            const lowId = queue.add({ method: 'GET', url: '/low', priority: 'low' });
            const highId = queue.add({ method: 'GET', url: '/high', priority: 'high' });
            const normalId = queue.add({ method: 'GET', url: '/normal', priority: 'normal' });

            const all = queue.getAll();

            expect(all[0].id).toBe(highId);
            expect(all[1].id).toBe(normalId);
            expect(all[2].id).toBe(lowId);
        });

        it('should sort by creation time within same priority', () => {
            const id1 = queue.add({ method: 'GET', url: '/1', priority: 'normal' });
            const id2 = queue.add({ method: 'GET', url: '/2', priority: 'normal' });
            const id3 = queue.add({ method: 'GET', url: '/3', priority: 'normal' });

            const all = queue.getAll();

            expect(all[0].id).toBe(id1); // Oldest first
            expect(all[1].id).toBe(id2);
            expect(all[2].id).toBe(id3);
        });
    });

    describe('persistence', () => {
        it('should persist queue after adding', () => {
            queue.add({ method: 'GET', url: '/test' });

            expect(mockStorage.set).toHaveBeenCalledWith('test_queue', expect.any(Array));
        });

        it('should persist queue after removing', () => {
            const id = queue.add({ method: 'GET', url: '/test' });
            jest.clearAllMocks();

            queue.remove(id);

            expect(mockStorage.set).toHaveBeenCalled();
        });

        it('should restore queue from storage', async () => {
            const storedQueue = [
                {
                    id: 'stored-1',
                    method: 'GET' as const,
                    url: '/stored',
                    priority: 'normal' as const,
                    maxRetries: 3,
                    retryCount: 0,
                    createdAt: Date.now(),
                },
            ];
            mockStorage.get.mockResolvedValue(storedQueue);

            await queue.restore();

            expect(queue.size()).toBe(1);
            expect(queue.getById('stored-1')).toBeDefined();
        });

        it('should handle restore errors gracefully', async () => {
            mockStorage.get.mockRejectedValue(new Error('Storage error'));

            await queue.restore();

            expect(queue.size()).toBe(0); // Empty queue on error
        });

        it('should handle null/undefined stored data', async () => {
            mockStorage.get.mockResolvedValue(null);

            await queue.restore();

            expect(queue.size()).toBe(0);
        });
    });
});
