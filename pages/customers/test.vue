<!-- File: pages/repository-test.vue -->
<template>
    <UContainer as="div" class="max-w-5xl mx-auto p-6 space-y-8">
        <h1 class="text-2xl font-bold">Repository Smoke‑Test Page</h1>

        <!-- Customer Tests -->
        <UCard>
            <template #header>
                <span class="font-semibold">CustomerRepository</span>
            </template>
            <template #default>
                <div class="flex flex-wrap gap-2">
                    <UButton size="sm" @click="addCustomer">Add</UButton>
                    <UButton size="sm" @click="getCustomer">Get (id)</UButton>
                    <UButton size="sm" @click="getAllCustomers">Get All</UButton>
                    <UButton size="sm" @click="updateCustomer">Update (id)</UButton>
                    <UButton size="sm" color="error" @click="deleteCustomer">Delete (id)</UButton>
                    <UButton size="sm" @click="findCustomerByName">Find By Name</UButton>
                </div>
                <pre
                    class="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto h-48">{{ customerLog }}</pre>
            </template>
        </UCard>

        <!-- Invoice Tests -->
        <UCard>
            <template #header>
                <span class="font-semibold">InvoiceRepository</span>
            </template>
            <template #default>
                <div class="flex flex-wrap gap-2">
                    <UButton size="sm" @click="addInvoice">Add</UButton>
                    <UButton size="sm" @click="getInvoice">Get (id)</UButton>
                    <UButton size="sm" @click="getAllInvoices">Get All</UButton>
                    <UButton size="sm" @click="updateInvoice">Update (id)</UButton>
                    <UButton size="sm" color="red" @click="deleteInvoice">Delete (id)</UButton>
                    <UButton size="sm" @click="getInvoicesByCustomer">Get By Customer</UButton>
                </div>
                <pre
                    class="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto h-48">{{ invoiceLog }}</pre>
            </template>
        </UCard>

        <!-- Item Tests -->
        <UCard>
            <template #header>
                <span class="font-semibold">ItemRepository</span>
            </template>
            <template #default>
                <div class="flex flex-wrap gap-2">
                    <UButton size="sm" @click="addItem">Add</UButton>
                    <UButton size="sm" @click="getItem">Get (id)</UButton>
                    <UButton size="sm" @click="getAllItems">Get All</UButton>
                    <UButton size="sm" @click="updateItem">Update (id)</UButton>
                    <UButton size="sm" color="red" @click="deleteItem">Delete (id)</UButton>
                    <UButton size="sm" @click="getItemsByInvoice">Get By Invoice</UButton>
                </div>
                <pre
                    class="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto h-48">{{ itemLog }}</pre>
            </template>
        </UCard>

        <!-- TaxItem Tests -->
        <UCard>
            <template #header>
                <span class="font-semibold">TaxItemRepository</span>
            </template>
            <template #default>
                <div class="flex flex-wrap gap-2">
                    <UButton size="sm" @click="addTaxItem">Add</UButton>
                    <UButton size="sm" @click="getTaxItem">Get (id)</UButton>
                    <UButton size="sm" @click="getAllTaxItems">Get All</UButton>
                    <UButton size="sm" @click="updateTaxItem">Update (id)</UButton>
                    <UButton size="sm" color="red" @click="deleteTaxItem">Delete (id)</UButton>
                    <UButton size="sm" @click="findTaxByName">Find By Name</UButton>
                </div>
                <pre
                    class="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-x-auto h-48">{{ taxLog }}</pre>
            </template>
        </UCard>
    </UContainer>
</template>

<script lang="ts" setup>
    // ----------------------------
    // Repositories
    // ----------------------------
    import { customerRepo } from '~/DataLayer/repositories/CustomerRepository'
    import { invoiceRepo } from '~/DataLayer/repositories/InvoiceRepository'
    import { itemRepo } from '~/DataLayer/repositories/ItemRepository'
    import { taxItemRepo } from '~/DataLayer/repositories/TaxItemRepository'

    import { reactive, ref } from 'vue'

    // State for IDs we generate on‑the‑fly so later tests can reference them
    const ids = reactive({
        customerId: 0,
        invoiceId: 0,
        itemId: 0,
        taxItemId: 0
    })

    // Helper for nice timestamped logs
    function ts() {
        return new Date().toLocaleTimeString()
    }
    function append(logRef: { value: string }, label: string, payload: unknown) {
        logRef.value += `\n[${ts()}] ${label}: ${JSON.stringify(payload, null, 2)}`
    }

    // ----------------------------
    // Customer Tests
    // ----------------------------
    const customerLog = ref('')

    async function addCustomer() {
        try {
            const id = await customerRepo.add({
                name: 'Amjad Ali',
                phone: '+1 555 5555 555',
                email: 'amjad@example.com',
                companyName: 'Amjad & Co.',
                currency: 'PKR'
            })
            ids.customerId = id
            append(customerLog, 'Add OK (id)', id)
        } catch (e) {
            append(customerLog, 'Add ERR', e)
        }
    }

    async function getCustomer() {
        try {
            const data = await customerRepo.get(ids.customerId)
            append(customerLog, 'Get', data)
        } catch (e) {
            append(customerLog, 'Get ERR', e)
        }
    }

    async function getAllCustomers() {
        append(customerLog, 'GetAll', await customerRepo.getAll())
    }

    async function updateCustomer() {
        try {
            const rows = await customerRepo.update(ids.customerId, { phone: '+92 300 1234567' })
            append(customerLog, 'Update rows', rows)
        } catch (e) {
            append(customerLog, 'Update ERR', e)
        }
    }

    async function deleteCustomer() {
        try {
            await customerRepo.delete(ids.customerId)
            append(customerLog, 'Delete OK', ids.customerId)
        } catch (e) {
            append(customerLog, 'Delete ERR', e)
        }
    }

    async function findCustomerByName() {
        append(customerLog, 'FindByName', await customerRepo.findByName('Amjad Ali'))
    }

    // ----------------------------
    // Invoice Tests
    // ----------------------------
    const invoiceLog = ref('')

    async function addInvoice() {
        try {
            // Ensure we have a customer; create if missing
            if (!ids.customerId) await addCustomer()
            const id = await invoiceRepo.add({
                customerId: ids.customerId,
                invoiceNumber: 'INV-0001',
                invoiceDate: new Date().toISOString().split('T')[0],
                terms: 'Due On Receipt',
                dueDate: '',
                billTo: '123 Main St',
                currencyCode: 'PKR',
                items: [],
                discount: 0,
                shipping: 0
            })
            ids.invoiceId = id
            append(invoiceLog, 'Add OK (id)', id)
        } catch (e) {
            append(invoiceLog, 'Add ERR', e)
        }
    }

    async function getInvoice() {
        append(invoiceLog, 'Get', await invoiceRepo.get(ids.invoiceId))
    }

    async function getAllInvoices() {
        append(invoiceLog, 'GetAll', await invoiceRepo.getAll())
    }

    async function updateInvoice() {
        append(invoiceLog, 'Update rows', await invoiceRepo.update(ids.invoiceId, { terms: 'Net 30' }))
    }

    async function deleteInvoice() {
        await invoiceRepo.delete(ids.invoiceId)
        append(invoiceLog, 'Delete OK', ids.invoiceId)
    }

    async function getInvoicesByCustomer() {
        append(invoiceLog, 'ByCustomer', await invoiceRepo.getByCustomer(ids.customerId))
    }

    // ----------------------------
    // Item Tests
    // ----------------------------
    const itemLog = ref('')

    async function addItem() {
        try {
            // Ensure we have invoice
            if (!ids.invoiceId) await addInvoice()
            const id = await itemRepo.add({
                invoiceId: ids.invoiceId,
                name: 'Design Work',
                unitType: 'Fixed',
                quantity: 1,
                rate: 500,
                tax: 10,
                taxName: 'GST'
            })
            ids.itemId = id
            append(itemLog, 'Add OK (id)', id)
        } catch (e) {
            append(itemLog, 'Add ERR', e)
        }
    }

    async function getItem() {
        append(itemLog, 'Get', await itemRepo.get(ids.itemId))
    }

    async function getAllItems() {
        append(itemLog, 'GetAll', await itemRepo.getAll())
    }

    async function updateItem() {
        append(itemLog, 'Update rows', await itemRepo.update(ids.itemId, { quantity: 2 }))
    }

    async function deleteItem() {
        await itemRepo.delete(ids.itemId)
        append(itemLog, 'Delete OK', ids.itemId)
    }

    async function getItemsByInvoice() {
        append(itemLog, 'ByInvoice', await itemRepo.getByInvoice(ids.invoiceId))
    }

    // ----------------------------
    // TaxItem Tests
    // ----------------------------
    const taxLog = ref('')

    async function addTaxItem() {
        try {
            const id = await taxItemRepo.add({ name: 'GST', rate: 10 })
            ids.taxItemId = id
            append(taxLog, 'Add OK (id)', id)
        } catch (e) {
            append(taxLog, 'Add ERR', e)
        }
    }

    async function getTaxItem() {
        append(taxLog, 'Get', await taxItemRepo.get(ids.taxItemId))
    }

    async function getAllTaxItems() {
        append(taxLog, 'GetAll', await taxItemRepo.getAll())
    }

    async function updateTaxItem() {
        append(taxLog, 'Update rows', await taxItemRepo.update(ids.taxItemId, { rate: 15 }))
    }

    async function deleteTaxItem() {
        await taxItemRepo.delete(ids.taxItemId)
        append(taxLog, 'Delete OK', ids.taxItemId)
    }

    async function findTaxByName() {
        append(taxLog, 'FindByName', await taxItemRepo.findByName('GST'))
    }
</script>

<style scoped>
    pre {
        white-space: pre-wrap;
    }
</style>
