# Knex Advanced Paginate

A powerful and flexible pagination utility for Knex.js with advanced filtering and search capabilities.

## Installation

```bash
npm install knex-advanced-paginate
```

## Features

- Type-safe pagination with TypeScript support
- Advanced filtering with where conditions
- Table joins support (inner, left, right)
- Flexible column selection
- Sorting capabilities
- Search functionality with multiple columns
- Complete pagination metadata

## Usage

```typescript
import { paginateQuery } from 'knex-advanced-paginate';
import { knex } from 'knex';

const db = knex({
  // your knex configuration
});

async function getUsers(page: number, limit: number, searchTerm?: string) {
  return await paginateQuery({
    page,
    limit,
    columns: [
      'users.id',
      'users.name',
      'users.email',
      'departments.name as department'
    ],
    table: 'users',
    queryBuilder: db,
    where: { 'users.is_active': true },
    orderBy: {
      column: 'users.created_at',
      direction: 'desc'
    },
    joins: [
      {
        table: 'departments',
        type: 'left',
        on: {
          'users.department_id': 'departments.id'
        }
      }
    ],
    search: searchTerm ? {
      term: searchTerm,
      columns: ['users.name', 'users.email'],
      operator: 'OR'
    } : undefined
  });
}

// Result format:
// {
//   data: [ ... array of user objects ... ],
//   pagination: {
//     prevPage: 1,
//     nextPage: 3,
//     perPage: 10,
//     currentPage: 2,
//     totalPages: 5
//   }
// }
```

## API Reference

### paginateQuery Options

| Option | Type | Description |
|--------|------|-------------|
| page | number | Current page number |
| limit | number | Number of items per page |
| columns | string[] | Columns to select |
| table | string | Table to query |
| queryBuilder | Knex | Knex instance |
| where | Record<string, any> | Where conditions |
| orderBy | { column: string; direction?: 'asc' \| 'desc' } | Column and direction to order by |
| joins | JoinOptions[] | Tables to join |
| countColumn | string | Column to count for pagination (default: `${table}.id`) |
| search | { term: string; columns: string[]; operator?: 'AND' \| 'OR' } | Search configuration |

## License

MIT