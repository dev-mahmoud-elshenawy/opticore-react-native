import axios, { AxiosError } from 'axios';
import { ApiError } from '../ApiError';

// Type guard for Axios errors
function isAxiosError(err: unknown): err is AxiosError {
  return typeof err === 'object' && err !== null && 'isAxiosError' in err;
}

export class ErrorInterceptor {
  constructor() {}

  public onError(error: unknown): Promise<unknown> {
    // Pass cancellations through unchanged — they are intentional (useEffect cleanup,
    // AbortController, etc.) and must NOT be wrapped in ApiError or shown to users.
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (!isAxiosError(error)) {
      // Non-Axios error
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Promise.reject(new ApiError(-1, message, undefined, null, error));
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx

      const { status, data } = error.response;

      const url = error.config?.url;

      const message =
        ((data as Record<string, unknown>)?.message as string) || error.message || 'API Error';

      return Promise.reject(new ApiError(status, message, url, data, error));
    } else if (error.request) {
      // The request was made but no response was received — network error or timeout.
      // Use error.code (ECONNABORTED) for reliable timeout detection instead of
      // string-matching the message (which varies across axios versions and locales).
      const message = error.message || 'Network Error';
      const isTimeout = error.code === 'ECONNABORTED';
      const status = isTimeout ? 408 : 0;

      const url = error.config?.url;

      return Promise.reject(new ApiError(status, message, url, null, error));
    } else {
      // Something happened in setting up the request that triggered an Error

      return Promise.reject(new ApiError(-1, error.message, undefined, null, error));
    }
  }
}
