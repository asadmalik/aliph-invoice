/* File: DataLayer/db.ts */
import type { Table } from 'dexie';
import Dexie from 'dexie'
import type { ICustomer, IInvoice, IItem, ITaxItem } from './types' // or individual interfaces

class AliphInvoiceDB extends Dexie {
    public customers!: Table<ICustomer, number>
    public invoices!: Table<IInvoice, number>
    public items!: Table<IItem, number>
    public taxItems!: Table<ITaxItem, number>

    constructor() {
        super('aliph_invoice')
        this.version(1).stores({
            customers: '++id,name,phone,email,address,companyName,currency',
            invoices: '++id,customerId,invoiceNumber,invoiceDate,dueDate',
            items: '++id,invoiceId,name,unitType,tax,taxName',
            taxItems: '++id,name,rate'
        })
    }
}

export const db = new AliphInvoiceDB()
