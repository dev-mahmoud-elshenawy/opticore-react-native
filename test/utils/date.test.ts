import {
    formatDate,
    parseDate,
    isSameDay,
} from '../../src/utils/date';

describe('Date Utilities', () => {
    describe('formatDate', () => {
        it('formats date correctly', () => {
            const date = new Date('2023-01-01T12:00:00');
            expect(formatDate(date, 'yyyy-MM-dd')).toBe('2023-01-01'); // date-fns uses yyyy
        });

        it('returns empty string for invalid date', () => {
            expect(formatDate(new Date('invalid'), 'yyyy-MM-dd')).toBe('');
        });
    });

    describe('parseDate', () => {
        it('parses valid date string', () => {
            const date = parseDate('2023-01-01', 'yyyy-MM-dd');
            expect(date).toBeInstanceOf(Date);
            expect(date?.getFullYear()).toBe(2023);
        });

        it('returns null for invalid date string', () => {
            expect(parseDate('invalid', 'yyyy-MM-dd')).toBeNull();
        });
    });

    describe('isSameDay', () => {
        it('returns true for same day', () => {
            const d1 = new Date('2023-01-01T10:00:00');
            const d2 = new Date('2023-01-01T20:00:00');
            expect(isSameDay(d1, d2)).toBe(true);
        });

        it('returns false for different days', () => {
            const d1 = new Date('2023-01-01');
            const d2 = new Date('2023-01-02');
            expect(isSameDay(d1, d2)).toBe(false);
        });
    });
});
