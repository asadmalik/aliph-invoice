/* File: DataLayer/repositories/InvoiceRepository.ts */
import { db } from '../db'
import type { IInvoice } from '../types'
import { BaseRepository } from './BaseRepository'

export class InvoiceRepository extends BaseRepository<IInvoice> {
    constructor() {
        super(db.invoices)
    }

    /** Get all invoices for a given customer */
    async getByCustomer(customerId: number): Promise<IInvoice[]> {
        return this.table.where('customerId').equals(customerId).toArray()
    }
}

export const invoiceRepo = new InvoiceRepository()