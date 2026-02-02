export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, unknown>;
  config: unknown;
}
