import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/dashboard/mock/auth";
import {
  getCheckoutSessionDetail,
  serializeCheckoutSession,
} from "@/lib/dashboard/checkout-sessions/service";
import { buildInvoiceActivity } from "@/lib/dashboard/invoices/activity";
import {
  changeInvoiceCustomer,
  deleteInvoice,
  finalizeInvoice,
  getInvoiceDetail,
  markInvoiceAsPaid,
  sendInvoice,
  serializeInvoice,
  updateInvoice,
  voidInvoice,
} from "@/lib/dashboard/invoices/service";
import { getOrganizationForMember } from "@/lib/dashboard/organizations/settlement-wallet";
import {
  deletePaymentLink,
  getPaymentLinkForOrganization,
  serializePaymentLink,
} from "@/lib/dashboard/payment-links/service";
import { getPaymentsHubCounts } from "@/lib/dashboard/payments/hub-counts";
import {
  getPaymentForOrganization,
  serializePayments,
} from "@/lib/dashboard/payments/service";

const updateInvoiceSchema = z.object({
  description: z.string().nullable().optional(),
  due_at: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.string()).nullable().optional(),
  customer_id: z.string().optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.string().min(1),
        unit_amount: z.string().min(1),
      }),
    )
    .optional(),
});

async function getAuthorizedOrganization(organizationId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const organization = await getOrganizationForMember(
    organizationId,
    session.user.id,
  );

  if (!organization) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { organization };
}

async function getSerializedInvoice(
  organizationId: string,
  environment: "sandbox" | "production",
  invoiceId: string,
) {
  const detail = await getInvoiceDetail(invoiceId, organizationId, environment);

  if (!detail) {
    return null;
  }

  const serialized = serializeInvoice(
    { ...detail.invoice, customerPublicId: detail.customerPublicId },
    {
      checkoutUrl: detail.checkoutUrl,
      checkoutSessionPublicId: detail.checkoutSessionPublicId,
      items: detail.items,
      customerName: detail.customerName,
      customerEmail: detail.customerEmail,
    },
  );

  return {
    ...serialized,
    activity: buildInvoiceActivity({
      status: serialized.status,
      created_at: serialized.created_at,
      updated_at: serialized.updated_at,
      sent_at: serialized.sent_at,
      paid_at: serialized.paid_at,
      checkout_session_id: serialized.checkout_session_id,
      customer_email: serialized.customer_email,
    }),
  };
}

export async function handleOrganizationNestedRoute(
  request: Request,
  organizationId: string,
  segments: string[],
) {
  const authResult = await getAuthorizedOrganization(organizationId);

  if ("error" in authResult) {
    return authResult.error;
  }

  const { organization } = authResult;
  const [resource, ...rest] = segments;

  if (resource === "payment-links" && rest.length === 1 && request.method === "GET") {
    const link = await getPaymentLinkForOrganization(
      rest[0],
      organization.id,
      organization.environment,
    );

    if (!link) {
      return NextResponse.json({ error: "Payment link not found" }, { status: 404 });
    }

    return NextResponse.json(
      await serializePaymentLink(link, { includeItems: true }),
    );
  }

  if (resource === "payment-links" && rest.length === 1 && request.method === "DELETE") {
    try {
      await deletePaymentLink(rest[0], organization.id, organization.environment);
      return NextResponse.json({ deleted: true });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to delete payment link",
        },
        { status: 400 },
      );
    }
  }

  if (resource === "payments" && rest.length === 1 && rest[0] === "counts" && request.method === "GET") {
    const counts = await getPaymentsHubCounts(
      organization.id,
      organization.environment,
    );

    return NextResponse.json({ counts });
  }

  if (resource === "payments" && rest.length === 1 && request.method === "GET") {
    const payment = await getPaymentForOrganization(
      rest[0],
      organization.id,
      organization.environment,
    );

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const [serialized] = await serializePayments([payment]);
    return NextResponse.json(serialized);
  }

  if (
    resource === "checkout-sessions" &&
    rest.length === 1 &&
    request.method === "GET"
  ) {
    const detail = await getCheckoutSessionDetail(
      rest[0],
      organization.id,
      organization.environment,
    );

    if (!detail) {
      return NextResponse.json(
        { error: "Checkout session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      serializeCheckoutSession(detail.session, {
        customerPublicId: detail.customerPublicId,
        paymentPublicId: detail.payment.publicId,
      }),
    );
  }

  if (resource === "invoices" && rest.length === 1 && request.method === "GET") {
    const invoice = await getSerializedInvoice(
      organization.id,
      organization.environment,
      rest[0],
    );

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  }

  if (resource === "invoices" && rest.length === 1 && request.method === "PATCH") {
    const invoiceId = rest[0];
    const body = updateInvoiceSchema.parse(await request.json());

    try {
      if (body.customer_id) {
        await changeInvoiceCustomer(
          invoiceId,
          organization.id,
          organization.environment,
          body.customer_id,
        );
      }

      if (
        body.description !== undefined ||
        body.due_at !== undefined ||
        body.metadata !== undefined ||
        body.items !== undefined
      ) {
        await updateInvoice(invoiceId, organization.id, organization.environment, {
          description: body.description,
          dueAt: body.due_at ? new Date(body.due_at) : undefined,
          metadata: body.metadata,
          items: body.items?.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitAmount: item.unit_amount,
          })),
        });
      }

      const invoice = await getSerializedInvoice(
        organization.id,
        organization.environment,
        invoiceId,
      );

      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      return NextResponse.json(invoice);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Unable to update invoice",
        },
        { status: 400 },
      );
    }
  }

  if (resource === "invoices" && rest.length === 1 && request.method === "DELETE") {
    try {
      await deleteInvoice(rest[0], organization.id, organization.environment);
      return NextResponse.json({ deleted: true });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Unable to delete invoice",
        },
        { status: 400 },
      );
    }
  }

  if (
    resource === "invoices" &&
    rest.length === 2 &&
    request.method === "POST"
  ) {
    const [invoiceId, action] = rest;

    try {
      if (action === "finalize") {
        const result = await finalizeInvoice(
          invoiceId,
          organization.id,
          organization.environment,
        );

        return NextResponse.json({
          invoice: serializeInvoice(result.invoice, {
            checkoutUrl: result.checkoutUrl,
            checkoutSessionPublicId: result.session.publicId,
          }),
          checkout_url: result.checkoutUrl,
        });
      }

      if (action === "send") {
        const result = await sendInvoice(
          invoiceId,
          organization.id,
          organization.environment,
        );

        const detail = await getInvoiceDetail(
          invoiceId,
          organization.id,
          organization.environment,
        );

        if (!detail) {
          return NextResponse.json(
            { error: "Unable to load sent invoice" },
            { status: 500 },
          );
        }

        return NextResponse.json({
          ...serializeInvoice(
            { ...detail.invoice, customerPublicId: detail.customerPublicId },
            {
              checkoutUrl: result.checkoutUrl,
              checkoutSessionPublicId: detail.checkoutSessionPublicId,
            },
          ),
          email_delivered: result.emailDelivered,
          email_logged: result.emailLogged,
        });
      }

      if (action === "void") {
        const invoice = await voidInvoice(
          invoiceId,
          organization.id,
          organization.environment,
        );

        return NextResponse.json(serializeInvoice(invoice));
      }

      if (action === "mark-paid") {
        await markInvoiceAsPaid(
          invoiceId,
          organization.id,
          organization.environment,
        );

        const invoice = await getSerializedInvoice(
          organization.id,
          organization.environment,
          invoiceId,
        );

        if (!invoice) {
          return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        return NextResponse.json(invoice);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to process invoice action";

      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
