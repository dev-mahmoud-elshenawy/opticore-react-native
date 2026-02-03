import {
    get,
    deepMerge,
    pick,
    omit,
} from '../../src/utils/object';

describe('Object Utilities', () => {
    describe('get', () => {
        it('retrieves nested property', () => {
            const obj = { a: { b: { c: 1 } } };
            expect(get(obj, 'a.b.c')).toBe(1);
        });

        it('returns fallback if path not found', () => {
            const obj = { a: 1 };
            expect(get(obj, 'a.b.c', 'fallback')).toBe('fallback');
        });

        it('handles arrays in path', () => {
            const obj = { a: [{ b: 1 }] };
            expect(get(obj, 'a.0.b')).toBe(1);
        });
    });

    describe('deepMerge', () => {
        it('merges nested objects', () => {
            const obj1 = { a: 1, b: { c: 2 } };
            const obj2 = { b: { d: 3 }, e: 4 };
            expect(deepMerge(obj1, obj2)).toEqual({
                a: 1,
                b: { c: 2, d: 3 },
                e: 4,
            });
        });

        it('overwrites primitives', () => {
            const obj1 = { a: 1 };
            const obj2 = { a: 2 };
            expect(deepMerge(obj1, obj2)).toEqual({ a: 2 });
        });
    });

    describe('pick', () => {
        it('picks specified keys', () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
        });

        it('ignores keys that do not exist', () => {
            const obj = { a: 1 };
            expect(pick(obj, ['a', 'b'] as any)).toEqual({ a: 1 });
        });
    });

    describe('omit', () => {
        it('omits specified keys', () => {
            const obj = { a: 1, b: 2, c: 3 };
            expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
        });
    });
});
