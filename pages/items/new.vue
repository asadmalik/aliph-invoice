<template>
    <UContainer class="max-w-4xl py-10">
        <UCard>
            <template #header>
                <div class="text-xl font-semibold">Create New Item</div>
            </template>

            <UForm :state="form" class="grid grid-cols-1 md:grid-cols-2 gap-6" @submit="handleSubmit">

                <UFormField
label="Item Name" description="Name of the product or service." hint="Required"
                    class="w-full">
                    <UInput v-model="form.name" placeholder="e.g. Premium Basmati Rice" class="w-full" />
                </UFormField>

                <UFormField
label="HS Code" description="Enter the 6–8 digit HS code, e.g. 10063000." hint="Optional"
                    class="w-full">
                    <UInput v-model="form.hsCode" placeholder="e.g. 10063000" class="w-full" />
                </UFormField>

                <UFormField
label="Description" description="Use up to 200 characters to clarify variants or packaging."
                    hint="Optional" help="" class="w-full md:col-span-2">
                    <UTextarea
v-model="form.description" :rows="2" placeholder="e.g. 25 kg sack of pure basmati"
                        class="w-full" />
                </UFormField>

                <UFormField
label="Unit Type"
                    description="Fixed fee, Hourly, UOM=per unit code." hint="Required"
                    help="" class="w-full">
                    <USelect
v-model="form.unitType" :items="unitTypes" option-attribute="label" value-attribute="value"
                        class="w-full" />
                </UFormField>

                <UFormField
label="UOM Code" description="Unit-of-measure code. E.g. KG, PCS, LTR."
                    hint="Optional" class="w-full">
                    <UInput v-model="form.uomCode" placeholder="e.g. KG" class="w-full" />
                </UFormField>

                <UFormField
label="Rate" description="Default price per unit, excl. tax." hint="Required"
                    class="w-full">
                    <UInput v-model.number="form.rate" type="number" placeholder="e.g. 25.00" class="w-full" />
                </UFormField>

                <UFormField label="Location" description="Storage or warehouse code." hint="Optional" class="w-full">
                    <UInput v-model="form.location" placeholder="e.g. WH-A1" class="w-full" />
                </UFormField>

                <UFormField
label="FBR Sale Type" description="Federal Board of Revenue sale category." hint="Required"
                    class="w-full">
                    <USelect
v-model="form.fbrSaleType" :items="fbrSaleTypeOptions" option-attribute="label"
                        value-attribute="value" class="w-full" />
                </UFormField>

                <UFormField
label="Sales Tax Rate (%). "
                    description="Default tax percentage e.g. 17 for 17%."
                    hint="0–100%" class="w-full">
                    <UInput
v-model.number="form.defaultSalesTaxRate" type="number" step="0.01" placeholder="e.g. 17.00"
                        class="w-full" />
                </UFormField>

                <div class="md:col-span-2 flex justify-end mt-4">
                    <UButton type="submit" color="primary" size="lg" icon="i-heroicons-check-circle">
                        Save Item
                    </UButton>
                </div>
            </uform>
        </UCard>

        <UAlert v-if="saved" color="green" variant="soft" class="mt-6" icon="i-heroicons-check-circle">
            Item saved successfully!
        </UAlert>
    </UContainer>
</template>

<script setup lang="ts">
    
import type { IItem } from '@/DataLayer/types'


    definePageMeta({
        layout: 'default',
        title: 'Add New Item'
    })
    useSeoMeta({
        title: 'Add New Item',
        description: 'Create a new item with details like name, HS code, rate, and more.'
    })

    const saved = ref(false)

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

    const form = reactive<Omit<IItem, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>>({
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

    const handleSubmit = async () => {
//check for empty fields
        if (!form.name || !form.rate || !form.unitType || !form.fbrSaleType) {
            alert('Please fill in all required fields.')
            return
        }   


        await useItemRepo().add({
            ...form,
            createdAt: new Date().toISOString(),
            createdBy: 'demo-user-id', // Replace with actual user ID if available
            updatedAt: null,
            updatedBy: null
        })

        Object.assign(form, {
            name: '',
            description: '',
            location: '',
            hsCode: '',
            uomCode: '',
            defaultSalesTaxRate: 0,
            fbrSaleType: 'Goods at Standard Rate',
            unitType: 'UOM',
            rate: 0
        })

        saved.value = true
        setTimeout(() => (saved.value = false), 3000)
    }
</script>
