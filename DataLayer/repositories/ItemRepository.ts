/* File: DataLayer/repositories/ItemRepository.ts */
import { db } from '../db'
import type { IItem } from '../types'
import { BaseRepository } from './BaseRepository'

export class ItemRepository extends BaseRepository<IItem> {
    constructor() {
        super(db.items)
    }


    /** Fetch items that belong to an invoice */
    async getByInvoice(invoiceId: number): Promise<IItem[]> {
        return this.table.where('id').equals(invoiceId).toArray()
    }
}

export const itemRepo = new ItemRepository()
