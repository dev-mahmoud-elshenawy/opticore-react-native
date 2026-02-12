import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { OptiCoreErrorBoundary } from '../../src/error/OptiCoreErrorBoundary';
import { RenderError } from '../../src/error/RenderError';
import { NonRenderError } from '../../src/error/NonRenderError';
import { ErrorClassifier } from '../../src/error/ErrorClassifier';
import { Logger } from '../../src/infrastructure/logger/Logger';

// Suppress React's error boundary console.error noise in tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => { });
});
afterEach(() => {
  jest.restoreAllMocks();
  ErrorClassifier.clearCustomRules();
});

// Component that throws on first render, returns normally afterwards
function makeThrowingComponent(error: unknown) {
  let thrown = false;
  return function ThrowingComponent() {
    if (!thrown) {
      thrown = true;
      throw error;
    }
    return <Text>Recovered</Text>;
  };
}

// child throws RenderError → fallback shown with userMessage
describe('RenderError', () => {
  it('shows default fallback with userMessage', async () => {
    const renderError = new RenderError('internal', 'Something went wrong for the user');
    const ThrowingComponent = makeThrowingComponent(renderError);

    const { getByText } = await render(
      <OptiCoreErrorBoundary>
        <ThrowingComponent />
      </OptiCoreErrorBoundary>
    );

    expect(getByText('Something went wrong for the user')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });
});

// child throws NonRenderError → error logged, no fallback
describe('NonRenderError', () => {
  it('logs the error and shows no fallback UI', async () => {
    const logSpy = jest.spyOn(Logger.getInstance(), 'error');
    const nonRenderError = new NonRenderError('background sync failed');
    const ThrowingComponent = makeThrowingComponent(nonRenderError);

    const { queryByText } = await render(
      <OptiCoreErrorBoundary>
        <ThrowingComponent />
      </OptiCoreErrorBoundary>
    );

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('NonRenderError'),
        nonRenderError
      );
    });

    expect(queryByText('Try Again')).toBeNull();
    expect(queryByText('Something went wrong')).toBeNull();
  });
});

// child throws unclassified Error → ErrorClassifier.classify() called
describe('Unclassified Error', () => {
  it('calls ErrorClassifier.classify() and shows fallback for unknown errors', async () => {
    const classifySpy = jest.spyOn(ErrorClassifier, 'classify');
    const unknownError = new Error('Some unknown error');
    const ThrowingComponent = makeThrowingComponent(unknownError);

    await render(
      <OptiCoreErrorBoundary>
        <ThrowingComponent />
      </OptiCoreErrorBoundary>
    );

    expect(classifySpy).toHaveBeenCalledWith(unknownError);
  });
});

// custom fallback prop receives error + resetError function
describe('custom fallback', () => {
  it('receives the RenderError and a resetError callback', async () => {
    const renderError = new RenderError('internal', 'User-facing message');
    const ThrowingComponent = makeThrowingComponent(renderError);
    let capturedError: RenderError | null = null;
    let capturedReset: (() => void) | null = null;

    const customFallback = (error: RenderError, resetError: () => void) => {
      capturedError = error;
      capturedReset = resetError;
      return <Text>Custom: {error.userMessage}</Text>;
    };

    const { getByText } = await render(
      <OptiCoreErrorBoundary fallback={customFallback}>
        <ThrowingComponent />
      </OptiCoreErrorBoundary>
    );

    expect(getByText('Custom: User-facing message')).toBeTruthy();
    expect(capturedError).toBe(renderError);
    expect(typeof capturedReset).toBe('function');
  });
});

// resetError() clears error state and re-renders children
describe('resetError()', () => {
  it('clears error state and re-renders children', async () => {
    const renderError = new RenderError('internal', 'Oops!');
    let renderCount = 0;

    function CountingComponent() {
      if (renderCount === 0) {
        renderCount++;
        throw renderError;
      }
      return <Text>Children back</Text>;
    }

    const { getByText, queryByText } = await render(
      <OptiCoreErrorBoundary>
        <CountingComponent />
      </OptiCoreErrorBoundary>
    );

    expect(getByText('Try Again')).toBeTruthy();

    fireEvent.press(getByText('Try Again'));

    await waitFor(() => {
      expect(getByText('Children back')).toBeTruthy();
    });
    expect(queryByText('Try Again')).toBeNull();
  });
});

// onError callback called for any caught error
describe('onError prop', () => {
  it('calls onError callback when a RenderError is caught', async () => {
    const onError = jest.fn();
    const renderError = new RenderError('internal', 'Oops!');
    const ThrowingComponent = makeThrowingComponent(renderError);

    await render(
      <OptiCoreErrorBoundary onError={onError}>
        <ThrowingComponent />
      </OptiCoreErrorBoundary>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(renderError);
    });
  });

  it('calls onError callback when a NonRenderError is caught', async () => {
    const onError = jest.fn();
    const nonRenderError = new NonRenderError('background fail');
    const ThrowingComponent = makeThrowingComponent(nonRenderError);

    await render(
      <OptiCoreErrorBoundary onError={onError}>
        <ThrowingComponent />
      </OptiCoreErrorBoundary>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(nonRenderError);
    });
  });
});
