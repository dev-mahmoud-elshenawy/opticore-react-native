
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { OptiCoreProvider } from '../../src/providers/OptiCoreProvider';
import { useConfig } from '../../src/providers/useConfig';
import { CoreSetup } from '../../src/config/CoreSetup';
import { ThemeManager } from '../../src/theme/ThemeManager';
import { Text } from 'react-native';

// Mocks
jest.mock('../../src/config/CoreSetup');
jest.mock('../../src/theme/ThemeManager');
jest.mock('../../src/infrastructure/connectivity/ConnectivityManager');
jest.mock('../../src/infrastructure/lifecycle/LifecycleManager');

// Helper component to test context
const TestComponent = () => {
    const config = useConfig();
    return (
        <Text testID="config-value">
            {JSON.stringify(config)}
        </Text>
    );
};

describe('OptiCoreProvider', () => {
    const mockInit = jest.fn();
    const mockThemeManager = {
        getTheme: jest.fn().mockReturnValue({ colors: {}, spacing: {}, typography: {} }),
        getMode: jest.fn().mockReturnValue('light'),
        getActiveMode: jest.fn().mockReturnValue('light'),
        addThemeListener: jest.fn().mockReturnValue(() => { }),
        init: jest.fn().mockResolvedValue(undefined),
        configure: jest.fn(),
        setMode: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (CoreSetup.getInstance as jest.Mock).mockReturnValue({
            init: mockInit,
        });
        (ThemeManager.getInstance as jest.Mock).mockReturnValue(mockThemeManager);
    });

    it('should initialize CoreSetup with config', async () => {
        const config: any = {
            api: { baseURL: 'https://test.com' },
        };

        await render(
            <OptiCoreProvider config={config}>
                <Text>Child</Text>
            </OptiCoreProvider>
        );

        await waitFor(() => {
            expect(mockInit).toHaveBeenCalledWith(config);
        });
    });

    it('should provide ConfigContext to children', async () => {
        const config: any = {
            api: { baseURL: 'https://test.com' },
            responsive: {
                breakpoints: { small: 100, medium: 200, large: 300 }
            }
        };

        const { getByTestId } = await render(
            <OptiCoreProvider config={config}>
                <TestComponent />
            </OptiCoreProvider>
        );

        const text = getByTestId('config-value').props.children;
        const parsed = JSON.parse(text);

        expect(parsed.responsive).toEqual(config.responsive.breakpoints);
    });

    it('should use default breakpoints if not provided', async () => {
        const config: any = {
            api: { baseURL: 'https://test.com' },
        };

        const { getByTestId } = await render(
            <OptiCoreProvider config={config}>
                <TestComponent />
            </OptiCoreProvider>
        );

        const text = getByTestId('config-value').props.children;
        const parsed = JSON.parse(text);

        expect(parsed.responsive.medium).toBe(768); // Default
    });
});
