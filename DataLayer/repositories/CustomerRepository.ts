/* File: DataLayer/repositories/CustomerRepository.ts */
import { db } from '../db'
import type { ICustomer } from '../types'
import { BaseRepository } from './BaseRepository'

export class CustomerRepository extends BaseRepository<ICustomer> {
    constructor() {
        super(db.customers)
    }

    /** Find customers whose name matches (case‑insensitive) */
    async findByName(name: string): Promise<ICustomer[]> {
        return this.table.where('name').equalsIgnoreCase(name).toArray()
    }
    async findByNtnCnic(id: string) {
        return this.table.where('ntnCnic').equals(id).first()
    }
    async filterByProvince(code: string) {
        return this.table.where('provinceCode').equals(code).toArray()
    }
    /** TODO: generate new functions getAll and get(id) */
}

export const customerRepo = new CustomerRepository()
