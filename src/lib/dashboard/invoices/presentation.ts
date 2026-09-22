import { formatInvoiceAmount } from "@/lib/dashboard/invoices/amount";

export type InvoicePresentation = {
  invoiceNumber: string;
  status: string;
  amount: string;
  /** @deprecated Use currencyCode */
  asset: string;
  currencyCode: string;
  description: string | null;
  dueAt: Date | null;
  createdAt: Date;
  environmentLabel?: string | null;
  organization: {
    name: string;
    logoUrl: string | null;
    logoInitials: string;
  };
  customer: {
    name: string | null;
    email: string | null;
  };
  items: {
    id?: string;
    description: string;
    quantity: string;
    unitAmount: string;
    lineAmount: string;
  }[];
  allowedAssets?: string[];
  checkoutUrl?: string | null;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function buildInvoiceEmailText(input: InvoicePresentation) {
  const payUrl = input.checkoutUrl ?? "";
  const lines = [
    `${input.organization.name} sent you invoice ${input.invoiceNumber}`,
    `Amount due: ${formatInvoiceAmount(input.amount, input.currencyCode)}`,
    `Due date: ${formatDate(input.dueAt)}`,
    "",
    "Items:",
    ...input.items.map(
      (item) =>
        `- ${item.description} (${item.quantity} x ${formatInvoiceAmount(item.unitAmount, input.currencyCode)}) = ${formatInvoiceAmount(item.lineAmount, input.currencyCode)}`,
    ),
    "",
    `Pay invoice: ${payUrl}`,
  ];

  return lines.join("\n");
}
