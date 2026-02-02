import { ErrorType } from './ErrorType';

export interface SerializedError {
    code: string;
    message: string;
    name: string;
    stack?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
    cause?: SerializedError;
    [key: string]: unknown;
}

/**
 * Abstract base class for all application errors.
 * Provides standard properties like code, metadata, and serialization.
 */
export abstract class BaseError extends Error {
    public readonly code: string;
    public readonly timestamp: Date;
    public readonly metadata: Record<string, unknown> = {};
    public readonly cause?: Error;
    public abstract readonly maxErrorType: ErrorType; // Renamed to avoid collision with potential 'type' property

    constructor(message: string, code: string = 'UNKNOWN_ERROR', cause?: Error) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.timestamp = new Date();
        this.cause = cause;

        // Maintain prototype chain for instanceof checks
        Object.setPrototypeOf(this, new.target.prototype);

        // Capture stack trace if available
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Get the original error that caused this error
     */
    public getCause(): Error | undefined {
        return this.cause;
    }

    /**
     * Add context metadata to the error
     */
    public addMetadata(key: string, value: unknown): this {
        this.metadata[key] = value;
        return this;
    }

    /**
     * Serialize the error to a JSON-compatible object
     */
    public toJSON(): SerializedError {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            stack: this.stack,
            timestamp: this.timestamp.toISOString(),
            metadata: this.metadata,
            cause: this.cause instanceof BaseError ? this.cause.toJSON() :
                this.cause instanceof Error ? {
                    name: this.cause.name,
                    message: this.cause.message,
                    code: 'INTERNAL',
                    timestamp: new Date().toISOString()
                } : undefined
        };
    }
}
