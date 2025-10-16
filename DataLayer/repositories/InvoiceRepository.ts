/* File: DataLayer\repositories\InvoiceRepository.ts */
import { db } from '../db';
import type { IInvoice, InvoiceHeader } from '../types';
import { BaseRepository } from './BaseRepository';

export class InvoiceRepository extends BaseRepository<InvoiceHeader> {

    constructor() {
        super(db.invoices)  // table is header‑only
    }



    async addWithItems(invoice: IInvoice): Promise<number | string | undefined> {
        const raw = toRaw(invoice);
        const data = JSON.parse(JSON.stringify(raw)) as IInvoice;
        const { items, id: _, ...header } = data;
        console.log('invoice repo, header:', header, items);

        items?.forEach(r => delete r.id)

        // return the numeric id from the transaction
        return db.transaction('rw', db.invoices, db.invoiceItems, async () => {
            let id: undefined | number | string;
            try {
                id = await db.invoices.add(header)
            } catch (error) {
                console.error('Error adding invoice header:', error);
            }
            
            
            if (items?.length) {
                const rows = items.map(r => ({ ...r, invoiceId: id }))
                await db.invoiceItems.bulkAdd(rows)
            }
            console.log('invoice repo, inv id:', id)

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

    async getInvoiceItems(invoiceId: number): Promise<IInvoice['items']> {
        return db.invoiceItems.where('invoiceId').equals(invoiceId).toArray()
    }

    /** customer filter remains unchanged */
    async getByCustomer(customerId: number) {
        return this.table.where('customerId').equals(customerId).toArray()
    }

    /** Fetch all invoices with their items */
    async getByItemId(itemId: number): Promise<IInvoice[]> {
        const invoices = await this.table.toArray()
        const items = await db.invoiceItems.where('itemId').equals(itemId).toArray()

        return invoices.map(inv => {
            const invItems = items.filter(i => i.invoiceId === inv.id)
            return { ...inv, items: invItems }
        })
    }

    /** Fetch all invoices with their items' hsCode */
    async getByHsCode(hsCode: string): Promise<IInvoice[]> {
        const invoices = await this.table.toArray()
        const items = await db.invoiceItems.where('hsCode').equals(hsCode).toArray()

        return invoices.map(inv => {
            const invItems = items.filter(i => i.invoiceId === inv.id)
            return { ...inv, items: invItems }
        })
    }

    async validateAndPost(invoiceId: number): Promise<void> {
        const invoice = await this.getFull(invoiceId)
        if (!invoice) throw new Error('Invoice not found')

        // Perform validation checks here
        if (invoice.items?.length === 0) {
            throw new Error('Cannot post invoice with no items')
        }

        // Additional validation logic can be added here

        // If all checks pass, mark as posted
        //await db.invoices.update(invoiceId, { posted: true })
    }

    async saveDraft(invoice: IInvoice): Promise<number | string | undefined> {
        const raw = toRaw(invoice);
        const data = JSON.parse(JSON.stringify(raw)) as IInvoice;
        const { items, id: _, ...header } = data;
        console.log('invoice repo, header:', header, items);

        items?.forEach(r => delete r.id)

        // return the numeric id from the transaction
        return db.transaction('rw', db.invoices, db.invoiceItems, async () => {
            let id: undefined | number | string;
            try {
                id = await db.invoices.add(header)
            } catch (error) {
                console.error('Error adding invoice header:', error);
            }


            if (items?.length) {
                const rows = items.map(r => ({ ...r, invoiceId: id }))
                await db.invoiceItems.bulkAdd(rows)
            }
            console.log('invoice repo, inv id:', id)

            return id

        })
    }
}

export const invoiceRepo = new InvoiceRepository()
