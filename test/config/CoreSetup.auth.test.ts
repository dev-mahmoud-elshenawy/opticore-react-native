import { CoreSetup } from '../../src/config/CoreSetup';
import { ApiClient } from '../../src/infrastructure/network/ApiClient';
import { NoAuthStrategy } from '../../src/infrastructure/network/AuthStrategy';

jest.mock('../../src/infrastructure/network/ApiClient');
jest.mock('../../src/config/ConfigValidator');

describe('CoreSetup Auth Configuration', () => {
    let apiClientMock: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset CoreSetup singleton if possible or just use instance
        // coreSetup is a singleton, so we are testing side effects on ApiClient

        apiClientMock = {
            configure: jest.fn(),
        };
        (ApiClient.getInstance as jest.Mock).mockReturnValue(apiClientMock);
    });

    it('should pass onTokenRefresh to ApiClient', () => {
        const onTokenRefresh = jest.fn();
        const config: any = {
            api: {
                baseURL: 'https://test.com',
                onTokenRefresh
            }
        };

        CoreSetup.getInstance().init(config);

        expect(apiClientMock.configure).toHaveBeenCalledWith(expect.objectContaining({
            onTokenRefresh
        }));
    });

    it('should pass authStrategy to ApiClient', () => {
        const authStrategy = new NoAuthStrategy();
        const config: any = {
            api: {
                baseURL: 'https://test.com',
                authStrategy
            }
        };

        CoreSetup.getInstance().init(config);

        expect(apiClientMock.configure).toHaveBeenCalledWith(expect.objectContaining({
            authStrategy
        }));
    });
});
