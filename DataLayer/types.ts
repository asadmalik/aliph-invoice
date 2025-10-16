/* ============================================================
   PRAL Digital-Invoicing aligned domain types
   ------------------------------------------------------------
   – Comments start with ①②③… to explain the DI mapping.
   – All optional FK fields end in “Id”.
   – When a DI field is required only in the final JSON
     (not during data entry) it is marked ** AUTO **
   ============================================================ */

/* ---------- Reference look-ups (raw API shapes) ---------- */

/** from GET /pdi/v1/provinces */
export interface IProvince {
    /** ① Two-digit PRAL code e.g. "01" = Punjab */
    provinceId: string
    /** Full name shown in dropdown */
    provinceName: string
}

/** from GET /pdi/v1/doctypecode */
export interface IDocType {
    /** e.g. 4 = Sale Invoice */
    docTypeId: number
    description: string
}

/** from GET /pdi/v1/transtypecode */
export interface ITransactionType {
    transaction_TYPE_ID: number
    transaction_DESC: string
}

/** from GET /pdi/v1/uom */
export interface IUom {
    /** e.g. "KG" */
    uomCode: string
    description: string
}

/** from GET /pdi/v1/itemdesccode */
export interface IHsCode {
    /** 8- or 10-digit HS code */
    hsCode: string
    itemDescription: string
}

/** from GET /pdi/v1/sroitemcode */
export interface ISroItem {
    /** Top-level SRO schedule number */
    sroScheduleNo: string
    /** Serial / row number inside the schedule */
    sroItemSerialNo: string
    /** HS code covered by this row */
    hsCode: string
    rate: number
}

/* ---------- Master data ----------------------------------- */

export interface ICustomer {
    id?: number
    /** Display name */
    name: string
    phone?: string
    email?: string
    address?: string
    companyName?: string
    currency?: string
    registrationType: 'Filer' | 'nonFiler' | 'Exempt' | 'Unregistered' | 'Other' | 'Registered'
    provinceCode?: string
    /** NTN or CNIC (DI requires at least one) */
    ntnCnic?: string
    created_at?: string | null
    created_by?: string | null
    updated_at?: string | null
    updated_by?: string | null
}

export type UnitType = 'Fixed' | 'Hourly' | 'UOM'

// DataLayer/types.ts

/** Master catalog definition for every product/item */
export interface IItem {
    id?: number
    /** Legal or trade name */
    name: string

    /** How this item is billed */
    unitType: UnitType                // “Fixed” | “Hourly” | “UOM”
    rate: number                      // Default unit rate (excl. tax)

    /** Optional catalog metadata */
    description?: string
    location?: string                 // Warehouse or storage

    /** Default tax settings */
    defaultSalesTaxRate?: number      // (0–100%)
    fbrSaleType?: string              // e.g. “Goods at Standard Rate”

    /** DI lookups */
    uomCode?: string
    hsCode?: string

    /** Audit */
    createdAt?: string
    createdBy?: string
    updatedAt?: string | null
    updatedBy?: string | null
}

/** One line on an invoice—references IItem by ID */
export interface IInvoiceItem {
    id?: number
    invoiceId?: number                // FK to IInvoice.id

    /** Which catalog item this line is for */
    itemId: number
    /** Cached display name (optional, for UI) */
    itemName?: string

    quantity: number
    rate: number                       // unit rate excl. tax

    /** Required DI fields per line */
    uomCode: string
    hsCode: string

    /** Any overrides or extras */
    extraTax?: number
    furtherTax?: number
    sroScheduleNo?: string
    sroItemSerialNo?: string

    /** Computed by your DI-prep logic */
    salesTaxRate?: number
    salesTaxApplicable?: number
    salesTaxWithheldAtSource?: number
    fedPayable?: number
    lineDiscount?: number
    valueSalesExcludingST?: number
    totalValues?: number
}


/* ---------- Tax rules (unchanged) --------------------------- */

export interface ITaxItem {
    id?: number
    name: string
    /** Percentage e.g. 17.0 */
    rate: number
}

/* ---------- Invoice composition ----------------------------- */



type ValidationResult = 'draft' | 'validation_success' | 'validation_failure';

export interface IInvoice {
    id?: number

    /* ---------- Relationships ----------------------- */
    /** FK → customer.id (buyer) */
    customerId: number                      //NON DI
    /** Convenience copy for lists */
    customerName?: string                   //DI

    /* ---------- Header fields ----------------------- */
    invoiceNumber: string                   //RETURN DI

    invoiceVoucherType:
    'Sale Invoice' | 'Purchase Invoice' | 'Credit Note' | 'Debit Note' | string | null           // DI- MAP: invoviceType


    invoiceDate: string                     //DI - YYYY-MM-DD 
    terms: string                           //NON DI
    dueDate: string                         //NON DI
    billTo: string                          //NON DI
    currencyCode: string                    //NON DI

    /* ----- Buyer extras (for DI payload) ---------- */
    buyerAddress?: string                   //DI
    buyerNtnCnic?: string                   //DI buyerNTNCNIC
    buyerRegistrationType?: string          //DI
    buyerProvinceCode?: string              //DI buyerProvince   


    /* ---------- DI header extras -------------------- */
    /** Numeric document type – 4 = Sale Invoice */
    documentTypeId: number                  //  DI - Map to: docTypeID
    /** Supply classification from API lookup */
    transactionTypeId: number               //  NON DI
    /** SNO01…SNO28 chosen in UI */
    scenarioId: string                      //  DI - Map to: scenarioId
    /** Derived sale-type string sent to SaleType→Rate */
    saleType?: string         /** AUTO **/



    /** Workflow status */
    status: InvoiceStatus


    /** Returned by /postinvoicedata on success */
    fbrInvoiceNumber?: string

    sellerName?: string
    sellerAddress?: string
    sellerProvinceCode?: string

    /* ---------- Totals & extra ---------------------- */
    items?: IInvoiceItem[]
    notes?: string
    termsAndConditions?: string
    discount?: number
    shipping?: number
    invoiceTotalValue?: number
    validation: any
    meta: {
        dueDate: string;
        currencyCode: string;
        saleType: string;
        status: string;
        notes: string;
        termsAndConditions: string;
        terms: string;
        createdAt: string;
        createdBy: string;
        updatedAt: any;
        updatedBy: any;
    }

}


export type InvoiceStatus = 'draft' | 'validation_success' | 'validation_failure'
/** For repos that only store the header */
export type InvoiceHeader = Omit<IInvoice, 'items'>

/* ----------------------------------------------------------------
 * PRAL Digital-Invoicing API response types
 * ---------------------------------------------------------------- */
export interface IDIValidateResponse {
    statusCode: string
    validationReferenceNo?: string
    errorCode?: string
    errorMessage?: string
}

export interface IDIPostResponse {
    statusCode: string
    invoiceNumber?: string
    postingDate?: string
    errorCode?: string
    errorMessage?: string
}
