import {
    filterNonNull,
    groupBy,
    unique,
    sortBy,
} from '../../src/utils/array';

describe('Array Utilities', () => {
    describe('filterNonNull', () => {
        it('removes null and undefined values', () => {
            const input = [1, null, 2, undefined, 3];
            expect(filterNonNull(input)).toEqual([1, 2, 3]);
        });

        it('returns empty array if all null', () => {
            expect(filterNonNull([null, undefined])).toEqual([]);
        });

        it('returns same array if no nulls', () => {
            expect(filterNonNull([1, 2])).toEqual([1, 2]);
        });
    });

    describe('groupBy', () => {
        it('groups array by key', () => {
            const input = [
                { id: 1, group: 'A' },
                { id: 2, group: 'B' },
                { id: 3, group: 'A' },
            ];
            const result = groupBy(input, 'group');
            expect(result).toEqual({
                A: [
                    { id: 1, group: 'A' },
                    { id: 3, group: 'A' },
                ],
                B: [{ id: 2, group: 'B' }],
            });
        });

        it('handles empty array', () => {
            expect(groupBy([], 'group')).toEqual({});
        });
    });

    describe('unique', () => {
        it('removes duplicates from array', () => {
            expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
        });

        it('works with strings', () => {
            expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
        });
    });

    describe('sortBy', () => {
        it('sorts array by key ascending', () => {
            const input = [{ val: 3 }, { val: 1 }, { val: 2 }];
            expect(sortBy(input, 'val')).toEqual([
                { val: 1 },
                { val: 2 },
                { val: 3 },
            ]);
        });

        it('sorts array by key descending', () => {
            const input = [{ val: 1 }, { val: 3 }, { val: 2 }];
            expect(sortBy(input, 'val', 'desc')).toEqual([
                { val: 3 },
                { val: 2 },
                { val: 1 },
            ]);
        });
    });
});
