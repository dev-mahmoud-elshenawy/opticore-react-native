import { ConflictResolver } from '../../src/offline/ConflictResolver';
import { Logger } from '../../src/infrastructure/logger/Logger';

// Mock Logger
jest.mock('../../src/infrastructure/logger/Logger');
const mockLoggerError = jest.fn();
const mockLoggerWarn = jest.fn();

(Logger.getInstance as jest.Mock) = jest.fn().mockReturnValue({
    error: mockLoggerError,
    warn: mockLoggerWarn,
    info: jest.fn(),
    debug: jest.fn(),
});

describe('ConflictResolver', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('server-wins strategy (default)', () => {
        it('should return server data', async () => {
            const resolver = new ConflictResolver('server-wins');
            const local = { id: 1, value: 'local' };
            const server = { id: 1, value: 'server' };

            const result = await resolver.resolve(local, server);

            expect(result).toBe(server);
        });

        it('should default to server-wins if no strategy provided', async () => {
            const resolver = new ConflictResolver();
            const local = { id: 1, value: 'local' };
            const server = { id: 1, value: 'server' };

            const result = await resolver.resolve(local, server);

            expect(result).toBe(server);
        });
    });

    describe('client-wins strategy', () => {
        it('should return local data', async () => {
            const resolver = new ConflictResolver('client-wins');
            const local = { id: 1, value: 'local' };
            const server = { id: 1, value: 'server' };

            const result = await resolver.resolve(local, server);

            expect(result).toBe(local);
        });
    });

    describe('manual strategy', () => {
        it('should use the provided handler', async () => {
            const handler = jest.fn().mockImplementation((local, server) => ({ ...server, merged: true }));
            const resolver = new ConflictResolver('manual', handler);
            const local = { id: 1, value: 'local' };
            const server = { id: 1, value: 'server' };

            const result = await resolver.resolve(local, server);

            expect(handler).toHaveBeenCalledWith(local, server);
            expect(result).toEqual({ id: 1, value: 'server', merged: true });
        });

        it('should support async handlers', async () => {
            const handler = jest.fn().mockResolvedValue({ id: 1, value: 'async-merged' });
            const resolver = new ConflictResolver('manual', handler);
            const local = { id: 1, value: 'local' };
            const server = { id: 1, value: 'server' };

            const result = await resolver.resolve(local, server);

            expect(result).toEqual({ id: 1, value: 'async-merged' });
        });

        it('should fallback to server-wins if handler throws error', async () => {
            const handler = jest.fn().mockRejectedValue(new Error('Merge failed'));
            const resolver = new ConflictResolver('manual', handler);
            const local = { id: 1, value: 'local' };
            const server = { id: 1, value: 'server' };

            const result = await resolver.resolve(local, server);

            expect(result).toBe(server);
            expect(mockLoggerError).toHaveBeenCalled();
        });

        it('should fallback to server-wins if no handler provided', async () => {
            const resolver = new ConflictResolver('manual');
            const local = { id: 1, value: 'local' };
            const server = { id: 1, value: 'server' };

            const result = await resolver.resolve(local, server);

            expect(result).toBe(server);
            expect(mockLoggerWarn).toHaveBeenCalled();
        });
    });
});
