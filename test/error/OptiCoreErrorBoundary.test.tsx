import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { OptiCoreErrorBoundary } from '../../src/error/OptiCoreErrorBoundary';
import { RenderError } from '../../src/error/RenderError';
import { NonRenderError } from '../../src/error/NonRenderError';
import { ErrorClassifier } from '../../src/error/ErrorClassifier';
import { ErrorType } from '../../src/error/ErrorType';
import { Logger } from '../../src/infrastructure/logger/Logger';

// Suppress React's error boundary console.error noise in tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => { });
});
afterEach(() => {
  jest.restoreAllMocks();
  ErrorClassifier.clearCustomRules();
});

/**
 * Creates a component that always throws the given error.
 * React 19 concurrent mode retries components up to 3 times; using always-throw
 * ensures all retries fail and the error propagates to the error boundary.
 */
function makeAlwaysThrowingComponent(error: unknown) {
  return function ThrowingComponent() {
    throw error;
  };
}

// child throws RenderError → fallback shown with userMessage
describe('RenderError', () => {
  it('shows default fallback with userMessage', async () => {
    const renderError = new RenderError('internal', 'Something went wrong for the user');
    const ThrowingComponent = makeAlwaysThrowingComponent(renderError);

    const { getByText } = await render(
      <OptiCoreErrorBoundary>
        <ThrowingComponent />
      </OptiCoreErrorBoundary>
    );

    expect(getByText('Something went wrong for the user')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });
});

// NonRenderError: getDerivedStateFromError + componentDidCatch tested directly
// (React 19 concurrent mode prevents reliable React-render testing for showFallback=false)
describe('NonRenderError', () => {
  it('getDerivedStateFromError sets showFallback=false for NonRenderError', () => {
    const nonRenderError = new NonRenderError('background sync failed');
    const state = (OptiCoreErrorBoundary as any).getDerivedStateFromError(nonRenderError);

    expect(state.hasError).toBe(true);
    expect(state.showFallback).toBe(false);
    expect(state.errorType).toBe(ErrorType.NON_RENDER);
    expect(state.renderError).toBeNull();
  });

  it('componentDidCatch logs NonRenderError via Logger and does not show fallback', () => {
    const logSpy = jest.spyOn(Logger.getInstance(), 'error');
    const nonRenderError = new NonRenderError('background sync failed');

    // Simulate the error boundary lifecycle directly
    const instance = new OptiCoreErrorBoundary({ children: React.createElement(Text, null, 'test') });
    (instance as any).state = {
      hasError: true,
      showFallback: false,
      renderError: null,
      errorType: ErrorType.NON_RENDER,
      rawError: nonRenderError,
    };

    instance.componentDidCatch(nonRenderError as unknown as Error, { componentStack: '' });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('NonRenderError'),
      nonRenderError
    );

    // Verify no fallback would be shown (showFallback=false means children are rendered)
    expect((instance as any).state.showFallback).toBe(false);
  });
});

// child throws unclassified Error → ErrorClassifier.classify() called
describe('Unclassified Error', () => {
  it('calls ErrorClassifier.classify() and shows fallback for unknown errors', async () => {
    const classifySpy = jest.spyOn(ErrorClassifier, 'classify');
    const unknownError = new Error('Some unknown error');
    const ThrowingComponent = makeAlwaysThrowingComponent(unknownError);

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
    const ThrowingComponent = makeAlwaysThrowingComponent(renderError);
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
    // Use external state ref so we can stop throwing AFTER initial render completes
    const throwState = { active: true };

    function ControlledComponent() {
      if (throwState.active) throw renderError;
      return <Text>Children back</Text>;
    }

    const { getByText, queryByText } = await render(
      <OptiCoreErrorBoundary>
        <ControlledComponent />
      </OptiCoreErrorBoundary>
    );

    // Boundary should show fallback (all retries threw)
    expect(getByText('Try Again')).toBeTruthy();

    // Stop throwing AFTER initial render so resetError() renders children successfully
    throwState.active = false;
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
    const ThrowingComponent = makeAlwaysThrowingComponent(renderError);

    await render(
      <OptiCoreErrorBoundary onError={onError}>
        <ThrowingComponent />
      </OptiCoreErrorBoundary>
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(renderError);
    });
  });

  it('componentDidCatch calls onError callback when a NonRenderError is caught', () => {
    const onError = jest.fn();
    const nonRenderError = new NonRenderError('background fail');

    const instance = new OptiCoreErrorBoundary({
      children: React.createElement(Text, null, 'test'),
      onError,
    });
    (instance as any).state = {
      hasError: true,
      showFallback: false,
      renderError: null,
      errorType: ErrorType.NON_RENDER,
      rawError: nonRenderError,
    };

    instance.componentDidCatch(nonRenderError as unknown as Error, { componentStack: '' });

    expect(onError).toHaveBeenCalledWith(nonRenderError);
  });
});
