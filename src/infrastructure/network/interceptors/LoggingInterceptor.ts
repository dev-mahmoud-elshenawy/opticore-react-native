import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '../../logger/Logger';

// Type guard for Axios errors
function isAxiosError(err: unknown): err is AxiosError {
  return typeof err === 'object' && err !== null && 'isAxiosError' in err;
}

// Header names that must never be logged (credential/PII leak into transports).
const SENSITIVE_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-api-key', 'x-auth-token'];

export class LoggingInterceptor {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Returns a shallow copy of headers with sensitive values masked.
   * Logging raw headers would ship the injected `Authorization: Bearer …` token
   * to every transport (console + any remote reporter) on every request.
   */
  private redactHeaders(headers: unknown): unknown {
    if (!headers || typeof headers !== 'object') return headers;
    const out: Record<string, unknown> = { ...(headers as Record<string, unknown>) };
    for (const key of Object.keys(out)) {
      if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
        out[key] = '[REDACTED]';
      }
    }
    return out;
  }

  private fullUrl(baseURL: string | undefined, url: string | undefined): string {
    const path = url || '';
    if (path.startsWith('http')) return path;
    return `${baseURL || ''}${path}`;
  }

  public onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = this.fullUrl(config.baseURL, config.url);
    this.logger.info(`Request: ${method} ${url}`, this.redactHeaders(config.headers));
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
    const url = isAxiosError(error) ? this.fullUrl(error.config?.baseURL, error.config?.url) : '';

    this.logger.error(`Error: ${message} (${url})`);
    return Promise.reject(error);
  }
}
