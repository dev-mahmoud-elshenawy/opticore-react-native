import { ConfigValidator } from '../../src/config/ConfigValidator';
import { CoreConfig } from '../../src/config/types';

describe('ConfigValidator', () => {
    it('should throw if config is missing', () => {
        expect(() => ConfigValidator.validate(undefined as any)).toThrow('Configuration object is required');
    });

    it('should throw if api config is missing', () => {
        const config = {} as CoreConfig;
        expect(() => ConfigValidator.validate(config)).toThrow('API configuration is required');
    });

    it('should throw if baseURL is missing', () => {
        const config = { api: {} } as CoreConfig;
        expect(() => ConfigValidator.validate(config)).toThrow('API baseURL is required');
    });

    it('should throw if baseURL is invalid', () => {
        const config = { api: { baseURL: 'not-a-url' } } as CoreConfig;
        expect(() => ConfigValidator.validate(config)).toThrow('Invalid API baseURL');
    });

    it('should pass for valid config', () => {
        const config: CoreConfig = {
            api: {
                baseURL: 'https://api.example.com'
            }
        };
        expect(() => ConfigValidator.validate(config)).not.toThrow();
    });
});
