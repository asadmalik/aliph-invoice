<template>
  <UContainer class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <UText tag="h1" class="text-2xl font-bold">{{
        pageTitle
      }}</UText>
      <UBadge
        :color="
          {
            draft: 'neutral',
            validated: 'primary',
            posted: 'success',
            error: 'error',
          }[invoice.status]
        "
        class="uppercase px-3 py-1 rounded"
      >
        {{ invoice.status }}
      </UBadge>
    </div>

    <!-- Seller & Buyer Info -->
    <div class="grid grid-cols-2 gap-8">
      <!-- Seller (read-only) -->
      <div class="space-y-4">
        <UFormField label="Seller Name">
          <UInput v-model="invoice.sellerName" readonly />
        </UFormField>
        <UFormField label="Seller Province">
          <USelect
            v-model="invoice.sellerProvinceCode"
            :items="provinceOptions"
            disabled
          />
        </UFormField>
        <UFormField label="Seller Address">
          <UInput
            v-model="invoice.sellerAddress"
            readonly
          />
        </UFormField>
      </div>

      <!-- Buyer -->
      <div class="space-y-4">
        <UFormField
          label="Buyer Name"
          label-placement="bottom"
        >
          <CustomerSelect
            v-model="invoice.customerId"
            @select="setCustomer"
          />
          <template #error>
            <p
              v-if="errors.customer"
              class="text-red-600 text-sm"
            >
              {{ errors.customer }}
            </p>
          </template>
        </UFormField>
        <UFormField label="Buyer Province">
          <USelect
            v-model="invoice.buyerProvinceCode"
            :items="provinceOptions"
          />
        </UFormField>
        <UFormField label="Buyer Address">
          <UInput v-model="invoice.buyerAddress" />
        </UFormField>
        <UFormField label="Buyer NTN/CNIC">
          <UInput v-model="invoice.buyerNtnCnic" />
        </UFormField>
        <UFormField label="Registration Type">
          <USelect
            v-model="invoice.buyerRegistrationType"
            :items="registrationTypeOptions"
          />
        </UFormField>
      </div>
    </div>

    <!-- Invoice Meta -->
    <div class="flex flex-wrap gap-6 mt-4">
      <UFormField label="Invoice Type">
        <UInput :value="docTypeLabel" readonly />
      </UFormField>
      <UFormField label="Scenario">
        <USelect
          v-model="invoice.scenarioId"
          :items="scenarioOptions"
          @update:model-value="onScenarioChange"
        />
      </UFormField>
      <UFormField label="Transaction Type">
        <USelect
          v-model="invoice.transactionTypeId"
          :items="transactionTypeOptions"
        />
      </UFormField>
      
      <UFormField label="Invoice Date">
        <UInput
          v-model="invoice.invoiceDate"
          type="date"
          class="w-48"
        />
      </UFormField>
      <UFormField label="Due Date">
        <UInput
          v-model="invoice.dueDate"
          type="date"
          class="w-48"
          readonly
        />
      </UFormField>
      <UFormField v-if="showTerms" label="Terms">
        <USelect
          v-model="invoice.terms"
          :items="termsOptions"
          class="w-48"
        />
      </UFormField>
    </div>

    <!-- Items Table -->
    <UCard class="mt-6">
      <template #header>
        <UText tag="h2" class="text-lg font-semibold"
          >Item Details</UText
        >
      </template>
      <InvoiceItemsTable
        :items-table="invoice.items"
        :status="invoice.status"
        :scenario="invoice.scenarioId"
        :sale-type="invoice.saleType"
        @item-added="syncItems"
        @item-removed="syncItems"
        @item-updated="syncItems"
      />
      <template #footer>
        <p v-if="errors.items" class="text-red-600 text-sm">
          {{ errors.items }}
        </p>
      </template>
    </UCard>

    <!-- Totals & Extras -->
    <div class="grid grid-cols-2 gap-8 mt-6">
      <div class="space-y-4">
        <UFormField label="Header Discount">
          <UInput
            v-model.number="invoice.discount"
            type="number"
          />
        </UFormField>
        <UFormField label="Shipping">
          <UInput
            v-model.number="invoice.shipping"
            type="number"
          />
        </UFormField>
        <UFormField label="Notes">
          <UTextarea v-model="invoice.notes" rows="3" />
        </UFormField>
      </div>

      <div class="self-end w-80 space-y-1 text-sm">
        <div class="flex justify-between">
          <span>Sub-Total:</span
          ><span>{{ fmt(subTotal) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Sales Tax:</span
          ><span>{{ fmt(totalSalesTax) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Withheld Tax:</span
          ><span>-{{ fmt(totalWithheldTax) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Extra Tax:</span
          ><span>{{ fmt(totalExtraTax) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Line Discounts:</span
          ><span>-{{ fmt(totalLineDiscount) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Header Discount:</span
          ><span>-{{ fmt(invoice.discount) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Shipping:</span
          ><span>{{ fmt(invoice.shipping) }}</span>
        </div>
        <div
          class="border-t pt-1 flex justify-between font-semibold text-lg"
        >
          <span>Grand Total:</span
          ><span>{{ fmt(grandTotal) }}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 self-end mt-8">
      <!--       <UButton
        v-if="invoice.status === 'draft'"
        color="primary"
        :loading="isSaving"
        :disabled="!isValid"
        @click="saveInvoice"
      >Save</UButton> -->
      <UButton
        color="primary"
        :disabled="!isValid"
        @click="validateInvoice"
        >Validate</UButton
      >
      <!--       <UButton
        color="primary"
        :loading="isPosting"
        @click="postInvoice"
      >Submit to FBR</UButton> -->
      <UButton
        v-if="invoice.status === 'posted'"
        color="secondary"
        @click="printInvoice"
        >Print Tax Invoice</UButton
      >
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type {
    ICustomer,
    IInvoice,
    IInvoiceItem,
    InvoiceHeader,
    InvoiceStatus,
    ValidationResult,
} from "@/DataLayer/types";

import {
    useCustomerRepo,
    useInvoiceRepo,
    useProvinceRepo,
    useTransactionTypeRepo,
} from "@/composables/useRepos";
import CustomerSelect from "~/components/ui/CustomerSelect.vue";
import InvoiceItemsTable from "~/components/ui/InvoiceItemsTable.vue";
import {
    toDiPayload,
    validateInvoicePayload,
} from "~/services/diClient";

// — Page Meta & Title —
const pageTitle = computed(() => {
  const dt =
    (useRoute().params.docType as
      | "sale"
      | "purchase"
      | "credit") || "sale";
  return dt === "credit"
    ? "Credit Note"
    : `${dt.charAt(0).toUpperCase() + dt.slice(1)} Invoice`;
});
definePageMeta({ layout: "default", title: "New Invoice" });
useHead({ title: "New " + pageTitle.value });
useSeoMeta({
  title: "New " + pageTitle.value,
  description:
    "Create a new invoice with customer details, items, and totals.",
});

// — Company Profile Stub —
const companyProfile = {
  businessName: "Aliph Technologies",
  sellerProvinceCode: "PB",
  address: "COMPANY ADDRESS HERE",
  ntnCnic: "12345-6789012-3",
};

// — Doc-Type Mapping & Lookups —
const docType =
  (useRoute().params.docType as
    | "sale"
    | "purchase"
    | "credit") || "sale";
const docTypeMap = {
  sale: {
    label: "Sale Invoice",
    documentTypeId: 4,
    defaultTransType: 1,
  },
  purchase: {
    label: "Purchase Invoice",
    documentTypeId: 5,
    defaultTransType: 1,
  },
  credit: {
    label: "Credit Note",
    documentTypeId: 12,
    defaultTransType: 3,
  },
};
const {
  label: docTypeLabel,
  documentTypeId,
  defaultTransType,
} = docTypeMap[docType];

// — Repos & Arrays —
const invoiceRepo = useInvoiceRepo();
const customerRepo = useCustomerRepo();
const provinceRepo = useProvinceRepo();
const transTypeRepo = useTransactionTypeRepo();

const scenarioOptions = [
  {
    label: "SNO01 — Local Taxable",
    value: "SNO01",
    saleType: "Goods at Standard Rate",
  },
  {
    label: "SNO17 — Export Zero-Rated",
    value: "SNO17",
    saleType: "Export of Goods",
  },
];
const termsOptions = [
  { label: "Due On Receipt", value: "Due On Receipt" },
  { label: "Net 15", value: "Net 15" },
  { label: "Net 30", value: "Net 30" },
];
const registrationTypeOptions = [
  { label: "Registered", value: "Registered" },
  { label: "Un-Registered", value: "Un-Registered" },
];

const provinceOptions = ref<
  { label: string; value: string }[]
>([]);
const transactionTypeOptions = ref<
  { label: string; value: number }[]
>([]);
const customerOptions = ref<ICustomer[]>([]);

// — Reactive Invoice State (exact IInvoice shape) —
const invoice = reactive<IInvoice>({
  id: undefined,
  customerId: 0,
  customerName: "",
  
  invoiceDate: new Date().toISOString().split("T")[0],
  terms: "Due On Receipt",
  dueDate: "",
  billTo: "",
  currencyCode: "PKR",

  buyerAddress: "",
  buyerNtnCnic: "",
  buyerRegistrationType: "Registered",

  documentTypeId,
  transactionTypeId: defaultTransType,
  scenarioId: "SNO01",
  saleType: "Goods at Standard Rate",

  sellerName: companyProfile.businessName,
  sellerProvinceCode: companyProfile.sellerProvinceCode,
  sellerAddress: companyProfile.address,

  buyerProvinceCode: "",
  status: "draft" as InvoiceStatus,
  fbrInvoiceNumber: undefined,

  items: [] as IInvoiceItem[],

  notes: "",
  termsAndConditions: "",

  discount: 0,
  shipping: 0,
  validation: {
    attempts: [],
    lastStatus: "draft" as InvoiceStatus,
  } as ValidationResult,
});

// — Errors & Loading Flags —
const errors: any = reactive({
  customer: null,
 
  items: null,
  form: null,
});
//const isSaving = ref(false)
//const isPosting= ref(false)

// — Computed Totals —
// Fallback to qty*rate if no precomputed valueSalesExcludingST
const subTotal = computed(() =>
  invoice.items.reduce(
    (sum, r) =>
      sum + (r.valueSalesExcludingST ?? r.quantity * r.rate),
    0
  )
);
const totalSalesTax = computed(() =>
  invoice.items.reduce(
    (sum, r) => sum + (r.salesTaxApplicable ?? 0),
    0
  )
);
const totalWithheldTax = computed(() =>
  invoice.items.reduce(
    (sum, r) => sum + (r.salesTaxWithheldAtSource ?? 0),
    0
  )
);
const totalExtraTax = computed(() =>
  invoice.items.reduce(
    (sum, r) =>
      sum +
      (r.extraTax ?? 0) +
      (r.furtherTax ?? 0) +
      (r.fedPayable ?? 0),
    0
  )
);
const totalLineDiscount = computed(() =>
  invoice.items.reduce(
    (sum, r) => sum + (r.lineDiscount ?? 0),
    0
  )
);
const grandTotal = computed(
  () =>
    subTotal.value +
    totalSalesTax.value +
    totalExtraTax.value -
    totalWithheldTax.value -
    totalLineDiscount.value -
    (invoice.discount || 0) +
    (invoice.shipping || 0)
);
const fmt = (n: number) => n.toFixed(2);

const showTerms = computed(() => docType !== "credit");
const isValid = computed(
  () =>
    invoice.customerId > 0 &&
    invoice.items.length > 0 &&
    invoice.items.every(
      (it) =>
        it.item.trim() &&
        it.quantity > 0 &&
        it.rate >= 0 &&
        !!it.hsCode &&
        !!it.uomCode
    )
);

// — Lifecycle & Init —
onMounted(async () => {
  await nextTick();
  const [provinces, txTypes, customers] = await Promise.all(
    [
      provinceRepo.getAll(),
      transTypeRepo.getAll(),
      customerRepo.getAll(),
    ]
  );
  provinceOptions.value = provinces.map((p) => ({
    label: p.provinceName,
    value: p.provinceId,
  }));
  transactionTypeOptions.value = txTypes.map((t) => ({
    label: t.transaction_DESC,
    value: t.transaction_TYPE_ID,
  }));
  customerOptions.value = customers;
  //await resetInvoice()
});

// — Handlers —
function setCustomer(c: ICustomer) {
  invoice.customerId = c.id!;
  invoice.customerName = c.name;
  invoice.buyerAddress = c.address || "";
  invoice.buyerNtnCnic = c.ntnCnic || "";
  invoice.buyerRegistrationType = c.ntnCnic
    ? "Registered"
    : "Un-Registered";
  invoice.buyerProvinceCode = c.provinceCode || "";
  errors.customer = null;
}

function onScenarioChange(scn: string) {
  const s = scenarioOptions.find((x) => x.value === scn)!;
  invoice.saleType = s.saleType;
  invoice.transactionTypeId = defaultTransType;
}

function syncItems(rows: IInvoiceItem[]) {
  invoice.items = rows;
}

watch(
  () => [invoice.invoiceDate, invoice.terms],
  ([d, t]) => {
    if (!d) return (invoice.dueDate = "");
    const dt = new Date(d);
    const m = t.match(/Net\s+(\d+)/);
    dt.setDate(dt.getDate() + (m ? +m[1] : 0));
    invoice.dueDate = dt.toISOString().split("T")[0];
  },
  { immediate: true }
);

function validateForm() {
  errors.customer =
    invoice.customerId > 0
      ? null
      : "Please select a buyer.";
  
  errors.items =
    invoice.items.length > 0
      ? null
      : "At least one line item is required.";
  console.log("Validating form:", {
    customer: errors.customer,
    items: errors.items,
  });
  return (
    !errors.customer &&
    !errors.items
  );
}

const isValidating = ref(false);
// — DEBUGGED Validate & Save —
async function validateInvoice() {
  console.log(">> validateInvoice start, invoice:",invoice);

  if (!validateForm()) {
    console.warn(
      "validateForm failed",
      JSON.parse(JSON.stringify(errors))
    );
    return;
  }
  isValidating.value = true;
  try {
    // save or update draft
    if (!invoice.id) {
      console.log("No invoice.id, calling addWithItems...", invoice);
      const ret = await invoiceRepo.addWithItems(invoice);
      console.log("addWithItems returned:", ret);
      invoice.id =
        typeof ret === "number" ? ret : undefined;
    } else {
      console.log(
        "invoice.id exists:",invoice.id);
      await invoiceRepo.update(
        invoice.id,
        invoice as InvoiceHeader
      );
      console.log("update(existing) succeeded");
    }

    // DI validation
    const payload = toDiPayload(invoice);
    console.log("Payload to DI:", payload);
    const res = await validateInvoicePayload(payload);
    console.log("validateInvoicePayload result:", res);

    invoice.validation.attempts.push({
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
      message:
        res.errorMessage ||
        (res.statusCode === "00"
          ? "Validation OK"
          : "Validation error"),
      validationRefNo: res.validationReferenceNo,
    });

    invoice.status =
      res.statusCode === "00"
        ? "validation_success"
        : "validation_failure";
    invoice.validation.lastStatus =
      res.statusCode === "00"
        ? "validation_success"
        : "validation_failure";


    console.log("Setting status to", invoice.status);
    // persist result
    console.log("Persisting status+validation...");


    await invoiceRepo.update(invoice.id!, {
      status: invoice.status,
      validation: invoice.validation,
    } as any);
    console.log("Persisted status+validation");
  } catch (e) {
    console.error("validateInvoice caught error:", e);
    invoice.validation.attempts.push({
      timestamp: new Date().toISOString(),
      statusCode: "xx",
      message: e.message,
    });

    invoice.status = "validation_failure";
    invoice.validation.lastStatus = "validation_failure";
    errors.form = e.message;


    if (invoice.id != null) {
      console.log(
        "Attempting to persist failure status..."
      );
      await invoiceRepo.update(invoice.id, {
        status: invoice.status,
        validation: invoice.validation,
      } as any);
      console.log("Persisted failure status");
    }


  } finally {


    isValidating.value = false;
    console.log("<< validateInvoice end");


  }
}

function printInvoice() {


  console.log("Printing invoice:", invoice);

  window.print();


}

</script>
