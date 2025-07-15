/* repositories/referenceRepos.ts */
import { db } from '../db'
import type {
    IDocType,
    IHsCode,
    IProvince,
    ISroItem,
    ITransactionType,
    IUom
} from '../types'
import { LookupRepository } from './LookupRepository'

export const provinceRepo = new LookupRepository<IProvince, string>(db.ref_province)
export const uomRepo = new LookupRepository<IUom, string>(db.ref_uom)
export const hsCodeRepo = new LookupRepository<IHsCode, string>(db.ref_hs_code)
export const docTypeRepo = new LookupRepository<IDocType, number>(db.ref_doc_type)
export const transTypeRepo = new LookupRepository<ITransactionType, number>(db.ref_transaction_type)
/* Compound PK table: pass the composite type (string works fine) */
//export const sroItemRepo = new LookupRepository<ISroItem, string>(db.ref_sro_item)
export const sroItemRepo =
    new LookupRepository<ISroItem, [string, string]>(db.ref_sro_item)