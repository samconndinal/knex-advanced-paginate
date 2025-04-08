import { type Knex } from 'knex'

/**
 * Calculate pagination metadata
 */
const getPagination = (
  total: number,
  page: number,
  limit: number
) => {
  const lastPage = Math.ceil(total / limit)
  return {
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < lastPage ? page + 1 : null,
    perPage: limit,
    currentPage: page,
    totalPages: lastPage
  }
}

/**
 * Options for joining tables in pagination queries
 */
export interface JoinOptions {
  table: string
  on: Record<string, string>
  type?: 'inner' | 'left' | 'right' | 'full'
  alias?: string
}

/**
 * Configuration options for pagination
 */
export interface PaginateOptions {
  page: number
  limit: number
  columns: string[]
  table: string
  queryBuilder?: Knex
  where?: Record<string, any>
  orderBy?: {
    column: string
    direction?: 'asc' | 'desc'
  }
  joins?: JoinOptions[]
  countColumn?: string
  search?: {
    term: string
    columns: string[]
    operator?: 'AND' | 'OR'
  }
}

/**
 * Result structure for paginated queries
 */
export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    prevPage: number | null
    nextPage: number | null
    perPage: number
    currentPage: number
    totalPages: number
  }
}

/**
 * Paginate database queries with advanced filtering and search capabilities
 * 
 * @param options - Pagination configuration options
 * @returns Paginated results with metadata
 */
export async function paginateQuery<T> ({
  page,
  limit,
  columns,
  table,
  queryBuilder,
  where = {},
  orderBy,
  joins = [],
  countColumn = `${table}.id`,
  search
}: PaginateOptions): Promise<PaginatedResult<T>> {
  const offset = (page - 1) * limit
  
  const knex = queryBuilder as Knex

  if (!knex) {
    throw new Error('QueryBuilder is required. Pass it via the queryBuilder option.')
  }

  const baseQuery = knex(table)
    .where(where)
    .modify(qb => {
      joins.forEach(join => {
        const joinMethod:
        'innerJoin'
        | 'leftJoin'
        | 'rightJoin' = (join.type ?? 'inner') + 'Join' as 'innerJoin' | 'leftJoin' | 'rightJoin'
        const targetTable = join.alias ? `${join.table} as ${join.alias}` : join.table
        qb[joinMethod](targetTable, function () {
          Object.entries(join.on).forEach(([key, value]) => {
            this.on(key, '=', value)
          })
        })
      })

      if (search?.term && search.columns.length > 0) {
        const searchTerm = `%${search.term}%`
        const operator = search.operator ?? 'OR'

        qb.where(function () {
          search.columns.forEach((column, index) => {
            if (index === 0) this.where(column, 'ILIKE', searchTerm)
            if (operator === 'OR') this.orWhere(column, 'ILIKE', searchTerm)
            this.andWhere(column, 'ILIKE', searchTerm)
          })
        })
      }
    })

  const [items, [{ count }]] = await Promise.all([
    baseQuery
      .clone()
      .select(columns)
      .limit(limit)
      .offset(offset)
      .modify(qb => {
        if (orderBy) {
          qb.orderBy(orderBy.column, orderBy.direction ?? 'asc')
        }
      }),

    baseQuery
      .clone()
      .count(`${countColumn} as count`)
  ])

  const pagination = getPagination(Number(count), page, limit)

  return {
    data: items as T[],
    pagination
  }
}

export const paginate = paginateQuery