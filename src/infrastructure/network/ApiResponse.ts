/**
 * Standard API Response structure
 */
export interface ApiResponse<T = any> {
    data: T;
    status: number;
    headers: Record<string, any>;
    config?: any;
}
