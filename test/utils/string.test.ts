import {
    notNull,
    capitalize,
    truncate,
    maskSensitive,
    toCamelCase,
    toSnakeCase,
    toKebabCase,
    isEmpty,
    isEmail,
    isURL,
} from '../../src/utils/string';

describe('String Utilities', () => {
    describe('notNull', () => {
        it('returns original string if not null/undefined', () => {
            expect(notNull('hello')).toBe('hello');
        });

        it('returns fallback if null', () => {
            expect(notNull(null, 'fallback')).toBe('fallback');
        });

        it('returns fallback if undefined', () => {
            expect(notNull(undefined, 'fallback')).toBe('fallback');
        });

        it('returns empty string fallback if not provided', () => {
            expect(notNull(null)).toBe('');
        });
    });

    describe('capitalize', () => {
        it('capitalizes first letter', () => {
            expect(capitalize('hello')).toBe('Hello');
        });

        it('lowercases rest of string', () => {
            expect(capitalize('HELLO')).toBe('Hello');
        });

        it('handles empty string', () => {
            expect(capitalize('')).toBe('');
        });

        it('handles single char', () => {
            expect(capitalize('a')).toBe('A');
        });
    });

    describe('truncate', () => {
        it('truncates string longer than length', () => {
            expect(truncate('hello world', 5)).toBe('hello...');
        });

        it('uses custom suffix', () => {
            expect(truncate('hello world', 5, '*')).toBe('hello*');
        });

        it('returns original if shorter than length', () => {
            expect(truncate('hi', 5)).toBe('hi');
        });

        it('returns original if equal to length', () => {
            expect(truncate('hello', 5)).toBe('hello');
        });
    });

    describe('maskSensitive', () => {
        it('masks string keeping visible chars', () => {
            expect(maskSensitive('1234567890', 4)).toBe('******7890');
        });

        it('returns original if shorter than visible chars', () => {
            expect(maskSensitive('123', 4)).toBe('123');
        });

        it('handles custom mask char', () => {
            expect(maskSensitive('123456', 2, '#')).toBe('####56');
        });
    });

    describe('toCamelCase', () => {
        it('converts snake_case', () => {
            expect(toCamelCase('hello_world')).toBe('helloWorld');
        });

        it('converts kebab-case', () => {
            expect(toCamelCase('hello-world')).toBe('helloWorld');
        });

        it('converts space separated', () => {
            expect(toCamelCase('hello world')).toBe('helloWorld');
        });
    });

    describe('toSnakeCase', () => {
        it('converts camelCase', () => {
            expect(toSnakeCase('helloWorld')).toBe('hello_world');
        });

        it('converts kebab-case', () => {
            expect(toSnakeCase('hello-world')).toBe('hello_world');
        });
    });

    describe('toKebabCase', () => {
        it('converts camelCase', () => {
            expect(toKebabCase('helloWorld')).toBe('hello-world');
        });

        it('converts snake_case', () => {
            expect(toKebabCase('hello_world')).toBe('hello-world');
        });
    });

    describe('isEmpty', () => {
        it('returns true for null/undefined', () => {
            expect(isEmpty(null)).toBe(true);
            expect(isEmpty(undefined)).toBe(true);
        });

        it('returns true for empty string', () => {
            expect(isEmpty('')).toBe(true);
        });

        it('returns true for whitespace only', () => {
            expect(isEmpty('   ')).toBe(true);
        });

        it('returns false for non-empty string', () => {
            expect(isEmpty('a')).toBe(false);
        });
    });

    describe('isEmail', () => {
        it('validates correct email', () => {
            expect(isEmail('test@example.com')).toBe(true);
        });

        it('rejects invalid email', () => {
            expect(isEmail('test@')).toBe(false);
            expect(isEmail('test')).toBe(false);
            expect(isEmail('')).toBe(false);
        });
    });

    describe('isURL', () => {
        it('validates correct URL', () => {
            expect(isURL('https://example.com')).toBe(true);
            expect(isURL('http://example.com')).toBe(true);
        });

        it('rejects invalid URL', () => {
            expect(isURL('example')).toBe(false);
            expect(isURL('')).toBe(false);
        });
    });
});
