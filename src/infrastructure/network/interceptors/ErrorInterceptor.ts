
import { ApiError } from '../ApiError';

export class ErrorInterceptor {
    constructor() { }

    public onError(error: any): Promise<any> {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const { status, data } = error.response;
            const url = error.config?.url;
            const message = data?.message || error.message || 'API Error';

            return Promise.reject(new ApiError(status, message, url, data, error));
        } else if (error.request) {
            // The request was made but no response was received
            // Network Error or Timeout
            const message = error.message || 'Network Error';
            const isTimeout = message.includes('timeout');
            const status = isTimeout ? 408 : 0;

            return Promise.reject(new ApiError(status, message, error.config?.url, null, error));
        } else {
            // Something happened in setting up the request that triggered an Error
            return Promise.reject(new ApiError(-1, error.message, undefined, null, error));
        }
    }
}
