/* File: DataLayer/repositories/CustomerRepository.ts */
import type { UpdateSpec } from 'dexie'
import { db } from '../db'
import type { ICustomer } from '../types'
import { BaseRepository } from './BaseRepository'

export class CustomerRepository extends BaseRepository<ICustomer> {
    constructor() {
        super(db.customers)
    }

    /** → inherited: add(entity: Omit<ICustomer,'id'>): Promise<number> */
    /** → inherited: get(id: number): Promise<ICustomer | undefined> */
    /** → inherited: getAll(): Promise<ICustomer[]> */
    /** → inherited: update(id: number, changes: Partial<ICustomer>): Promise<number> */
    /** → inherited: delete(id: number): Promise<void> */

    /** Find customers whose name matches (case-insensitive) */
    async findByName(name: string): Promise<ICustomer[]> {
        return this.table.where('name').equalsIgnoreCase(name).toArray()
    }

    /** Lookup by NTN or CNIC */
    async findByNtnCnic(id: string): Promise<ICustomer | undefined> {
        return this.table.where('ntnCnic').equals(id).first()
    }

    /** Filter all customers in a given province code */
    async filterByProvince(code: string): Promise<ICustomer[]> {
        return this.table.where('provinceCode').equals(code).toArray()
    }

    /** Bulk‐insert an array of customers (skips duplicates if any) */
    async bulkAdd(customers: Omit<ICustomer, 'id'>[]): Promise<number> {
        // Dexie.bulkAdd returns a Promise of added primary keys
        return this.table.bulkAdd(customers)
    }

    /** Seed the DB with some demo customers */
    async addDemoCustomers(): Promise<void> {
        const demos: Omit<ICustomer, 'id'>[] = [
            {
                name: 'Acme Corp',
                phone: '555-0101',
                email: 'hello@acme.com',
                address: '1 Acme Way',
                companyName: 'Acme Corporation',
                currency: 'USD',
                ntnCnic: '12345-6789012-3', registrationType: 'nonFiler',
                provinceCode: 'PAK-PB'
            },
            {
                name: 'Beta LLC',
                phone: '555-0202',
                email: 'contact@beta.com',
                address: '99 Beta Blvd',
                companyName: 'Beta Limited',
                currency: 'EUR',
                ntnCnic: '98765-4321098-7', registrationType: 'nonFiler',
                provinceCode: 'PAK-SD'
            },
            {
                name: 'New Customer Co',
                phone: '555-0303',
                email: 'new@customer.co',
                address: '123 New St.',
                companyName: 'New Customer Co',
                currency: 'PKR',
                ntnCnic: '1122334455-6',
                registrationType: 'Filer',
                provinceCode: 'PB',
                created_at: new Date().toISOString(),
                created_by: 'system',
                updated_at: new Date().toISOString(),
                updated_by: 'system'
            },
            { ntnCnic: '3520212345679', name: 'Al-Habib Traders', provinceCode: 'PB', address: 'House 12-A, Bank Road, Lahore, Punjab', registrationType: 'Filer', created_at: '2025-07-16T10:00:00+05:00', created_by: '550e8400-e29b-41d4-a716-446655440000', updated_at: new Date().toISOString(), updated_by: 'system' },
            { ntnCnic: '123456789', name: 'Sindh Electronics', provinceCode: 'SD', address: 'Plot 45, University Road, Karachi, Sindh', registrationType: 'Filer', created_at: '2025-07-16T10:05:00+05:00', created_by: '660e8400-e29b-41d4-a716-446655440001', updated_at: new Date().toISOString(), updated_by: 'system' },
            { ntnCnic: '7654321', name: 'KP Agro Supply', provinceCode: 'KP', address: 'Sector C-2, University Town, Peshawar, Khyber Pakhtunkhwa', registrationType: 'nonFiler', created_at: '2025-07-16T10:10:00+05:00', created_by: '770e8400-e29b-41d4-a716-446655440002', updated_at: new Date().toISOString(), updated_by: 'system' },
            { ntnCnic: '6110123456789', name: 'Balochistan Steel Mills', provinceCode: 'BA', address: 'Industrial Zone, Quetta, Balochistan', registrationType: 'Filer', created_at: '2025-07-16T10:15:00+05:00', created_by: '880e8400-e29b-41d4-a716-446655440003', updated_at: new Date().toISOString(), updated_by: 'system' },
            { ntnCnic: '4220123456789', name: 'Northern Services Co.', provinceCode: 'PB', address: 'Plot 8, Northern Bypass, Rawalpindi, Punjab', registrationType: 'nonFiler', created_at: '2025-07-16T10:20:00+05:00', created_by: '990e8400-e29b-41d4-a716-446655440004', updated_at: new Date().toISOString(), updated_by: 'system' }
        ]
        //await this.bulkAdd(demo)
        for (const demo of demos) {
            const existing = await this.table
                .where('ntnCnic')
                .equals(demo.ntnCnic!)
                .first()

            if (existing?.id != null) {
                // update only the fields in demo
                await this.table.update(existing.id, demo as UpdateSpec<ICustomer>)
            } else {
                // insert new record
                await this.table.add(demo as ICustomer)
            }
        }
    }
}

export const customerRepo = new CustomerRepository()
