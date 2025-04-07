/* File: DataLayer/repositories/TaxItemRepository.ts */
import { db } from '../db'
import type { ITaxItem } from '../types'
import { BaseRepository } from './BaseRepository'

export class TaxItemRepository extends BaseRepository<ITaxItem> {
    constructor() {
        super(db.taxItems)
    }

    /** Retrieve tax item by name */
    async findByName(name: string): Promise<ITaxItem | undefined> {
        return this.table.where('name').equalsIgnoreCase(name).first()
    }
}

export const taxItemRepo = new TaxItemRepository()