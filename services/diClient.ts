import type { IDIPostResponse, IDIValidateResponse, IInvoice } from "~/DataLayer/types"


// uses Nuxt’s built-in $fetch
export function validateInvoicePayload(payload: any) {
    return $fetch<IDIValidateResponse>('/api/di/validateinvoicedata', {
        method: 'POST',
        body: payload
    })
}

export function postInvoicePayload(payload: any) {
    return $fetch<IDIPostResponse>('/api/di/postinvoicedata', {
        method: 'POST',
        body: payload
    })
}

export function toDiPayload(inv: IInvoice) {
    // pick exactly the fields PRAL expects,
    // renaming your camelCase to snake_case as needed.
    return {
        documentTypeId: inv.documentTypeId,
        transactionTypeId: inv.transactionTypeId,
        invoiceRefNo: inv.invoiceNumber,
        scenariola: inv.scenarioId,
        saleType: inv.saleType,
        sellerBusinessName: inv.sellerName,
        sellerProvince: inv.sellerProvinceCode,
        sellerAddress:   inv.sellerAddress,
        buyerNTNCNIC: inv.buyerNtnCnic,
        buyerBusinessName: inv.customerName,
        buyerProvince: inv.buyerProvinceCode,
        buyerAddress: inv.buyerAddress,
        buyerRegistrationType: inv.buyerRegistrationType,
        invoiceDate: inv.invoiceDate,
        items: inv.items.map(row => ({
            hsCode: row.hsCode,
            productDescription: row.item,
            quantity: row.qty,
            uoM: row.uomCode,
            valueSalesExcludingST: row.qty * row.rate,
            salesTaxApplicable: row.tax,
            salesTaxWithheldAtSource: row.salesTaxWithheldAtSource ?? 0,
            extraTax: row.extraTax,
            furtherTax: row.furtherTax,
            sroScheduleNo: row.sroScheduleNo,
            sroItemSerialNo: row.sroItemSerialNo,
            fedPayable: row.fedPayable ?? 0,
            discount: row.lineDiscount ?? 0,
            totalValues:
                row.qty * row.rate
                + row.tax
                + (row.extraTax ?? 0)
                + (row.furtherTax ?? 0)
                + (row.fedPayable ?? 0)
                - (row.lineDiscount ?? 0),
            rate: `${row.taxRate ?? 0}%`  // if PRAL expects a string
        }))
    }
}
