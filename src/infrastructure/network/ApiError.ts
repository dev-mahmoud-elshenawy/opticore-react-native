export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public url?: string,
    public data?: unknown,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
