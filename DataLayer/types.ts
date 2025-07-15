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

    /** ① Province code – copied to invoice header */
    provinceCode?: string
    /** NTN or CNIC (DI requires at least one) */
    ntnCnic?: string
}

export type UnitType = 'Fixed' | 'Hourly' | 'UOM'

export interface IItem {
    id?: number
    name: string
    /** "Fixed" = lump sum, "Hourly" = time & materials, "UOM" = DI measured */
    unitType: UnitType
    /** Default rate excl. tax */
    rate: number

    /* ---------- DI-specific -------------------------- */
    /** UOM code – pulled from IUom list */
    uomCode?: string
    /** HS code – pulled from IHsCode list */
    hsCode?: string
}

/* ---------- Tax rules (unchanged) --------------------------- */

export interface ITaxItem {
    id?: number
    name: string
    /** Percentage e.g. 17.0 */
    rate: number
}

/* ---------- Invoice composition ----------------------------- */

export interface IInvoiceItem {
    id?: number
    /** FK after save */
    invoiceId?: number

    /** Human text – still useful on UI */
    item: string
    qty: number
    rate: number          // excl. tax
    /** Line-level sales tax amount */
    tax: number
    /** rate * qty + tax */
    amount: number

    /* ----- DI payload extras (computed or selected) ----- */
    /** HS code of the product */
    hsCode?: string
    /** UOM code */
    uomCode?: string
    /** extra / further tax % */
    extraTax?: number
    furtherTax?: number
    /** Only present if product falls under an SRO */
    sroScheduleNo?: string   /** AUTO **/
    sroItemSerialNo?: string /** AUTO **/

    salesTaxRate?: number
    salesTaxApplicable?: number
    salesTaxWithheldAtSource?: number
    fedPayable?: number
    lineDiscount?: number
    valueSalesExcludingST?: number
    totalValues?: number
}

export type InvoiceStatus = 'draft' | 'validated' | 'posted' | 'error'

export interface IInvoice {
    id?: number

    /* ---------- Relationships ----------------------- */
    /** FK → customer.id (buyer) */
    customerId: number
    /** Convenience copy for lists */
    customerName?: string

    /* ---------- Header fields ----------------------- */
    invoiceNumber: string
    invoiceDate: string       // YYYY-MM-DD
    terms: string             // "Due On Receipt" / "Net 15" etc.
    dueDate: string
    billTo: string
    currencyCode: string

    /* ----- Buyer extras (for DI payload) ---------- */
    buyerAddress?: string
    buyerNtnCnic?: string
    buyerRegistrationType?: string

    /* ---------- DI header extras -------------------- */
    /** Numeric document type – 4 = Sale Invoice */
    documentTypeId: number
    /** Supply classification from API lookup */
    transactionTypeId: number
    /** SNO01…SNO28 chosen in UI */
    scenarioId: string
    /** Derived sale-type string sent to SaleType→Rate */
    saleType?: string         /** AUTO **/

    /** Seller & buyer provinces as DI wants them */
    sellerProvinceCode?: string
    buyerProvinceCode?: string

    /** Workflow status */
    status: InvoiceStatus
    /** Returned by /postinvoicedata on success */
    fbrInvoiceNumber?: string

    sellerName: string
    sellerAddress: string


    /* ---------- Totals & extra ---------------------- */
    items: IInvoiceItem[]
    notes?: string
    termsAndConditions?: string
    discount?: number
    shipping?: number
}

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
