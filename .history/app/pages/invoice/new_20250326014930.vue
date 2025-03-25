<template>
  <div>
    <UContainer as="div">
      <div class="w-full">
        <UFormField label="Customer Name" labelPlacement="bottom">
          <USelect :items="customers" v-model="selectedCustomer"></USelect>
        </UFormField>
      </div>


    </UContainer>
    
  </div>
</template>

<script lang="ts" setup>
const customers = ref([
  {name: 'John Smith', email: 'John@Smith.com', currency:'GBP', address:'123 Park Road, Awesomeville, Uganda'}
])
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