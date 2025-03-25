<template>
  <NContainer class="p-6 max-w-6xl mx-auto">
    <!-- Header -->
    <NGrid x-gap="6" class="mb-6">
      <!-- Left side: Logo, Company info & Bill To -->
      <NGridItem span="4">
        <div class="space-y-2 text-sm">
          <div>
            <!-- Update the src to your actual logo path -->
            <img src="/img/aliphmarketing_LOGO_SYMBOL.svg" alt="Aliph Marketing Logo" class="w-12 mr-2" />
            <NText tag="h2" class="text-lg font-semibold">Aliph Marketing Studio</NText>
            <NText>Web: https://aliphmarketing.com</NText>
            <NText>Email: accounts@aliphmarketing.com</NText>
            <NText>Tel: +92 33 25 88 88 01</NText>
          </div>
          <NDivider class="my-2" />
          <div>
            <NText strong>Bill To:</NText>
            <NTextarea rows="5" v-model="invoice.billTo" class="w-96" />
          </div>
        </div>
      </NGridItem>

      <!-- Right side: Invoice details and Currency Dropdown -->
      <NGridItem span="4" class="text-right">
        <NText tag="h1" class="text-6xl font-bold text-neutral-400">Invoice</NText>
        <NText class="font-extrabold mb-8 leading-10 text-lg">
          # {{ invoice.invoiceNumber }}
        </NText>
        <NText class="font-semibold">
          Balance Due:
          <NText tag="span" underline>{{ formatCurrency(grandTotal) }}</NText>
        </NText>
        <NText>
          Invoice Date:
          <NText tag="span" underline>{{ invoice.invoiceDate }}</NText>
        </NText>
        <NText>
          Terms:
          <NText tag="span" underline>{{ invoice.terms }}</NText>
        </NText>
        <!-- Currency Dropdown -->
        <div class="mt-4">
          <NFormItem label="Currency:" label-placement="top">
            <NSelect v-model="invoice.currencyCode" :options="currencyOptions" />
          </NFormItem>
        </div>
      </NGridItem>
    </NGrid>

    <!-- Customer & Invoice Info (hidden when printing) -->
    <div class="mb-6" v-if="!printMode">
      <NGrid x-gap="4">
        <NGridItem span="1">
          <NFormItem label="Customer Name">
            <NInput v-model="invoice.customerName" placeholder="Select or add a customer" />
          </NFormItem>
        </NGridItem>
        <NGridItem span="1">
          <NFormItem label="Invoice #">
            <NInput v-model="invoice.invoiceNumber" />
          </NFormItem>
        </NGridItem>
        <NGridItem span="1">
          <NFormItem label="Invoice Date">
            <NInput type="date" v-model="invoice.invoiceDate" />
          </NFormItem>
        </NGridItem>
      </NGrid>
    </div>

    <!-- Terms & Due Date (hidden when printing) -->
    <div class="mb-6" v-if="!printMode">
      <NGrid x-gap="4">
        <NGridItem span="1">
          <NFormItem label="Terms">
            <NSelect v-model="invoice.terms" :options="termsOptions" />
          </NFormItem>
        </NGridItem>
        <NGridItem span="1">
          <NFormItem label="Due Date">
            <NInput type="date" v-model="invoice.dueDate" />
          </NFormItem>
        </NGridItem>
      </NGrid>
    </div>

    <!-- Item Table -->
    <NCard class="mb-4">
      <NCardHeader>
        <NText tag="h2" class="text-lg font-semibold">Item Details</NText>
        <!-- The "Scan Item" button is hidden (per your original code) -->
      </NCardHeader>
      <!-- For simplicity, we use NDataTable from Nuxt UI for the item table -->
      <NDataTable :columns="itemColumns" :data="invoice.items" striped bordered>
        <template #cell(amount)="row">
          {{ formatCurrency(rowAmount(row.row)) }}
        </template>
        <template #cell(actions)="row">
          <NButton type="error" size="small" @click="removeRow(row.index)">X</NButton>
        </template>
      </NDataTable>
    </NCard>

    <!-- Add Rows / Bulk (hidden when printing) -->
    <div class="mb-6" v-if="!printMode">
      <NButton @click="addNewRow" type="default">Add New Row</NButton>
      <NButton @click="addItemsInBulk" type="default">Add Items in Bulk</NButton>
    </div>

    <!-- Two-column layout for Notes/Terms and Totals Summary -->
    <NGrid x-gap="6">
      <!-- Left Column: Customer Notes, Terms & Conditions, Payment Gateway -->
      <NGridItem span="3">
        <NCard class="pt-10">
          <NCardBody>
            <NFormItem label="Customer Notes" label-placement="top">
              <NTextarea v-model="invoice.notes" rows="3" placeholder="Thanks for your business." />
            </NFormItem>
            <NFormItem label="Terms & Conditions" label-placement="top">
              <NTextarea v-model="invoice.termsAndConditions" rows="3" placeholder="Enter the terms and conditions to be displayed on the invoice." />
            </NFormItem>
            <NButton @click="addPaymentGateway" type="default">Add Payment Gateway</NButton>
          </NCardBody>
        </NCard>
      </NGridItem>

      <!-- Right Column: Totals Summary -->
      <NGridItem span="3">
        <NCard class="pt-10">
          <NCardHeader>
            <NButton @click="showSummary = !showSummary" type="text" class="float-right italic">
              {{ !showSummary ? "Show Total Summary" : "Hide Total Summary" }}
            </NButton>
          </NCardHeader>
          <NCardBody>
            <div v-if="showSummary" class="space-y-2 py-10">
              <div class="flex justify-between">
                <NText>Sub Total</NText>
                <NText>{{ formatCurrency(subTotal) }}</NText>
              </div>
              <div class="flex justify-between items-center">
                <NFormItem label="Discount" label-placement="top">
                  <NInput v-model.number="invoice.discount" type="number" class="w-16" />
                </NFormItem>
                <NText class="bg-green-100 text-right">{{ formatCurrency(discountValue) }}</NText>
              </div>
              <div class="flex justify-between items-center">
                <NFormItem label="Shipping" label-placement="top">
                  <NInput v-model.number="invoice.shipping" type="number" class="w-16" />
                </NFormItem>
                <NText class="bg-red-100 text-right">{{ formatCurrency(invoice.shipping) }}</NText>
              </div>
              <div v-for="(taxObj, i) in groupedTaxes" :key="i" class="flex justify-between">
                <NText>{{ taxObj.label }}</NText>
                <NText>{{ formatCurrency(taxObj.amount) }}</NText>
              </div>
              <NDivider />
              <div class="flex justify-between items-center">
                <NText strong>Total ({{ currencySymbol }})</NText>
                <NText strong class="text-lg">{{ formatCurrency(grandTotal) }}</NText>
              </div>
            </div>
            <div v-else class="py-10">
              <div class="flex justify-between items-center">
                <NText strong>Total ({{ currencySymbol }})</NText>
                <NText strong class="text-lg">{{ formatCurrency(grandTotal) }}</NText>
              </div>
            </div>
          </NCardBody>
        </NCard>
      </NGridItem>
    </NGrid>

    <!-- Footer Buttons (aligned right) -->
    <div class="mt-6 flex justify-end space-x-2">
      <NButton @click="saveAsDraft" type="default">Save as Draft</NButton>
      <NButton @click="saveAndSend" type="primary">Save and Send</NButton>
      <NButton @click="cancel" type="default">Cancel</NButton>
    </div>
  </NContainer>
</template>

<script setup>
    definePageMeta({
        layout: "blank"
    });

    // Currency options with symbols
    const currencyOptions = [
        { code: "USD", symbol: "$", label: "USD ($)" },
        { code: "GBP", symbol: "£", label: "GBP (£)" },
        { code: "CNY", symbol: "¥", label: "Chinese Yuan (¥)" },
        { code: "PKR", symbol: "₨", label: "PKR (₨)" },
        { code: "INR", symbol: "₹", label: "INR (₹)" },
        { code: "SAR", symbol: "﷼", label: "Saudi Riyal (﷼)" },
        { code: "AED", symbol: "د.إ", label: "UAE Dirham (د.إ)" },
        { code: "EUR", symbol: "€", label: "Euro (€)" }
    ];
    const showSummary = ref(true)

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
        discount: 0, // discount in currency
        shipping: 0
    });

    // Computed currency symbol based on selected currencyCode
    const currencySymbol = computed(() => {
        const option = currencyOptions.find(
            (opt) => opt.code === invoice.currencyCode
        );
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
      return 0;  
      //return (Number(row.quantity) || 0) * (Number(row.rate) || 0);
    }

    /**
     * subTotal: sum of row amounts
     */
    const subTotal = computed(() => {
      return 0  
      //return invoice.items.reduce((acc, row) => acc + rowAmount(row), 0);
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
                    taxOptions.splice(taxOptions.length - 1, 0, {
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
</script>

<style scoped>
/* You can keep or remove custom styles as Nuxt UI components provide built-in styling */
</style>
