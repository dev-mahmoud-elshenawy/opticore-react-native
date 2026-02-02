import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '../../logger/Logger';

export class LoggingInterceptor {
    private logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
    }

    public onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        const method = config.method?.toUpperCase() || 'UNKNOWN';
        const url = config.url || '';
        this.logger.info(`Request: ${method} ${url}`, config.headers);
        return config;
    }

    public onResponse(response: AxiosResponse): AxiosResponse {
        const status = response.status;
        const url = response.config?.url || '';
        this.logger.info(`Response: ${status} ${url}`);
        return response;
    }

    public onError(error: any): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
        const message = error.message || 'Unknown Error'; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
        const url = error.config?.url || ''; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
        this.logger.error(`Error: ${message} (${url})`, error);
        return Promise.reject(error);
    }
}
