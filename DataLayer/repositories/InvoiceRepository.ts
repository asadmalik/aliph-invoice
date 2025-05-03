/* File: DataLayer\repositories\InvoiceRepository.ts */
import { db } from '../db'
import type { IInvoice, IInvoiceItem, InvoiceHeader } from '../types'
import { BaseRepository } from './BaseRepository'

export class InvoiceRepository extends BaseRepository<InvoiceHeader> {
    constructor() {
        super(db.invoices)  // table is header‑only
    }

    /*───────────────────────────────────────────────────────────
    Create invoice + line‑items in one Dexie transaction
    Returns new invoice ID
  ───────────────────────────────────────────────────────────*/
    async addWithItems(invoice: IInvoice): Promise<number> {
        const plain = structuredClone(invoice)         // strip proxies
        const { items, ...header } = plain

        // make sure header has no id (auto‑inc) and each row gets a fresh PK
        delete header.id
        items?.forEach(r => delete r.id)

        return db.transaction('rw', db.invoices, db.invoiceItems, async () => {
            const id = await db.invoices.add(header)     // header only

            if (items?.length) {
                const rows: IInvoiceItem[] =
                    items.map(r => ({ ...r, invoiceId: id })) // fk + fresh pk
                await db.invoiceItems.bulkAdd(rows)
            }
            return id
        })
    }

    /*───────────────────────────────────────────────────────────
      Generate next invoiceNumber:  MMYY‑####  (05‑25‑0001 ⇒ 0525‑0001)
    ───────────────────────────────────────────────────────────*/
    async getNextNumber(): Promise<string> {
        const now = new Date()
        const mm = String(now.getMonth() + 1).padStart(2, '0')   // 01‑12
        const yy = String(now.getFullYear() % 100).padStart(2, '0')
        const prefix = `${mm}${yy}`                                 // e.g. 0525

        const last = await db.invoices
            .where('invoiceNumber')               // index not required, small set
            .startsWith(`${prefix}-`)
            .reverse()                            // newest first
            .sortBy('invoiceNumber')

        const lastNumber = last[0]?.invoiceNumber
        const lastCounter = lastNumber
            ? Number(lastNumber.split('-')[1])
            : 0

        const counter = String(lastCounter + 1).padStart(4, '0')
        return `${prefix}-${counter}`           // 0525‑0002
    }

    /** fetch header + items */
    async getFull(id: number): Promise<IInvoice | undefined> {
        const header = await db.invoices.get(id)
        if (!header) return
        const items = await db.invoiceItems.where('invoiceId').equals(id).toArray()
        return { ...header, items }
    }

    /** customer filter remains unchanged */
    async getByCustomer(customerId: number) {
        return this.table.where('customerId').equals(customerId).toArray()
    }
}

export const invoiceRepo = new InvoiceRepository()
