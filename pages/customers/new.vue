<template>
  <UContainer class="max-w-4xl py-10">
    <UCard>
      <template #header>
        <div class="text-xl font-semibold">Create New Customer</div>
      </template>

      <UForm :state="form" class="grid grid-cols-1 md:grid-cols-2 gap-10" @submit="handleSubmit">
        <UFormField label="Customer Name" hint="Required" description="Display name of the customer.">
          <UInput v-model="form.name" placeholder="e.g. Acme Corporation" class="w-full" />
        </UFormField>

        <UFormField label="Company Name" hint="Optional" description="If different from display name.">
          <UInput v-model="form.companyName" placeholder="e.g. Acme Corp Ltd." class="w-full" />
        </UFormField>

        <UFormField label="Email" required hint="Optional" description="Customer's contact email.">
          <UInput v-model="form.email" placeholder="e.g. billing@acme.com" type="email" class="w-full" />
        </UFormField>

        <UFormField label="Phone" hint="Optional" description="Contact number for coordination.">
          <UInput v-model="form.phone" placeholder="e.g. +92 300 1234567" class="w-full" />
        </UFormField>

        <UFormField label="NTN / CNIC" required hint="Required for FBR" description="National Tax Number or CNIC.">
          <UInput v-model="form.ntnCnic" placeholder="e.g. 12345-6789012-3" class="w-full" />
        </UFormField>

        <UFormField label="Province" required hint="Required" description="Select the registered province.">
          <USelect
v-model="form.provinceCode" :items="provinceOptions" value-key="provinceId" label-key="provinceName"
            option-attribute="provinceName" value-attribute="provinceId" placeholder="Select Province" class="w-full" />
        </UFormField>

        <UFormField label="Registration Type" required hint="Required" description="Tax registration classification.">
          <USelect
v-model="form.registrationType" :items="registrationTypes" value-key=""
            label-key="" placeholder="e.g. Filer, Unregistered" class="w-full" />
        </UFormField>

        <UFormField label="Currency" hint="Optional" description="Currency used in invoices.">
          <UInput v-model="form.currency" placeholder="e.g. PKR" class="w-full" />
        </UFormField>

        <UFormField label="Address" hint="Optional" description="Billing or contact address." class="md:col-span-2">
          <UTextarea v-model="form.address" :rows="2" placeholder="e.g. 42/A Gulberg III, Lahore" class="w-full" />
        </UFormField>

        <div class="md:col-span-2 flex justify-end mt-4">
          <UButton type="submit" color="primary" size="lg" icon="i-heroicons-check-circle">
            Save Customer
          </UButton>
        </div>
      </UForm>
    </UCard>

    <UAlert v-if="saved" color="green" variant="soft" class="mt-6" icon="i-heroicons-check-circle">
      Customer saved successfully!
    </UAlert>
  </UContainer>
</template>

<script setup lang="ts">
import { provinceRepo } from '@/DataLayer/repositories/ReferenceRepos'
import type { ICustomer } from '@/DataLayer/types'

  definePageMeta({
    layout: 'default',
    title: 'Add New Customer'
  })
  useSeoMeta({
    title: 'Add New Customer',
    description: 'Create a new customer with details like name, contact, and address.'
  })

  const saved = ref(false)

  const form = reactive<Omit<ICustomer, 'id' | 'created_at' | 'created_by' | 'updated_at' | 'updated_by'>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    companyName: '',
    currency: '',
    ntnCnic: '',
    provinceCode: '',
    registrationType: 'Unregistered'
  })

  const registrationTypes = [
    'Filer',
    'nonFiler',
    'Exempt',
    'Unregistered',
    'Registered',
    'Other'
  ]

  const provinceOptions = ref<{ provinceId: string; provinceName: string }[]>([])

  onMounted(async () => {
    if (import.meta.client) {
      provinceOptions.value = await provinceRepo.getAll()
    }
  })

  const handleSubmit = async () => {

    // Check for empty fields
    if (!form.name || !form.ntnCnic || !form.provinceCode) {
      alert('Please fill in all required fields.')
      return
    }


    await useCustomerRepo().add({
      ...form,
      created_at: new Date().toISOString(),
      created_by: 'demo-user-id',
      updated_at: null,
      updated_by: null
    })

    Object.assign(form, {
      name: '',
      phone: '',
      email: '',
      address: '',
      companyName: '',
      currency: '',
      ntnCnic: '',
      provinceCode: '',
      registrationType: 'Unregistered'
    })

    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  }
</script>
