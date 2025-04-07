<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-6">Edit Customer</h1>

    <UForm :state="form" @submit="handleSubmit">
      <div class="grid gap-4">
        <UInput v-model="form.name" label="Name" placeholder="John Doe" required />
        <UInput v-model="form.phone" label="Phone" placeholder="+1 555‑555‑5555" />
        <UInput v-model="form.email" label="Email" placeholder="john@example.com" type="email" />
        <UTextarea v-model="form.address" label="Address" placeholder="123 Main St, City, Country" />
        <UInput v-model="form.companyName" label="Company Name" placeholder="Acme Inc." />

        <!-- Image picker -->
        <div>
          <label class="block text-sm font-medium mb-1">Image</label>
          <input type="file" accept="image/*"
            class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700;"
            @change="onFileChange">
          <img v-if="form.image" :src="form.image" alt="Preview" class="mt-2 h-24 w-24 object-cover rounded">
        </div>

        <!-- Currency select -->
        <USelect v-model="form.currency" :options="currencies" option-attribute="label" value-attribute="value"
          label="Currency" placeholder="Select currency" />

        <UButton type="submit" class="mt-4">Update Customer</UButton>
      </div>
    </UForm>

    <UAlert v-if="saved" color="primary" variant="subtle" class="mt-4">
      Customer updated successfully!
    </UAlert>
  </div>
</template>

<script setup lang="ts">

  import { customerRepo } from '@/DataLayer/repositories/CustomerRepository'
  import type { ICustomer } from '@/DataLayer/types'


  interface EditableCustomer extends ICustomer {
    image?: string
  }

  const route = useRoute()
  const router = useRouter()
  const id = Number(route.params.id)

  const form = reactive<EditableCustomer>({
    name: '',
    phone: '',
    email: '',
    address: '',
    companyName: '',
    image: '',
    currency: ''
  })

  const saved = ref(false)

  const currencies = ref([
    { label: 'US Dollar (USD)', value: 'USD' },
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'British Pound (GBP)', value: 'GBP' },
    { label: 'Japanese Yen (JPY)', value: 'JPY' },
    { label: 'Pakistani Rupee (PKR)', value: 'PKR' },
    { label: 'Indian Rupee (INR)', value: 'INR' }
  ])

  onMounted(async () => {
    const existing = await customerRepo.get(id)
    if (!existing) {
      // If customer not found, redirect back to list
      return router.push('/customers')
    }
    Object.assign(form, existing)
  })

  const handleSubmit = async () => {
    await customerRepo.update(id, { ...form })
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  }

  const onFileChange = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (files && files[0]) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        form.image = ev.target?.result as string
      }
      reader.readAsDataURL(files[0])
    }
  }
</script>
