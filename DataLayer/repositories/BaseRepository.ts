/* File: DataLayer/repositories/BaseRepository.ts */
import type { Table, UpdateSpec } from 'dexie'

/**
 * Generic CRUD helper around a Dexie Table.
 * Extend this class for entity‑specific repositories.
 */
export class BaseRepository<T extends { id?: number }> {
    protected table: Table<T, number>

    constructor(table: Table<T, number>) {
        this.table = table
    }

    /** Create → returns autogenerated id */
    async add(entity: Omit<T, 'id'>): Promise<number> {
        return this.table.add(entity as T)
    }

    /** Read single record by id */
    async get(id: number): Promise<T | undefined> {
        return this.table.get(id)
    }

    /** Read all records */
    async getAll(): Promise<T[]> {
        return this.table.toArray()
    }

    /** Update → returns # rows modified (0 or 1) */
    async update(id: number, changes: UpdateSpec<T>): Promise<number> {
        return this.table.update(id, changes)
    }

    /** Delete record */
    async delete(id: number): Promise<void> {
        await this.table.delete(id)
    }
}