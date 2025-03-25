<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
                <!-- Left side: Logo, Company info & Bill To -->
                <div class="space-y-2 text-sm">
                    <!-- Logo & Company Info -->
                    <div>
                        <!-- Update the src to your actual logo path -->
                        <img src="./../assets/img/aliphmarketing_LOGO_SYMBOL.svg" alt="Aliph Marketing Logo" class="w-12 mr-2" />
                        <h2 class="text-lg font-semibold">Aliph Marketing Studio</h2>
                        <p>Web: https://aliphmarketing.com</p>
                        <p>Email: accounts@aliphmarketing.com</p>
                        <p>Tel: +92 33 25 88 88 01</p>
                    </div>

                    <!-- Optional Divider -->
                    <hr class="my-2 border-gray-300" />

                    <!-- Bill To -->
                    <div>
                        <div class="font-medium">Bill To:</div>
                        <UTextArea rows="5" class="w-96 border print:border-0 p-1 rounded-md"
                            v-model="invoice.billTo"></UTextArea>
                    </div>
                </div>

                <!-- Right side: Invoice details and Currency Dropdown -->
                <div class="text-right space-y-1">
                    <h1 class="text-6xl font-bold text-neutral-400">Invoice</h1>
                    <p class="font-extrabold mb-8 leading-10 text-lg"># {{ invoice.invoiceNumber }}</p>
                    <p class="font-semibold">
                        Balance Due:<span class="underline"> {{ formatCurrency(grandTotal) }}</span>
                    </p>
                    <p>
                        Invoice Date:
                        <span class="underline">{{ invoice.invoiceDate }}</span>
                    </p>
                    <p>
                        Terms:
                        <span class="underline">{{ invoice.terms }}</span>
                    </p>
                    <!-- Currency Dropdown -->
                    <div class="mt-4">
                        <label for="currency" class="label">Currency:</label>
                        <select id="currency" v-model="invoice.currencyCode" class="input">
                            <option v-for="option in currencyOptions" :key="option.code" :value="option.code">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>
                </div>
    </div>

            <!-- Customer & Invoice Info -->
            <div class="grid grid-cols-3 gap-4 mb-6 print:hidden">
            <!-- Customer Name -->
            <div>
                <label for="customerName" class="label">Customer Name</label>
                <input id="customerName" v-model="invoice.customerName" type="text"
                    placeholder="Select or add a customer" class="input" />
            </div>
            <!-- Invoice Number -->
            <div>
                <label for="invoiceNumber" class="label">Invoice #</label>
                <input id="invoiceNumber" v-model="invoice.invoiceNumber" type="text" class="input" />
            </div>
            <!-- Invoice Date -->
            <div>
                <label for="invoiceDate" class="label">Invoice Date</label>
                <input id="invoiceDate" v-model="invoice.invoiceDate" type="date" class="input" />
            </div>
        </div>

        <!-- Terms & Due Date -->
        <div class="grid grid-cols-3 gap-4 mb-6 print:hidden">
            <!-- Terms -->
            <div>
                <label for="terms" class="label">Terms</label>
                <select id="terms" v-model="invoice.terms" class="input">
                    <option value="Due On Receipt">Due On Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                </select>
            </div>
            <!-- Due Date -->
            <div>
                <label for="dueDate" class="label">Due Date</label>
                <input id="dueDate" v-model="invoice.dueDate" type="date" class="input" />
            </div>
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
              <UUTextArea v-model="invoice.notes" :rows="3" placeholder="Thanks for your business." />
            </UFormItem>
            <UFormItem label="Terms &amp; Conditions">
              <UUTextArea v-model="invoice.termsAndConditions" :rows="3" placeholder="Enter the terms and conditions." />
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
