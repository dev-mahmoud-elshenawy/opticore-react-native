import React from 'react';
import { ErrorClassifier } from './ErrorClassifier';
import { ErrorType } from './ErrorType';
import { RenderError } from './RenderError';
import { NonRenderError } from './NonRenderError';
import { DefaultErrorFallback } from './DefaultErrorFallback';
import { Logger } from '../infrastructure/logger/Logger';

interface ErrorBoundaryState {
  hasError: boolean;
  showFallback: boolean;
  renderError: RenderError | null;
  errorType: ErrorType;
  rawError: unknown;
}

const INITIAL_STATE: ErrorBoundaryState = {
  hasError: false,
  showFallback: false,
  renderError: null,
  errorType: ErrorType.NONE,
  rawError: null,
};

export interface OptiCoreErrorBoundaryProps {
  children: React.ReactNode;
  /**
   * Custom fallback rendered when a RenderError is caught.
   * Receives the classified error and a function to reset the boundary.
   */
  fallback?: (error: RenderError, resetError: () => void) => React.ReactNode;
  /**
   * Called for every error caught by this boundary (before fallback render).
   */
  onError?: (error: unknown) => void;
}

/**
 * React Error Boundary that integrates with OptiCore's error classification system.
 *
 * - **RenderError**: shows fallback UI (custom or DefaultErrorFallback).
 * - **NonRenderError**: logs via Logger, re-renders children without fallback.
 * - **Unknown errors**: classified by ErrorClassifier, then handled accordingly.
 */
export class OptiCoreErrorBoundary extends React.Component<
  OptiCoreErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: OptiCoreErrorBoundaryProps) {
    super(props);
    this.state = INITIAL_STATE;
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    // Any error that reaches a React error boundary came from the render path,
    // so it MUST resolve to a fallback. Never re-render the throwing children
    // silently — that re-throws and loops. errorType is computed for telemetry
    // only; it no longer changes whether the fallback is shown.

    // Already a typed RenderError — use it directly.
    if (error instanceof RenderError) {
      return {
        hasError: true,
        showFallback: true,
        renderError: error,
        errorType: ErrorType.RENDER,
        rawError: error,
      };
    }

    // Classify for telemetry; a NonRenderError reaching render is misuse but
    // must still converge to a fallback rather than loop.
    const errorType =
      error instanceof NonRenderError ? ErrorType.NON_RENDER : ErrorClassifier.classify(error);

    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
    const renderError = new RenderError(message, undefined, {
      cause: error instanceof Error ? error : undefined,
    });

    return {
      hasError: true,
      showFallback: true,
      renderError,
      errorType,
      rawError: error,
    };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo): void {
    // Notify consumer for any caught error
    this.props.onError?.(error);

    // Log render-path errors classified as NON_RENDER for monitoring. The
    // fallback is still shown (see getDerivedStateFromError). Logging is wrapped
    // so an unconfigured/failing Logger can never throw inside the boundary while
    // it is already handling an error.
    if (this.state.errorType === ErrorType.NON_RENDER) {
      try {
        Logger.getInstance().error('NonRenderError caught by OptiCoreErrorBoundary', error);
      } catch {
        // Intentionally swallowed: a logging failure must not crash the boundary.
      }
    }
  }

  resetError(): void {
    this.setState(INITIAL_STATE);
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.showFallback && this.state.renderError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.renderError, this.resetError);
      }
      return (
        <DefaultErrorFallback
          error={this.state.renderError}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}
