<template>
  <UContainer class="max-w-4xl py-10">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Customer Details</h2>
          <UButton :to="`/customers/${form.id}/edit`" color="info" icon="i-heroicons-pencil" size="sm">
            Edit</UButton>
        </div>
      </template>

      <UForm :state="form" class="grid grid-cols-1 md:grid-cols-2 gap-10" @submit="handleSubmit">
        <UFormField label="Customer Name">
          <!-- <UInput v-model="form.name" placeholder="e.g. Acme Corporation" class="w-full" /> -->
          <div class="text-3xl">{{form.name}}</div>
        </UFormField>

        <UFormField label="Company Name">
          <!--   <UInput v-model="form.companyName" placeholder="e.g. Acme Corp Ltd." class="w-full" /> -->
          <div class="text-3xl">{{ form.companyName }}</div>
        </UFormField>

        <UFormField label="Email">
          <!--           <UInput v-model="form.email" placeholder="e.g. billing@acme.com" type="email" class="w-full" />
 -->
          <div class="text-3xl">{{ form.email }}</div>
        </UFormField>

        <UFormField label="Phone">
          <!-- <UInput v-model="form.phone" placeholder="e.g. +92 300 1234567" class="w-full" /> -->
          <div class="text-3xl">{{ form.phone }}</div>
        </UFormField>

        <UFormField label="NTN / CNIC">
          <!--  <UInput v-model="form.ntnCnic" placeholder="e.g. 12345-6789012-3" class="w-full" /> -->
          <div class="text-3xl">{{ form.ntnCnic }}</div>
        </UFormField>

        <UFormField label="Province">
          <!-- <USelect
v-model="form.provinceCode" :items="provinceOptions" value-key="provinceId" label-key="provinceName"
            placeholder="Select Province" class="w-full" /> -->
          <div class="text-3xl">{{ form.provinceCode }}</div>
        </UFormField>

        <UFormField label="Registration Type">
          <!-- <USelect
v-model="form.registrationType" :items="registrationTypes" placeholder="e.g. Filer, Unregistered"
            class="w-full" /> -->
          <div class="text-3xl">{{ form.registrationType }}</div>
        </UFormField>

        <UFormField label="Currency">
          <!--           <UInput v-model="form.currency" placeholder="e.g. PKR" class="w-full" /> -->
          <div class="text-3xl">{{ form.currency }}</div>
        </UFormField>

        <UFormField label="Address" class="md:col-span-2">
          <!-- <UTextarea v-model="form.address" :rows="2" placeholder="e.g. 42/A Gulberg III, Lahore" class="w-full" /> -->
          <div class="text-3xl">{{ form.address }}</div>
        </UFormField>

        <div class="md:col-span-2 flex justify-end mt-4">
          <!-- <UButton type="submit" color="primary" size="lg" icon="i-heroicons-check-circle">
            Update Customer
          </UButton> -->
        </div>
      </UForm>
    </UCard>


  </UContainer>
</template>

<script setup lang="ts">

  import { provinceRepo } from '@/DataLayer/repositories/ReferenceRepos'
import type { ICustomer } from '@/DataLayer/types'

  definePageMeta({
    layout: 'default',
    title: 'Customer Details'
  })
  useSeoMeta({
    title: 'Customer Details',
    description: 'View customer details like name, contact, and address.'
  })


  const route = useRoute()
  const id = Number(route.params.id)

 // const updated = ref(false)
  const notFound = ref(false)

  const provinceOptions = ref<{ provinceId: string; provinceName: string }[]>([])
  

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
    
  }
</script>
