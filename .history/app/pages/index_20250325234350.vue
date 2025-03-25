<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between mb-6">
      <!-- Left side: Logo, Company info & Bill To -->
      <div class="space-y-2 text-sm">
        <div class="flex items-center">
          <img
            src="/img/aliphmarketing_LOGO_SYMBOL.svg"
            alt="Aliph Marketing Logo"
            class="w-12 mr-2"
          />
          <div>
            <UText tag="h2" class="text-lg font-semibold">Aliph Marketing Studio</UText>
            <UText>Web: https://aliphmarketing.com</UText>
            <UText>Email: accounts@aliphmarketing.com</UText>
            <UText>Tel: +92 33 25 88 88 01</UText>
          </div>
        </div>
        <UDivider class="my-2" />
        <div>
          <UText strong>Bill To:</UText>
          <UTextarea v-model="invoice.billTo" :rows="5" class="w-96" />
        </div>
      </div>
      <!-- Right side: Invoice details and Currency Dropdown -->
      <div class="text-right space-y-1 mt-4 md:mt-0">
        <UText tag="h1" class="text-6xl font-bold text-neutral-400">Invoice</UText>
        <UText class="font-extrabold mb-8 leading-10 text-lg">
          # {{ invoice.invoiceNumber }}
        </UText>
        <UText class="font-semibold">
          Balance Due: <UText tag="span" underline>{{ formatCurrency(grandTotal) }}</UText>
        </UText>
        <UText>
          Invoice Date: <UText tag="span" underline>{{ invoice.invoiceDate }}</UText>
        </UText>
        <UText>
          Terms: <UText tag="span" underline>{{ invoice.terms }}</UText>
        </UText>
        <div class="mt-4">
          <UFormItem label="Currency:" labelPlacement="top">
            <USelect v-model="invoice.currencyCode" :items="currencyOptions" class="" />
          </UFormItem>
        </div>
      </div>
    </div>

    <!-- Customer & Invoice Info (hidden in print mode) -->
    <div v-if="!printMode" class="mb-6">
      <UGrid :cols="3" gap="4">
        <UGridItem>
          <UFormItem label="Customer Name">
            <UInput v-model="invoice.customerName" placeholder="Select or add a customer" />
          </UFormItem>
        </UGridItem>
        <UGridItem>
          <UFormItem label="Invoice #">
            <UInput v-model="invoice.invoiceNumber" />
          </UFormItem>
        </UGridItem>
        <UGridItem>
          <UFormItem label="Invoice Date">
            <UInput type="date" v-model="invoice.invoiceDate" />
          </UFormItem>
        </UGridItem>
      </UGrid>
    </div>

    <!-- Terms & Due Date (hidden in print mode) -->
    <div v-if="!printMode" class="mb-6">
      <UGrid :cols="3" gap="4">
        <UGridItem>
          <UFormItem label="Terms">
            <USelect v-model="invoice.terms" :items="termsOptions" />
          </UFormItem>
        </UGridItem>
        <UGridItem>
          <UFormItem label="Due Date">
            <UInput type="date" v-model="invoice.dueDate" />
          </UFormItem>
        </UGridItem>
      </UGrid>
    </div>

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

    <!-- Add Rows / Bulk (hidden in print mode) -->
    <div v-if="!printMode" class="mt-4 space-x-2">
      <UButton type="default" @click="addNewRow">Add New Row</UButton>
      <UButton type="default" @click="addItemsInBulk">Add Items in Bulk</UButton>
    </div>

    <!-- Two-column layout for Notes/Terms and Totals Summary -->
    <UGrid :cols="6" gap="6" class="mt-10">
      <!-- Left Column: Customer Notes, Terms & Conditions, Payment Gateway -->
      <UGridItem :span="3">
        <UCard>
          <template #header>
            <UText strong>Customer Notes &amp; Terms</UText>
          </template>
          <template #default>
            <UFormItem label="Customer Notes">
              <UTextarea v-model="invoice.notes" :rows="3" placeholder="Thanks for your business." />
            </UFormItem>
            <UFormItem label="Terms &amp; Conditions">
              <UTextarea v-model="invoice.termsAndConditions" :rows="3" placeholder="Enter the terms and conditions." />
            </UFormItem>
            
          </template>
        </UCard>
      </UGridItem>

      <!-- Right Column: Totals Summary -->
      <UGridItem :span="3">
        <UCard>
          <template #header>
            <div class="flex justify-end">
              <UButton type="text" size="small" class="italic" @click="showSummary = !showSummary">
                {{ !showSummary ? "Show Total Summary" : "Hide Total Summary" }}
              </UButton>
            </div>
          </template>
          <template #default>
            <div v-if="showSummary" class="py-10 space-y-2">
              <div class="flex justify-between">
                <UText>Sub Total</UText>
                <UText>{{ formatCurrency(subTotal) }}</UText>
              </div>
              <div class="flex justify-between items-center">
                <UFormItem label="Discount">
                  <UInput v-model.number="invoice.discount" type="number" class="w-16" />
                </UFormItem>
                <UText class="bg-green-100 text-right">{{ formatCurrency(discountValue) }}</UText>
              </div>
              <div class="flex justify-between items-center">
                <UFormItem label="Shipping">
                  <UInput v-model.number="invoice.shipping" type="number" class="w-16" />
                </UFormItem>
                <UText class="bg-red-100 text-right">{{ formatCurrency(invoice.shipping) }}</UText>
              </div>
              <div v-for="(taxObj, i) in groupedTaxes" :key="i" class="flex justify-between">
                <UText>{{ taxObj.label }}</UText>
                <UText>{{ formatCurrency(taxObj.amount) }}</UText>
              </div>
              <UDivider />
              <div class="flex justify-between items-center">
                <UText strong>Total ({{ currencySymbol }})</UText>
                <UText strong class="text-lg">{{ formatCurrency(grandTotal) }}</UText>
              </div>
            </div>
            <div v-else class="py-10">
              <div class="flex justify-between items-center">
                <UText strong>Total ({{ currencySymbol }})</UText>
                <UText strong class="text-lg">{{ formatCurrency(grandTotal) }}</UText>
              </div>
            </div>
          </template>
        </UCard>
      </UGridItem>
    </UGrid>

    <!-- Footer Buttons (aligned right) -->
    <div class="mt-6 flex justify-end space-x-2">
      <UButton type="default" @click="saveAsDraft">Save as Draft</UButton>
      <UButton type="primary" @click="saveAndSend">Save and Send</UButton>
      <UButton type="default" @click="cancel">Cancel</UButton>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "blank" })

const showSummary = ref(true)
// Tax dropdown options
const taxOptions = ref([
        { label: 'No Tax (0%)', value: 0 },
        { label: '5%', value: 5 },
        { label: '10%', value: 10 },
        { label: 'New Tax', value: 'new' }
    ]);


// Currency options with symbols
const currencyOptions = ref([
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan (¥)" },
  { code: "PKR", symbol: "₨", label: "PKR (₨)" },
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "SAR", symbol: "﷼", label: "Saudi Riyal (﷼)" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham (د.إ)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" }
]);

// Terms options
const termsOptions = ref([
  { label: "Due On Receipt", value: "Due On Receipt" },
  { label: "Net 15", value: "Net 15" },
  { label: "Net 30", value: "Net 30" }
]);

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



// Computed currency symbol based on selected currencyCode
const currencySymbol = computed(() => {
  const option = currencyOptions.value.find((opt) => opt.code === invoice.currencyCode);
  return option ? option.symbol : "$";
});

// Helper function to format currency values using the selected symbol
function formatCurrency(value) {
  return currencySymbol.value + Number(value).toFixed(2);
}

/**
 * rowAmount: quantity * rate
 */
function rowAmount(row) {
  return (Number(row.quantity) || 0) * (Number(row.rate) || 0);
}

/**
 * subTotal: sum of row amounts
 */
const subTotal = computed(() => {
  return invoice.items.reduce((acc, row) => acc + rowAmount(row), 0);
});

/**
 * discountValue: direct currency discount
 */
const discountValue = computed(() => {
  return Number(invoice.discount) || 0;
});

/**
 * groupedTaxes: group tax amounts by tax rate
 */
const groupedTaxes = computed(() => {
  const taxMap = {};
  invoice.items.forEach((row) => {
    const taxRate = typeof row.tax === "number" ? row.tax : 0;
    if (!taxMap[taxRate]) {
      taxMap[taxRate] = 0;
    }
    taxMap[taxRate] += rowAmount(row) * (taxRate / 100);
  });
  return Object.entries(taxMap).map(([rate, amount]) => {
    return {
      label: `Tax (${Number(rate)}%)`,
      amount
    };
  });
});

/**
 * totalTax: sum of all grouped tax amounts
 */
const totalTax = computed(() => {
  return groupedTaxes.value.reduce((sum, t) => sum + t.amount, 0);
});

/**
 * grandTotal = subTotal - discount + shipping + totalTax
 */
const grandTotal = computed(() => {
  return subTotal.value - discountValue.value + Number(invoice.shipping) + totalTax.value;
});

/**
 * handleTaxChange: if user picks "New Tax", prompt for custom rate
 */
function handleTaxChange(row) {
  if (row.tax === "new") {
    const newTax = prompt("Enter new tax rate (0-99):");
    if (newTax !== null) {
      const parsed = parseInt(newTax);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 99) {
        currencyOptions.splice(currencyOptions.length - 1, 0, {
          label: `${parsed}%`,
          value: parsed
        });
        row.tax = parsed;
      } else {
        alert("Invalid tax rate.");
        row.tax = 0;
      }
    } else {
      row.tax = 0;
    }
  }
}

// Row management
function addNewRow() {
  invoice.items.push({ item: "", quantity: 0, rate: 0, tax: 0 });
}

function removeRow(index) {
  invoice.items.splice(index, 1);
}

function addItemsInBulk() {
  alert("Add items in bulk triggered.");
}

function onScanItem() {
  alert("Scan item triggered.");
}

function addPaymentGateway() {
  alert("Add Payment Gateway triggered.");
}

// Save methods
function saveAsDraft() {
  console.log("Invoice saved as draft:", invoice);
  alert("Invoice saved as draft.");
}

function saveAndSend() {
  console.log("Invoice saved and sent:", invoice);
  alert("Invoice saved and sent.");
}

function cancel() {
  alert("Canceled.");
}

// For demonstration, set printMode to false (implement as needed)
const printMode = false;
</script>

<style scoped>
/* You can add or override custom styles as needed; Nuxt UI provides built-in styling */
</style>
