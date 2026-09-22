import type { Organization } from "@/lib/dashboard/db/schema";
import { MOCK_INVOICES, MOCK_ORGANIZATION } from "@/lib/dashboard/mock/data";
import type { InvoicePresentation } from "@/lib/dashboard/invoices/presentation";

export async function getInvoiceDetail(
  invoiceId: string,
  organizationId: string,
  _environment: Organization["environment"],
) {
  const invoice = MOCK_INVOICES.find((entry) => entry.id === invoiceId);
  if (!invoice || organizationId !== MOCK_ORGANIZATION.id) {
    return null;
  }

  return {
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      status: invoice.status,
      amount: invoice.amount,
      currencyCode: invoice.currency_code,
      description: invoice.description,
      dueAt: invoice.due_at ? new Date(invoice.due_at) : null,
      createdAt: new Date(invoice.created_at),
      customerName: invoice.customer_name,
      customerEmail: invoice.customer_email,
    },
    customerPublicId: invoice.customer_id,
    customerName: invoice.customer_name,
    customerEmail: invoice.customer_email,
    checkoutUrl: invoice.checkout_url,
    checkoutSessionPublicId: invoice.checkout_session_id,
    items: invoice.items,
  };
}

export async function buildInvoicePresentation(
  invoice: {
    invoiceNumber: string;
    status: string;
    amount: string;
    currencyCode: string;
    description: string | null;
    dueAt: Date | null;
    createdAt: Date;
    customerName: string | null;
    customerEmail: string | null;
  },
  options?: { checkoutUrl?: string | null },
): Promise<InvoicePresentation> {
  return {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    amount: invoice.amount,
    asset: invoice.currencyCode,
    currencyCode: invoice.currencyCode,
    description: invoice.description,
    dueAt: invoice.dueAt,
    createdAt: invoice.createdAt,
    environmentLabel: "Sandbox",
    organization: {
      name: MOCK_ORGANIZATION.name,
      logoUrl: MOCK_ORGANIZATION.logoUrl,
      logoInitials: MOCK_ORGANIZATION.logoInitials,
    },
    customer: {
      name: invoice.customerName,
      email: invoice.customerEmail,
    },
    items: [
      {
        id: "item_001",
        description: "Consulting hours",
        quantity: "10",
        unitAmount: "25.00",
        lineAmount: "250.00",
      },
    ],
    allowedAssets: ["USDC", "XLM"],
    checkoutUrl: options?.checkoutUrl ?? null,
  };
}
