<template>
  <UContainer class="max-w-4xl py-10">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Edit Customer</h2>
        </div>
      </template>

      <UForm :state="form" class="grid grid-cols-1 md:grid-cols-2 gap-10" @submit="handleSubmit">
        <UFormField label="Customer Name" hint="Required">
          <UInput v-model="form.name" placeholder="e.g. Acme Corporation" class="w-full" />
        </UFormField>

        <UFormField label="Company Name" hint="Optional">
          <UInput v-model="form.companyName" placeholder="e.g. Acme Corp Ltd." class="w-full" />
        </UFormField>

        <UFormField label="Email" required>
          <UInput v-model="form.email" placeholder="e.g. billing@acme.com" type="email" class="w-full" />
        </UFormField>

        <UFormField label="Phone">
          <UInput v-model="form.phone" placeholder="e.g. +92 300 1234567" class="w-full" />
        </UFormField>

        <UFormField label="NTN / CNIC" required>
          <UInput v-model="form.ntnCnic" placeholder="e.g. 12345-6789012-3" class="w-full" />
        </UFormField>

        <UFormField label="Province" required>
          <USelect
v-model="form.provinceCode" :items="provinceOptions" value-key="provinceId" label-key="provinceName"
            placeholder="Select Province" class="w-full" />
        </UFormField>

        <UFormField label="Registration Type" required>
          <USelect
v-model="form.registrationType" :items="registrationTypes" placeholder="e.g. Filer, Unregistered"
            class="w-full" />
        </UFormField>

        <UFormField label="Currency">
          <UInput v-model="form.currency" placeholder="e.g. PKR" class="w-full" />
        </UFormField>

        <UFormField label="Address" class="md:col-span-2">
          <UTextarea v-model="form.address" :rows="2" placeholder="e.g. 42/A Gulberg III, Lahore" class="w-full" />
        </UFormField>

        <div class="md:col-span-2 flex justify-end mt-4">
          <UButton type="submit" color="primary" size="lg" icon="i-heroicons-check-circle">
            Update Customer
          </UButton>
        </div>
      </UForm>
    </UCard>

    <UAlert v-if="updated" color="green" variant="soft" class="mt-6" icon="i-heroicons-check-circle">
      Customer updated successfully!
    </UAlert>

    <UAlert v-if="notFound" color="red" variant="subtle" class="mt-6" icon="i-heroicons-exclamation-triangle">
      Customer not found.
    </UAlert>
  </UContainer>
</template>

<script setup lang="ts">
 
import { provinceRepo } from '@/DataLayer/repositories/ReferenceRepos'
import type { ICustomer } from '@/DataLayer/types'

  definePageMeta({ layout: 'default' })

  const route = useRoute()
  const router = useRouter()
  const id = Number(route.params.id)

  const updated = ref(false)
  const notFound = ref(false)

  const provinceOptions = ref<{ provinceId: string; provinceName: string }[]>([])
  const registrationTypes = [
    'Filer',
    'nonFiler',
    'Exempt',
    'Unregistered',
    'Registered',
    'Other'
  ]

  const form = reactive<Omit<ICustomer, 'created_at' | 'created_by' | 'updated_at' | 'updated_by'>>({
    id: id,
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

  onMounted(async () => {
    if (!import.meta.client) return

    provinceOptions.value = await provinceRepo.getAll()

    const customer = await useCustomerRepo().get(id)
    if (!customer) {
      notFound.value = true
      return
    }

    Object.assign(form, customer)
  })

  const handleSubmit = async () => {
    await useCustomerRepo().update(id, {
      ...form,
      updated_at: new Date().toISOString(),
      updated_by: 'demo-user-id'
    })

    updated.value = true
    setTimeout(() => (updated.value = false), 3000)
  }
</script>
