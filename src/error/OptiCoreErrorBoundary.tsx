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
    // 1. Already a typed RenderError
    if (error instanceof RenderError) {
      return {
        hasError: true,
        showFallback: true,
        renderError: error,
        errorType: ErrorType.RENDER,
        rawError: error,
      };
    }

    // 2. Already a typed NonRenderError — don't show fallback
    if (error instanceof NonRenderError) {
      return {
        hasError: true,
        showFallback: false,
        renderError: null,
        errorType: ErrorType.NON_RENDER,
        rawError: error,
      };
    }

    // 3. Unclassified error — use ErrorClassifier
    const errorType = ErrorClassifier.classify(error);

    if (errorType === ErrorType.NON_RENDER) {
      return {
        hasError: true,
        showFallback: false,
        renderError: null,
        errorType: ErrorType.NON_RENDER,
        rawError: error,
      };
    }

    // For RENDER or NONE (unknown) — show fallback
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

    // Log NonRenderErrors silently — no fallback UI shown
    if (this.state.errorType === ErrorType.NON_RENDER) {
      Logger.getInstance().error('NonRenderError caught by OptiCoreErrorBoundary', error);
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
