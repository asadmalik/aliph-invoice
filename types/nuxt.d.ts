declare module '#app' {
    interface NuxtApp {
        $db: import('@/DataLayer/db').AliphInvoiceDB
        $customerRepo: import('@/DataLayer/repositories/CustomerRepository').CustomerRepository
        $invoiceRepo: import('@/DataLayer/repositories/InvoiceRepository').InvoiceRepository
        $itemRepo: import('@/DataLayer/repositories/ItemRepository').ItemRepository
        $taxItemRepo: import('@/DataLayer/repositories/TaxItemRepository').TaxItemRepository
    }
}

export { }

