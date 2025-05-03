/* File: DataLayer/db.ts */
import type { Table } from 'dexie';
import Dexie from 'dexie';
import type { ICustomer, IInvoice, IInvoiceItem, IItem, ITaxItem } from './types'; // or individual interfaces

class AliphInvoiceDB extends Dexie {
    public customers!: Table<ICustomer, number>
    public invoices!: Table<IInvoice, number>
    public items!: Table<IItem, number>
    public taxItems!: Table<ITaxItem, number>
    public invoiceItems!: Table<IInvoiceItem, number>

    constructor() {
        super('aliph_invoice')
        this.version(2).stores({
            customers: '++id,name,phone,email,address,companyName,currency',
            invoices: '++id,customerId,invoiceNumber,invoiceDate,dueDate',
            invoiceItems: '++id,invoiceId,item,qty,rate,tax,amount',   // new!
            items: '++id,name,unitType,rate',                   // product catalogue
            taxItems: '++id,name,rate'
        })
    }
}

export const db = new AliphInvoiceDB()
