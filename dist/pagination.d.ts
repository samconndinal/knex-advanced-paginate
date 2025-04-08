import { type Knex } from 'knex';
/**
 * Options for joining tables in pagination queries
 */
export interface JoinOptions {
    table: string;
    on: Record<string, string>;
    type?: 'inner' | 'left' | 'right' | 'full';
    alias?: string;
}
/**
 * Configuration options for pagination
 */
export interface PaginateOptions {
    page: number;
    limit: number;
    columns: string[];
    table: string;
    queryBuilder?: Knex;
    where?: Record<string, any>;
    orderBy?: {
        column: string;
        direction?: 'asc' | 'desc';
    };
    joins?: JoinOptions[];
    countColumn?: string;
    search?: {
        term: string;
        columns: string[];
        operator?: 'AND' | 'OR';
    };
}
/**
 * Result structure for paginated queries
 */
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        prevPage: number | null;
        nextPage: number | null;
        perPage: number;
        currentPage: number;
        totalPages: number;
    };
}
/**
 * Paginate database queries with advanced filtering and search capabilities
 *
 * @param options - Pagination configuration options
 * @returns Paginated results with metadata
 */
export declare function paginateQuery<T>({ page, limit, columns, table, queryBuilder, where, orderBy, joins, countColumn, search }: PaginateOptions): Promise<PaginatedResult<T>>;
export declare const paginate: typeof paginateQuery;
