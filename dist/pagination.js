"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = exports.paginateQuery = void 0;
/**
 * Calculate pagination metadata
 */
const getPagination = (total, page, limit) => {
    const lastPage = Math.ceil(total / limit);
    return {
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < lastPage ? page + 1 : null,
        perPage: limit,
        currentPage: page,
        totalPages: lastPage
    };
};
/**
 * Paginate database queries with advanced filtering and search capabilities
 *
 * @param options - Pagination configuration options
 * @returns Paginated results with metadata
 */
async function paginateQuery({ page, limit, columns, table, queryBuilder, where = {}, orderBy, joins = [], countColumn = `${table}.id`, search }) {
    const offset = (page - 1) * limit;
    const knex = queryBuilder;
    if (!knex) {
        throw new Error('QueryBuilder is required. Pass it via the queryBuilder option.');
    }
    const baseQuery = knex(table)
        .where(where)
        .modify(qb => {
        var _a;
        joins.forEach(join => {
            var _a;
            const joinMethod = ((_a = join.type) !== null && _a !== void 0 ? _a : 'inner') + 'Join';
            const targetTable = join.alias ? `${join.table} as ${join.alias}` : join.table;
            qb[joinMethod](targetTable, function () {
                Object.entries(join.on).forEach(([key, value]) => {
                    this.on(key, '=', value);
                });
            });
        });
        if ((search === null || search === void 0 ? void 0 : search.term) && search.columns.length > 0) {
            const searchTerm = `%${search.term}%`;
            const operator = (_a = search.operator) !== null && _a !== void 0 ? _a : 'OR';
            qb.where(function () {
                search.columns.forEach((column, index) => {
                    if (index === 0)
                        this.where(column, 'ILIKE', searchTerm);
                    if (operator === 'OR')
                        this.orWhere(column, 'ILIKE', searchTerm);
                    this.andWhere(column, 'ILIKE', searchTerm);
                });
            });
        }
    });
    const [items, [{ count }]] = await Promise.all([
        baseQuery
            .clone()
            .select(columns)
            .limit(limit)
            .offset(offset)
            .modify(qb => {
            var _a;
            if (orderBy) {
                qb.orderBy(orderBy.column, (_a = orderBy.direction) !== null && _a !== void 0 ? _a : 'asc');
            }
        }),
        baseQuery
            .clone()
            .count(`${countColumn} as count`)
    ]);
    const pagination = getPagination(Number(count), page, limit);
    return {
        data: items,
        pagination
    };
}
exports.paginateQuery = paginateQuery;
exports.paginate = paginateQuery;
