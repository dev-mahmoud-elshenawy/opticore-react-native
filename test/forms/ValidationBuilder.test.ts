
import { z } from 'zod';
import { createValidationSchema, validators } from '../../src/forms/ValidationBuilder';
import { PhoneFormat } from '../../src/forms/types';

describe('ValidationBuilder', () => {
    describe('createValidationSchema', () => {
        test('should create a valid Zod schema', () => {
            const schema = createValidationSchema(() => ({
                name: z.string(),
                age: z.number(),
            }));

            expect(schema.parse({ name: 'John', age: 30 })).toEqual({ name: 'John', age: 30 });
            expect(() => schema.parse({ name: 123, age: '30' })).toThrow();
        });
    });

    describe('validators', () => {
        describe('email', () => {
            const schema = z.object({ email: validators.email() });

            test('should validate correct email', () => {
                expect(() => schema.parse({ email: 'test@example.com' })).not.toThrow();
            });

            test('should reject invalid email', () => {
                expect(() => schema.parse({ email: 'invalid-email' })).toThrow('Invalid email address');
            });
        });

        describe('phone', () => {
            test('should validate US phone numbers', () => {
                const schema = z.object({ phone: validators.phone() });
                expect(() => schema.parse({ phone: '(123) 456-7890' })).not.toThrow();
                expect(() => schema.parse({ phone: '123-456-7890' })).not.toThrow();
                expect(() => schema.parse({ phone: '1234567890' })).not.toThrow();
                expect(() => schema.parse({ phone: 'invalid' })).toThrow();
            });

            test('should validate international phone numbers', () => {
                const schema = z.object({
                    phone: validators.phone({ format: PhoneFormat.INTERNATIONAL })
                });
                expect(() => schema.parse({ phone: '+1234567890' })).not.toThrow();
                expect(() => schema.parse({ phone: '123' })).toThrow();
            });

            test('should handle optional phone', () => {
                const schema = z.object({
                    phone: validators.phone({ required: false })
                });
                expect(() => schema.parse({})).not.toThrow();
                expect(() => schema.parse({ phone: '' })).not.toThrow();
            });
        });

        // We can add more tests for password and common validators here
        describe('common', () => {
            test('required', () => {
                const schema = z.object({ req: validators.required() });
                expect(() => schema.parse({ req: 'val' })).not.toThrow();
                expect(() => schema.parse({ req: '' })).toThrow();
            });
        });
    });
});
