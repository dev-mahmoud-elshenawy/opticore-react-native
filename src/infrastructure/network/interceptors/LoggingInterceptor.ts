import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '../../logger/Logger';

// Type guard for Axios errors
function isAxiosError(err: unknown): err is AxiosError {
  return typeof err === 'object' && err !== null && 'isAxiosError' in err;
}

export class LoggingInterceptor {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  private fullUrl(baseURL: string | undefined, url: string | undefined): string {
    const path = url || '';
    if (path.startsWith('http')) return path;
    return `${baseURL || ''}${path}`;
  }

  public onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = this.fullUrl(config.baseURL, config.url);
    this.logger.info(`Request: ${method} ${url}`, config.headers);
    return config;
  }

  public onResponse(response: AxiosResponse): AxiosResponse {
    const status = response.status;
    const url = this.fullUrl(response.config?.baseURL, response.config?.url);
    this.logger.info(`Response: ${status} ${url}`);
    return response;
  }

  public onError(error: unknown): Promise<unknown> {
    const message = isAxiosError(error) ? error.message : 'Unknown Error';
    const url = isAxiosError(error)
      ? this.fullUrl(error.config?.baseURL, error.config?.url)
      : '';

    this.logger.error(`Error: ${message} (${url})`);
    return Promise.reject(error);
  }
}
