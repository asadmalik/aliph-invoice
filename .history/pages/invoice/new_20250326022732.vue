<template>
  <div>
    <UContainer as="div" class="max-w-5xl p-7">
      <div class="w-full flex-row items-start align-middle">
        <UFormField label="Customer Name" labelPlacement="bottom">
          <CustomerSelect/>
        </UFormField>
        
        <!-- <UICustomerSelect></UICustomerSelect> -->
        <!-- <UFormField label="Customer Name" labelPlacement="bottom">
          <USelect :items="customers" value-key="email" label-key="name" placeholder="Select Customer" v-model="selectedCustomer"></USelect>
        </UFormField>
        <UBadge>{{ selectedCustomer }}</UBadge> -->
      </div>

      <div class="w-full flex flex-row items-stretch">
        <UFormField label="Invoice #" labelPlacement="top">
          <UInput v-model="invoice.invoiceNumber" />
        </UFormField>

      </div>

      <div class="w-full flex flex-row items-stretch justify-between">
        <UFormField label="Invoice Date" labelPlacement="top" class="w-full">
          <UInput v-model="invoice.invoiceDate" type="date" />
        </UFormField>
        <UFormField label="Invoice Date" labelPlacement="top"  class="w-full">
          <UInput v-model="invoice.invoiceDate" type="date" />
        </UFormField>
        <UFormField label="Invoice Date" labelPlacement="top"  class="w-full">
          <UInput v-model="invoice.invoiceDate" type="date" />
        </UFormField>

      </div>

    </UContainer>

  </div>
</template>

<script lang="ts" setup>

import CustomerSelect from '~~/components/ui/CustomerSelect.vue';

/*   const customers = ref([
    { name: 'John Smith', email: 'John@Smith.com', currency: 'GBP', address: '123 Park Road, Awesomeville, Uganda' }
  ]) */
  const selectedCustomer = ref()
  // Reactive invoice data
  const invoice = reactive({
    customerName: "",
    invoiceNumber: "INV-0001",
    invoiceDate: new Date().toISOString().split("T")[0],
    terms: "Due On Receipt",
    dueDate: "",
    billTo: "141 Hacienda Drive,\nPleasanton,\n94588 CA.",
    currencyCode: "USD",
    items: [
      { item: "", quantity: 0, rate: 0, tax: 0 },
      { item: "", quantity: 0, rate: 0, tax: 0 },
      { item: "", quantity: 0, rate: 0, tax: 0 },
      { item: "", quantity: 0, rate: 0, tax: 0 },
      { item: "", quantity: 0, rate: 0, tax: 0 }
    ],
    notes: "Thanks for your business.",
    termsAndConditions: "",
    discount: 0,
    shipping: 0
  });
</script>