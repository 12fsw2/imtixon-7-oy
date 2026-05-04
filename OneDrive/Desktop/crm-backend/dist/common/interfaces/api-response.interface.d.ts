export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    statusCode: number;
}
export declare function createPaginatedResponse<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T>;
export declare function createApiResponse<T>(message: string, data?: T, statusCode?: number): ApiResponse<T>;
