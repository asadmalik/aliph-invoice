<template>
  <div>
    <UContainer as="div" class="max-w-5xl p-7 flex flex-col gap-6">
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
        <UFormField label="Invoice #" size="lg">
          <UInput v-model="invoice.invoiceNumber" class="w-96"/>
        </UFormField>

      </div>

      <div class="w-full flex flex-row items-stretch justify-between gap-7">
        <UFormField label="Invoice Date" labelPlacement="top" size="lg"  >
          <UInput v-model="invoice.invoiceDate" type="date" class="w-72"/>
        </UFormField>
        <UFormField label="Terms" labelPlacement="top" size="lg" >
          <USelect v-model="invoice.terms" :items="termsOptions" class="w-72"/>
        </UFormField>
        <UFormField label="Due Date" labelPlacement="top" size="lg" >
          <UInput v-model="invoice.dueDate" type="date" class="w-72" />
        </UFormField>

      </div>

      <div class="w-full flex flex-row items-stretch justify-between gap-7">
        <!-- Item Table -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <UText tag="h2" class="text-lg font-semibold">Item Details</UText>
          <!--           <UButton v-if="!printMode" size="small" type="default" @click="onScanItem" class="hidden">
            Scan Item
          </UButton> -->
        </div>
      </template>
      <template #default>
        <table class="w-full border-collapse border-gray-300 text-sm">
          <colgroup>
            <col style="width: 50%;" />
            <col style="width: 8%;" />
            <col style="width: 8%;" />
            <col style="width: 12%;" />
            <col />
            <col v-if="!printMode" style="width: 2%;" />
          </colgroup>
          <thead class="bg-gray-100">
            <tr>
              <th class="border p-2 text-left">Item</th>
              <th class="border p-2 text-left">Quantity</th>
              <th class="border p-2 text-left">Rate</th>
              <th class="border p-2 text-left">Tax</th>
              <th class="border p-2 text-right">Amount</th>
              <th v-if="!printMode" class="border p-2 text-center w-10"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in invoice.items" :key="index">
              <td class="border p-2">
                <UInput v-model="row.item" placeholder="Type or select an item" />
              </td>
              <td class="border p-2">
                <UInput v-model.number="row.quantity" type="number" min="0" />
              </td>
              <td class="border p-2">
                <UInput v-model.number="row.rate" type="number" min="0" />
              </td>
              <td class="border p-2">
                <USelect v-model="row.tax" :items="taxOptions" @update:modelValue="handleTaxChange(row)" />
              </td>
              <td class="border p-2 text-right">
                {{ formatCurrency(rowAmount(row)) }}
              </td>
              <td v-if="!printMode" class="border p-2 text-center">
                <UButton size="small" type="error" @click="removeRow(index)">X</UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </UCard>
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

  // Terms options
  const termsOptions = ref([
    { label: "Due On Receipt", value: "Due On Receipt" },
    { label: "Net 15", value: "Net 15" },
    { label: "Net 30", value: "Net 30" }
  ]);
</script>