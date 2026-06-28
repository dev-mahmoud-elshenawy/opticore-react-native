import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { OptiCoreProvider } from '../../src/providers/OptiCoreProvider';
import { useConfig } from '../../src/providers/useConfig';
import { CoreSetup } from '../../src/config/CoreSetup';
import { ThemeManager } from '../../src/theme/ThemeManager';
import { ConnectivityManager } from '../../src/infrastructure/connectivity/ConnectivityManager';
import { LifecycleManager } from '../../src/infrastructure/lifecycle/LifecycleManager';
import { Text } from 'react-native';

// Mocks
jest.mock('../../src/config/CoreSetup');
jest.mock('../../src/theme/ThemeManager');
jest.mock('../../src/infrastructure/connectivity/ConnectivityManager');
jest.mock('../../src/infrastructure/lifecycle/LifecycleManager');

// Helper component to test context
const TestComponent = () => {
  const config = useConfig();
  return <Text testID="config-value">{JSON.stringify(config)}</Text>;
};

describe('OptiCoreProvider', () => {
  const mockInit = jest.fn();
  const mockThemeManager = {
    getTheme: jest.fn().mockReturnValue({ colors: {}, spacing: {}, typography: {} }),
    getMode: jest.fn().mockReturnValue('light'),
    getActiveMode: jest.fn().mockReturnValue('light'),
    addThemeListener: jest.fn().mockReturnValue(() => {}),
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
    (ConnectivityManager.getInstance as jest.Mock).mockReturnValue({
      configure: jest.fn(),
      dispose: jest.fn(),
    });
    (LifecycleManager.getInstance as jest.Mock).mockReturnValue({ dispose: jest.fn() });
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

  it('should initialize CoreSetup BEFORE children render (init ordering — spec 028 ④)', async () => {
    const config: any = { api: { baseURL: 'https://test.com' } };

    // Captures how many times init() had been called at the moment the child
    // renders. Children render AFTER the provider's synchronous setup block,
    // so init must already have run exactly once. (With the old useEffect-based
    // setup this would be 0 — child effects precede parent effects.)
    let initCallsAtChildRender = -1;
    const Child = () => {
      initCallsAtChildRender = mockInit.mock.calls.length;
      return <Text>child</Text>;
    };

    await render(
      <OptiCoreProvider config={config}>
        <Child />
      </OptiCoreProvider>
    );

    // Captured DURING the child's render: init had already run exactly once.
    expect(initCallsAtChildRender).toBe(1);
    expect(mockInit).toHaveBeenCalledWith(config);
  });

  it('should provide ConfigContext to children', async () => {
    const config: any = {
      api: { baseURL: 'https://test.com' },
      responsive: {
        breakpoints: { small: 100, medium: 200, large: 300 },
      },
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
