import { CoreConfig } from './types';

export class ConfigValidator {
  /**
   * Validate the provided configuration object.
   * Throws explicit errors if configuration is invalid.
   * @param config The configuration to validate
   */
  public static validate(config: CoreConfig): void {
    if (!config) {
      throw new Error('Configuration object is required');
    }

    // Validate API Config
    if (!config.api) {
      throw new Error('API configuration is required');
    }

    if (!config.api.baseURL) {
      throw new Error('API baseURL is required');
    }

    if (!this.isValidUrl(config.api.baseURL)) {
      throw new Error(`Invalid API baseURL: ${config.api.baseURL}`);
    }

    // Validate Logger Config (optional)
    if (config.logger) {
      // Level is optional but if present typically valid by type system
      // We could runtime validate enum values if needed but TypeScript handles most
    }
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (_err) {
      return false;
    }
  }
}
