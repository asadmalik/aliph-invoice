/* File: DataLayer/repositories/ItemRepository.ts */
import type { UpdateSpec } from 'dexie'
import { db } from '../db'
import type { IItem } from '../types'
import { BaseRepository } from './BaseRepository'

export class ItemRepository extends BaseRepository<IItem> {
    constructor() {
        super(db.items)
    }

    /** Fetch all line-items for a given invoice */
    async getByInvoice(invoiceId: number): Promise<IItem[]> {
        const items = await this.table.where('invoiceId').equals(invoiceId).toArray()
        console.log("DB ITEMS: ", items, invoiceId)
        return items
    }

    /** Find items by exact name (case-insensitive) */
    async findByName(name: string): Promise<IItem[]> {
        const items = await this.table.where('name').equalsIgnoreCase(name).toArray()
        //console.log("DB ITEMS: ", items)
        return items
    }

    /** Find items by HS code */
    async findByHsCode(hsCode: string): Promise<IItem[]> {
        return this.table.where('hsCode').equals(hsCode).toArray()
    }

    /** Find items by UOM code */
    async findByUomCode(uomCode: string): Promise<IItem[]> {
        return this.table.where('uomCode').equals(uomCode).toArray()
    }

    /** Bulk-add new items; returns array of generated IDs */
    async bulkAdd(items: Omit<IItem, 'id'>[]): Promise<number> {
        return this.table.bulkAdd(items as IItem[])
    }

    /** Bulk-put items (add or update); returns array of IDs */
    async bulkPut(items: IItem[]): Promise<number> {
        return this.table.bulkPut(items)
    }

    /** Seed the DB with some demo items */
    async addDemoItems(): Promise<void> {
        const demos: Omit<IItem, 'id'>[] = [
            {
                name: 'Premium Basmati Rice',
                description: '100% pure long-grain basmati rice, 25 kg sack',
                location: 'WH-A1',
                hsCode: '10063000',
                uomCode: 'KG',
                defaultSalesTaxRate: 17.00,
                fbrSaleType: 'Goods at Standard Rate',
                createdAt: '2025-07-16T11:00:00+05:00',
                createdBy: '550e8400-e29b-41d4-a716-446655440000',
                updatedAt: null,
                updatedBy: null,
                unitType: 'UOM',
                rate: 300
            },
            {
                name: 'Refined Sugar',
                description: 'Food-grade white sugar, 50 kg bag',
                location: 'WH-A2',
                hsCode: '17019990',
                uomCode: 'KG',
                defaultSalesTaxRate: 5.00,
                fbrSaleType: 'Goods at Reduced Rate',
                createdAt: '2025-07-16T11:05:00+05:00',
                createdBy: '660e8400-e29b-41d4-a716-446655440001',
                updatedAt: null,
                updatedBy: null, unitType: 'UOM',
                rate: 275
            },
            {
                name: 'Packaged Drinking Water',
                description: 'Mineral water, 500 ml bottles, pack of 24',
                location: 'Cold-Store-1',
                hsCode: '22011000',
                uomCode: 'PCS',
                defaultSalesTaxRate: 0.00,
                fbrSaleType: 'Exempt Goods',
                createdAt: '2025-07-16T11:10:00+05:00',
                createdBy: '770e8400-e29b-41d4-a716-446655440002',
                updatedAt: null,
                updatedBy: null, unitType: 'UOM',
                rate: 178
            },
            {
                name: 'Mobile Handset Model X',
                description: 'Latest smartphone with 6.5-inch display',
                location: 'ELEC-A1',
                hsCode: '85171200',
                uomCode: 'PCS',
                defaultSalesTaxRate: 17.00,
                fbrSaleType: 'Goods at Standard Rate',
                createdAt: '2025-07-16T11:15:00+05:00',
                createdBy: '880e8400-e29b-41d4-a716-446655440003',
                updatedAt: null,
                updatedBy: null, unitType: 'UOM',
                rate: 28500
            },
            {
                name: 'Electricity Supply Service',
                description: 'Monthly residential electricity service',
                location: 'MECH-B2',
                hsCode: '99842200',
                uomCode: 'SET',
                defaultSalesTaxRate: 17.00,
                fbrSaleType: 'Services',
                createdAt: '2025-07-16T11:20:00+05:00',
                createdBy: '990e8400-e29b-41d4-a716-446655440004',
                updatedAt: null,
                updatedBy: null, unitType: 'UOM',
                rate: 115890
            },
            {
                name: 'Diesel Engine Oil',
                description: 'Synthetic engine oil, 5 L canister',
                location: 'CHEM-B2',
                hsCode: '27101921',
                uomCode: 'LTR',
                defaultSalesTaxRate: 17.00,
                fbrSaleType: 'Goods at Standard Rate',
                createdAt: '2025-07-16T11:25:00+05:00',
                createdBy: '550e8400-e29b-41d4-a716-446655440000',
                updatedAt: null,
                updatedBy: null, unitType: 'UOM',
                rate: 59000
            },
            {
                name: 'T-Shirt Cotton',
                description: 'Unisex cotton T-shirt, various sizes',
                location: 'APP-WH1',
                hsCode: '61091000',
                uomCode: 'PCS',
                defaultSalesTaxRate: 17.00,
                fbrSaleType: 'Goods at Standard Rate',
                createdAt: '2025-07-16T11:30:00+05:00',
                createdBy: '660e8400-e29b-41d4-a716-446655440001',
                updatedAt: null,
                updatedBy: null,
                unitType: 'UOM',
                rate: 585
            },
            {
                name: 'Office Chair',
                description: 'Ergonomic office chair with wheels',
                location: 'FURN-01',
                hsCode: '94036090',
                uomCode: 'PCS',
                defaultSalesTaxRate: 17.00,
                fbrSaleType: 'Goods at Standard Rate',
                createdAt: '2025-07-16T11:35:00+05:00',
                createdBy: '770e8400-e29b-41d4-a716-446655440002',
                updatedAt: null,
                updatedBy: null,
                unitType: 'UOM',
                rate: 3200
            },
            {
                name: 'Pharmaceutical Tablets',
                description: 'Paracetamol 500 mg, pack of 10 tablets',
                location: 'PHAR-03',
                hsCode: '30049090',
                uomCode: 'BOX',
                defaultSalesTaxRate: 5.00,
                fbrSaleType: 'Goods at Reduced Rate',
                createdAt: '2025-07-16T11:40:00+05:00',
                createdBy: '880e8400-e29b-41d4-a716-446655440003',
                updatedAt: null,
                updatedBy: null,
                unitType: 'UOM',
                rate: 300
            },
            {
                name: 'Printed Circuit Boards',
                description: 'Custom PCB for industrial controllers',
                location: 'ELEC-A2',
                hsCode: '85340010',
                uomCode: 'PCS',
                defaultSalesTaxRate: 17.00,
                fbrSaleType: 'Goods at Standard Rate',
                createdAt: '2025-07-16T11:45:00+05:00',
                createdBy: '990e8400-e29b-41d4-a716-446655440004',
                updatedAt: null,
                updatedBy: null,
                unitType: 'UOM',
                rate: 4100
            }
        ];
        //await this.bulkAdd(demos)

        for (const demo of demos) {
            const existing = await this.table
                .where('hsCode')
                .equals(demo.hsCode!)
                .first()

            if (existing?.id != null) {
                // update only the fields in demo
                await this.table.update(existing.id, demo as UpdateSpec<IItem>)
            } else {
                // insert new record
                await this.table.add(demo as IItem)
            }
        }
    }
}

export const itemRepo = new ItemRepository()
