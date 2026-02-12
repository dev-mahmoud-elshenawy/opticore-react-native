import { AxiosRequestConfig, AxiosResponse } from 'axios';

export type InterceptorId = number;

/**
 * Interface for intercepting API requests and responses.
 * Implementations can modify the request/response or handle errors.
 */
export interface Interceptor {
    /**
     * Called before a request is sent.
     * Return the modified config or a promise resolving to it.
     */
    onRequest?(config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig>;

    /**
     * Called when a response is received successfully.
     * Return the modified response or a promise resolving to it.
     */
    onResponse?(response: AxiosResponse): AxiosResponse | Promise<AxiosResponse>;

    /**
     * Called when a request fails or a response error occurs.
     * Return a rejected promise to propagate the error, or resolve to handle it.
     */
    onError?(error: any): any;
}
