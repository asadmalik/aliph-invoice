<template>
    <UContainer class="flex flex-col gap-6 py-10 max-w-4xl mx-auto">

        <h2 class="text-2xl font-semibold">Customer & Item Repository Tests</h2>

        <!-- CUSTOMER TESTS -->
        <UCard>
            <template #header>Customer Tests</template>

            <div class="flex flex-wrap gap-4">
                <UButton color="primary" @click="loadAllCustomers">Load All</UButton>
                <UButton color="success" @click="seedCustomers">Seed Demo Customers</UButton>
                <UInput v-model="searchCustomerName" placeholder="Find by Name" class="w-64" />
                <UButton color="secondary" @click="searchCustomer">Search</UButton>
            </div>

            <div class="mt-4 space-y-1 text-sm text-gray-600">
                <div v-for="customer in customers" :key="customer.id">
                    {{ customer.name }} — {{ customer.ntnCnic }} ({{ customer.provinceCode }})
                </div>
            </div>
        </UCard>

        <!-- ITEM TESTS -->
        <UCard>
            <template #header>Item Tests</template>

            <div class="flex flex-wrap gap-4">
                <UButton color="primary" @click="loadAllItems">Load All</UButton>
                <UButton color="success" @click="seedItems">Seed Demo Items</UButton>
                <UInput v-model="searchItemName" placeholder="Find by Name" class="w-64" />
                <UButton color="secondary" @click="searchItem">Search</UButton>
            </div>

            <div class="mt-4 space-y-1 text-sm text-gray-600">
                <div v-for="item in items" :key="item.id">
                    {{ item.name }} — {{ item.hsCode }} ({{ item.uomCode }})
                </div>
            </div>
        </UCard>

    </UContainer>
</template>

<script setup lang="ts">
    import { ref } from 'vue'

    import type { ICustomer, IItem } from '~/DataLayer/types'
    const customerRepo = useCustomerRepo()
    const itemRepo = useItemRepo()

    const customers = ref<ICustomer[]>([])
    const items = ref<IItem[]>([])

    const searchCustomerName = ref('')
    const searchItemName = ref('')

    const loadAllCustomers = async () => {
        customers.value = await customerRepo.getAll()
    }

    const searchCustomer = async () => {
        customers.value = await customerRepo.findByName(searchCustomerName.value)
    }

    const seedCustomers = async () => {
        await customerRepo.addDemoCustomers()
        await loadAllCustomers()
    }

    const loadAllItems = async () => {
        items.value = await itemRepo.getAll()
    }

    const searchItem = async () => {
        items.value = await itemRepo.findByName(searchItemName.value)
    }

    const seedItems = async () => {
        await itemRepo.addDemoItems()
        await loadAllItems()
    }
</script>
