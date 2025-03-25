<template>
  <div>
    <UContainer as="div" class="max-w-5xl p-7 flex flex-col gap-6">
      <div class="w-full flex-row items-start align-middle">
        <UFormField label="Customer Name" labelPlacement="bottom">
          <CustomerSelect />
        </UFormField>

        <!-- <UICustomerSelect></UICustomerSelect> -->
        <!-- <UFormField label="Customer Name" labelPlacement="bottom">
          <USelect :items="customers" value-key="email" label-key="name" placeholder="Select Customer" v-model="selectedCustomer"></USelect>
        </UFormField>
        <UBadge>{{ selectedCustomer }}</UBadge> -->
      </div>

      <div class="w-full flex flex-row items-stretch">
        <UFormField label="Invoice #" size="lg">
          <UInput v-model="invoice.invoiceNumber" class="w-96" />
        </UFormField>

      </div>

      <div class="w-full flex flex-row items-stretch justify-between gap-7">
        <UFormField label="Invoice Date" labelPlacement="top" size="lg">
          <UInput v-model="invoice.invoiceDate" type="date" class="w-72" />
        </UFormField>
        <UFormField label="Terms" labelPlacement="top" size="lg">
          <USelect v-model="invoice.terms" :items="termsOptions" class="w-72" />
        </UFormField>
        <UFormField label="Due Date" labelPlacement="top" size="lg">
          <UInput v-model="invoice.dueDate" type="date" class="w-72" />
        </UFormField>

      </div>

      <div class="w-full flex flex-row items-stretch justify-between gap-7">
        <!-- Item Table -->
        <UCard :data-allow-mismatch="true">
          <template #header>
            <div class="flex justify-between items-center">
              <UText tag="h2" class="text-lg font-semibold">Item Details</UText>
              <!--           <UButton v-if="!printMode" size="small" type="default" @click="onScanItem" class="hidden">
            Scan Item
          </UButton> -->
            </div>
          </template>
          <template #default>
            <!--  <table class="w-full border-collapse border-gray-300 text-sm">
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
        </table> -->


            <InvoiceItemTable :items="invoice.items" :taxOptions="taxOptions" mode="edit"
              @update:items="invoice.items = $event" />


              
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

  const taxOptions = ref([
    { label: 'No Tax (0%)', value: 0 },
    { label: '5%', value: 5 },
    { label: '10%', value: 10 },
    { label: 'New Tax', value: 'new' }
  ]);

  const showSummary = ref(true)
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