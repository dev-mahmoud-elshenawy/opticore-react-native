/**
 * Custom error class for API failures
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public url?: string,
        public responseData?: any,
        public originalError?: any
    ) {
        super(message);
        this.name = 'ApiError';
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    /**
     * Check if error is a network connectivity error
     */
    get isNetworkError(): boolean {
        return this.statusCode === 0 || this.message.includes('Network Error');
    }

    /**
     * Check if error is a timeout
     */
    get isTimeout(): boolean {
        return this.message.includes('timeout') || this.statusCode === 408;
    }

    /**
     * Check if error is an authentication error (401)
     */
    get isUnauthenticated(): boolean {
        return this.statusCode === 401;
    }

    /**
     * Check if error is a server error (5xx)
     */
    get isServerError(): boolean {
        return this.statusCode >= 500;
    }
}
