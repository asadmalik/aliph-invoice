// ~/services/seedDatabase.ts
import type {
    IDocType,
    IHsCode,
    IProvince,
    ISroItem,
    ITransactionType,
    IUom
} from '@/DataLayer/types'


import { customerRepo } from '@/DataLayer/repositories/CustomerRepository'
import { itemRepo } from '@/DataLayer/repositories/ItemRepository'
import { provinceRepo, uomRepo, docTypeRepo, transTypeRepo, hsCodeRepo, sroItemRepo } from '~/DataLayer/repositories/ReferenceRepos'

/**
 * Fetches all PRAL look-ups and upserts them into IndexedDB.
 * Call once at startup (e.g. in dev-only onMounted or plugin).
 */
export async function seedDatabase() {
    // 1) Fetch each list with proper generic so TS knows the shapes
    const [
        provinces,
        uoms,
        docTypes,
        transTypes,
        hsCodes,
        sroItems
    ] = await Promise.all([
        $fetch<IProvince[]>('/api/pdi/v1/provinces'),
        $fetch<IUom[]>('/api/pdi/v1/uom'),
        $fetch<IDocType[]>('/api/pdi/v1/doctypecode'),
        $fetch<ITransactionType[]>('/api/pdi/v1/transtypecode'),
        $fetch<IHsCode[]>('/api/pdi/v1/itemdesccode'),
        $fetch<ISroItem[]>('/api/pdi/v1/sroitemcode'),
    ])

    //console.log('api',hsCodes, sroItems);

    // 2) Bulk-upsert into each ref_* table
    await Promise.all([
        provinceRepo.bulkUpsert(provinces),
        uomRepo.bulkUpsert(uoms),
        docTypeRepo.bulkUpsert(docTypes),
        transTypeRepo.bulkUpsert(transTypes),
        hsCodeRepo.bulkUpsert(hsCodes),
        sroItemRepo.bulkUpsert(sroItems),
    ])

    console.log('✅ Reference tables seeded:',
        `${provinces.length} provinces`,
        `${uoms.length} UOMs`,
        `${docTypes.length} docTypes`,
        `${transTypes.length} transTypes`,
        `${hsCodes.length} HS codes`,
        `${sroItems.length} SRO items`
    )

    // 3) Create sample customers if none exist
    const existingCustomers = await customerRepo.getAll()
    if (!existingCustomers.length) {
        await customerRepo.add({
            name: 'ACME Corp',
            address: '1 Industrial Way, Karachi',
            provinceCode: '01',
            ntnCnic: '1234567890123'
        })
        await customerRepo.add({
            name: 'Beta Traders',
            address: '45 Market St, Lahore',
            provinceCode: '02',
            ntnCnic: '9876543210987'
        })
        console.log('✅ Sample customers created')
    } else {
        console.log('ℹ️  Customers already exist—skipping')
    }

    // 4) (Optional) Create a sample item
    const existingItems = await itemRepo.getAll()
    if (!existingItems.length) {
        await itemRepo.add({
            name: 'Polyester Fabric',
            unitType: 'UOM',
            rate: 120,
            uomCode: 'MTR',
            hsCode: '59049000'
        })
        console.log('✅ Sample item created')
    }
}
