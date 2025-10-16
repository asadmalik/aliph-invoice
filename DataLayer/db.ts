import type { Table } from 'dexie'
import Dexie from 'dexie'
import type {
    ICustomer,
    IDocType,
    IHsCode,
    IInvoice, IInvoiceItem, IItem,
    IProvince,
    ISroItem,
    ITaxItem,
    ITransactionType,
    IUom
} from './types'

/* ============================================================
   Dexie v3 – aligned with new DI fields & reference tables
   ============================================================ */

class AliphInvoiceDB extends Dexie {
    /* ---------- Masters & Tx tables --------------------------- */
    customers!: Table<ICustomer, number>
    items!: Table<IItem, number>
    taxItems!: Table<ITaxItem, number>

    invoices!: Table<IInvoice, number>          // header only
    invoiceItems!: Table<IInvoiceItem, number>

    /* ---------- Reference caches (daily refresh) -------------- */
    ref_province!: Table<IProvince, string>
    ref_uom!: Table<IUom, string>
    ref_hs_code!: Table<IHsCode, string>
    ref_doc_type!: Table<IDocType, number>
    ref_transaction_type!: Table<ITransactionType, number>
    ref_sro_item!: Table<ISroItem, [string, string]> // [scheduleNo, serialNo]

    constructor() {
        super('aliph_invoice_db')

        /* version(3) introduces:
           – new columns on existing tables
           – six brand-new reference tables                             */
        this.version(4).stores({
            /* CUSTOMER
               +provinceCode, +ntnCnic                                                       */
            customers: '++id,name,provinceCode,ntnCnic,email,phone',

            /* ITEM CATALOGUE
               +hsCode +uomCode for DI                                                       */
            items: '++id,name,hsCode,uomCode,unitType,rate',

            /* TAX ITEMS – unchanged                                                         */
            taxItems: '++id,name,rate',

            /* INVOICE HEADER
               New columns: status, scenarioId, documentTypeId, transactionTypeId,
               sellerProvinceCode, buyerProvinceCode, fbrInvoiceNumber                      */
            invoices:
                '++id,invoiceNumber,invoiceDate,dueDate,customerId,' +
                'status,scenarioId,documentTypeId,transactionTypeId,' +
                'sellerProvinceCode,buyerProvinceCode,fbrInvoiceNumber',

            /* INVOICE LINE-ITEMS
               Added DI fields: hsCode,uomCode,sroScheduleNo,sroItemSerialNo                */
            invoiceItems:
                '++id,invoiceId,hsCode,uomCode,sroScheduleNo,sroItemSerialNo',

            /* ------------ Reference look-ups ----------------------- */
            ref_province: '++id, provinceId',                 // & = primary key (string)
            ref_uom: '++id, uomId',
            ref_hs_code: '&hsCode',
            ref_doc_type: '++id',
            ref_transaction_type: '++id',
            ref_sro_item: '[sroScheduleNo+sroItemSerialNo]',   // compound PK
        })
    }
}

export const db = new AliphInvoiceDB()
