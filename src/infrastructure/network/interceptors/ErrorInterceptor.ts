import { ApiError } from '../ApiError';

export class ErrorInterceptor {
  constructor() {}

  public onError(error: any): Promise<any> {
    // eslint-disable-line @typescript-eslint/no-explicit-any

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx

      const { status, data } = error.response;

      const url = error.config?.url as string | undefined;

      const message = (data?.message as string) || (error.message as string) || 'API Error';

      return Promise.reject(new ApiError(status, message, url, data, error));
    } else if (error.request) {
      // The request was made but no response was received
      // Network Error or Timeout

      const message = (error.message as string) || 'Network Error';
      const isTimeout = message.includes('timeout');
      const status = isTimeout ? 408 : 0;

      const url = error.config?.url as string | undefined;

      return Promise.reject(new ApiError(status, message, url, null, error));
    } else {
      // Something happened in setting up the request that triggered an Error

      return Promise.reject(new ApiError(-1, error.message as string, undefined, null, error));
    }
  }
}
