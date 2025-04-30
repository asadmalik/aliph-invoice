/* File: DataLayer/types.ts */
export interface ICustomer {
    id?: number
    name: string
    phone?: string
    email?: string
    address?: string
    companyName?: string
    currency?: string
    image?: string
}

export type UnitType = 'Fixed' | 'Hourly'

export interface IItem {
    id?: number
    name: string
    unitType: UnitType
    rate: number
}

export interface ITaxItem {
    id?: number
    name: string
    rate: number
}

export interface IInvoice {
    id?: number
    customerId: number
    invoiceNumber: string
    invoiceDate: string
    terms: string
    dueDate: string
    billTo: string
    currencyCode: string
    items: IItem[]
    notes?: string
    termsAndConditions?: string
    discount?: number
    shipping?: number
}
