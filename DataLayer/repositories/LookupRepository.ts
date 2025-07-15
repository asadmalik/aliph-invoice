/* Generic repo for tables that:
   – aren’t auto-increment
   – don’t have an `id` column
   – mostly need bulkPut + simple reads */
import type { Table } from 'dexie'

export class LookupRepository<T, K> {
    constructor(private table: Table<T, K>) { }

    /** Bulk-insert or update reference rows atomically */
    async bulkUpsert(rows: T[]): Promise<void> {
        await this.table.bulkPut(rows)
    }

    /** Fetch a single reference row by its PK */
    async get(key: K): Promise<T | undefined> {
        return this.table.get(key)
    }

    /** Return the full dropdown list */
    async getAll(): Promise<T[]> {
        return this.table.toArray()
    }
}
