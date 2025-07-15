// plugins/dexie.client.ts
// Loads only in the browser thanks to the .client suffix
import { db } from '@/DataLayer/db'

// Re‑export singleton repositories so they’re created once per tab
import { customerRepo } from '@/DataLayer/repositories/CustomerRepository'
import { invoiceRepo } from '@/DataLayer/repositories/InvoiceRepository'
import { itemRepo } from '@/DataLayer/repositories/ItemRepository'
import { taxItemRepo } from '@/DataLayer/repositories/TaxItemRepository'
import { provinceRepo, uomRepo, hsCodeRepo, docTypeRepo, transTypeRepo, sroItemRepo } from '~/DataLayer/repositories/ReferenceRepos'

export default defineNuxtPlugin(() => {
    // Anything returned in `provide` becomes available via useNuxtApp()
    return {
        provide: {
            db,
            customerRepo,
            invoiceRepo,
            itemRepo,
            taxItemRepo,
            provinceRepo,
            uomRepo,
            hsCodeRepo,
            docTypeRepo,
            transTypeRepo,
            sroItemRepo
        }
    }
})