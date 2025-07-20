<template>
    <UContainer class="max-w-4xl py-10">
        <UCard>
            <template #header>
                <div class="text-xl font-semibold">Edit Item</div>
            </template>

            <UForm :state="form" class="grid grid-cols-1 md:grid-cols-2 gap-6" @submit="handleSubmit">
                <!-- Reuse same fields as in new.vue -->
                <UFormField label="Item Name" description="Name of the product or service." hint="Required">
                    <UInput v-model="form.name" placeholder="e.g. Premium Basmati Rice" />
                </UFormField>

                <UFormField label="HS Code" description="6–8 digit code e.g. 10063000." hint="Optional">
                    <UInput v-model="form.hsCode" placeholder="e.g. 10063000" />
                </UFormField>

                <UFormField
label="Description" description="Clarify variants or packaging." hint="Optional"
                    class="md:col-span-2">
                    <UTextarea v-model="form.description" :rows="2" placeholder="e.g. 25 kg sack" />
                </UFormField>

                <UFormField label="Unit Type" description="Fixed, Hourly, or UOM." hint="Required">
                    <USelect
v-model="form.unitType" :items="unitTypes" option-attribute="label"
                        value-attribute="value" />
                </UFormField>

                <UFormField label="UOM Code" description="e.g. KG, PCS" hint="Optional">
                    <UInput v-model="form.uomCode" placeholder="e.g. KG" />
                </UFormField>

                <UFormField label="Rate" description="Price per unit (excl. tax)" hint="Required">
                    <UInput v-model.number="form.rate" type="number" min="0" placeholder="e.g. 25.00" />
                </UFormField>

                <UFormField label="Location" description="Warehouse or storage code." hint="Optional">
                    <UInput v-model="form.location" placeholder="e.g. WH-A1" />
                </UFormField>

                <UFormField label="FBR Sale Type" description="Tax category" hint="Required">
                    <USelect
v-model="form.fbrSaleType" :items="fbrSaleTypeOptions" option-attribute="label"
                        value-attribute="value" />
                </UFormField>

                <UFormField label="Sales Tax Rate (%)" description="e.g. 17 for 17%" hint="0–100%">
                    <UInput
v-model.number="form.defaultSalesTaxRate" type="number" step="0.01"
                        placeholder="e.g. 17.00" />
                </UFormField>

                <div class="md:col-span-2 flex justify-end mt-4">
                    <UButton type="submit" color="primary" size="lg" icon="i-heroicons-pencil-square">
                        Update Item
                    </UButton>
                </div>
            </UForm>
        </UCard>

        <UAlert v-if="updated" color="green" variant="soft" class="mt-6" icon="i-heroicons-check-circle">
            Item updated successfully!
        </UAlert>

        <UAlert v-if="notFound" color="red" variant="soft" class="mt-6" icon="i-heroicons-x-circle">
            Item not found.
        </UAlert>
    </UContainer>
</template>

<script setup lang="ts">

    import type { IItem } from '@/DataLayer/types'

    definePageMeta({
        layout: 'default',
        title: 'Edit Item'
    })

    useSeoMeta({
        title: 'Edit Item',
        description: 'Modify item details such as name, HS code, rate, and more.'
    })


    const route = useRoute()
    //const router = useRouter()
    const itemRepo = useItemRepo()

    const updated = ref(false)
    const notFound = ref(false)
    const id = route.params.id as string

    const unitTypes = [
        { label: 'UOM', value: 'UOM' },
        { label: 'Fixed', value: 'Fixed' },
        { label: 'Hourly', value: 'Hourly' },
    ]
    const fbrSaleTypeOptions = [
        { label: 'Goods at Standard Rate', value: 'Goods at Standard Rate' },
        { label: 'Goods at Reduced Rate', value: 'Goods at Reduced Rate' },
        { label: 'Exempt Goods', value: 'Exempt Goods' },
        { label: 'Services', value: 'Services' },
    ]

    const form = reactive<Omit<IItem, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>>({
        id: 0,
        name: '',
        description: '',
        location: '',
        hsCode: '',
        uomCode: '',
        defaultSalesTaxRate: 0,
        fbrSaleType: 'Goods at Standard Rate',
        unitType: 'UOM',
        rate: 0,
    })

    onMounted(async () => {
        const item = await itemRepo.get(parseInt(id))
        if (!item) {
            notFound.value = true
            return
        }
        Object.assign(form, item)
    })

    const handleSubmit = async () => {
        await itemRepo.update(parseInt(id), {
            ...form,
            updatedAt: new Date().toISOString(),
            updatedBy: 'demo-user-id',
        })

        updated.value = true
        setTimeout(() => (updated.value = false), 3000)
    }
</script>
