// composables/useRepos.ts
// Convenient helpers to access the injected Dexie database and repositories
// Auto‑imports are enabled in Nuxt, so you can call these composables
// anywhere without explicit import statements.

/**  Dexie database instance */
export const useDb = () => {
  const { $db } = useNuxtApp()
  return $db
}

/** Customer repository */
export const useCustomerRepo = () => {
  const { $customerRepo } = useNuxtApp()
  return $customerRepo
}

/** Item repository */
export const useItemRepo = () => {
  const { $itemRepo } = useNuxtApp()
  return $itemRepo
}

/** Invoice repository */
export const useInvoiceRepo = () => {
  const { $invoiceRepo } = useNuxtApp()
  return $invoiceRepo
}

/** Tax‑item repository */
export const useTaxItemRepo = () => {
  const { $taxItemRepo } = useNuxtApp()
  return $taxItemRepo
}
