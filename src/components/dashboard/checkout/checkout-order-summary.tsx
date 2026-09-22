"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@dub/utils";
import { BusinessMark } from "@/components/dashboard/business/business-mark";
import { formatInvoiceAmount } from "@/lib/dashboard/invoices/amount";
import { getInvoiceCurrency, type InvoiceCurrencyCode } from "@/lib/dashboard/invoices/currencies";
import { formatAmountWithUnit, formatTokenWithAsset } from "@/lib/dashboard/format/amount";
import type { CheckoutData } from "./checkout-types";
import type { CheckoutLineItem } from "@/lib/dashboard/checkout/line-items";

function formatCheckoutDueDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sumLineItemAmounts(items: CheckoutLineItem[], currencyCode: string, hasPricing: boolean) {
  const total = items.reduce((sum, item) => sum + Number(item.line_amount), 0);

  if (!hasPricing) {
    return String(total);
  }

  const currency = getInvoiceCurrency(currencyCode as InvoiceCurrencyCode);

  if (!currency) {
    return String(total);
  }

  if (currency.decimals === 0) {
    return String(Math.round(total));
  }

  return total.toFixed(currency.decimals);
}

function whenDesktop(embedded: boolean, classes?: string) {
  if (embedded || !classes) {
    return undefined;
  }

  return classes;
}

function DetailRow({
  label,
  children,
  disabled,
  embedded = false,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  embedded?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4",
        disabled ? "py-2" : cn("py-1.5", whenDesktop(embedded, "@lg:gap-6 @lg:py-2.5")),
      )}
    >
      <span
        className={cn(
          "shrink-0 text-neutral-500",
          disabled ? "text-[10px]" : cn("text-[11px]", whenDesktop(embedded, "@lg:text-xs")),
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 text-right text-neutral-900",
          disabled ? "text-xs" : cn("text-xs", whenDesktop(embedded, "@lg:text-sm")),
        )}
      >
        {children}
      </span>
    </div>
  );
}

type CheckoutOrderSummaryProps = {
  data: CheckoutData;
  lineItems: CheckoutLineItem[];
  sourceLabel: string;
  hasPricing: boolean;
  currencyCode: string;
  settlementLabel: string;
  disabled?: boolean;
  embedded?: boolean;
  isMobileItemsOpen: boolean;
  setIsMobileItemsOpen: (open: boolean) => void;
};

export function CheckoutOrderSummary({
  data,
  lineItems,
  sourceLabel,
  hasPricing,
  currencyCode,
  settlementLabel,
  disabled = false,
  embedded = false,
  isMobileItemsOpen,
  setIsMobileItemsOpen,
}: CheckoutOrderSummaryProps) {
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  const totalLabel = hasPricing
    ? formatInvoiceAmount(data.payment.pricing_amount!, data.payment.pricing_currency!)
    : data.payment.amount
      ? formatTokenWithAsset(data.payment.amount, settlementLabel)
      : "—";

  const memo = data.invoice?.memo ?? data.merchant_memo ?? null;
  const referenceLabel = data.invoice ? data.invoice.invoice_number : sourceLabel;

  const hasInvoiceDetails = Boolean(data.invoice);
  const hasMemo = Boolean(memo);
  const hasLineItems = lineItems.length > 0;
  const hasDescriptionOnly =
    !hasInvoiceDetails && !hasMemo && !hasLineItems && Boolean(data.payment.description?.trim());
  const hasBody = hasInvoiceDetails || hasMemo || hasLineItems || hasDescriptionOnly;
  const subtotalAmount = hasLineItems ? sumLineItemAmounts(lineItems, currencyCode, hasPricing) : null;

  function formatLineAmount(amount: string) {
    if (hasPricing) {
      return formatAmountWithUnit(amount, currencyCode);
    }

    return formatTokenWithAsset(amount, settlementLabel);
  }

  return (
    <div
      className={cn(
        "flex-none border-b border-neutral-200/60 bg-neutral-50",
        whenDesktop(embedded, "@lg:flex @lg:flex-1 @lg:justify-end @lg:border-b-0 @lg:border-r"),
      )}
    >
      <div
        className={cn(
          "w-full max-w-sm text-left",
          embedded ? "mx-auto" : cn("mx-auto", whenDesktop(embedded, "@lg:mx-0 @lg:ml-auto")),
          disabled ? "px-4 pb-5 pt-5" : cn("px-4 pb-4 pt-4", whenDesktop(embedded, "@lg:px-6 @lg:pb-10 @lg:pl-10 @lg:pr-20 @lg:pt-12")),
        )}
      >
        <div className="flex items-center gap-2.5 @lg:gap-3">
          {data.merchant ? (
            <div
              className={cn(
                "shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-200/80",
                disabled ? "size-9" : cn("size-8", whenDesktop(embedded, "@lg:size-10")),
              )}
            >
              <BusinessMark
                organization={{
                  name: data.merchant.name,
                  logoUrl: data.merchant.logoUrl,
                  logoInitials: data.merchant.logoInitials,
                }}
                className="size-full"
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <p
              className={cn(
                "truncate font-medium text-neutral-900",
                disabled ? "text-sm" : cn("text-sm", whenDesktop(embedded, "@lg:text-base")),
              )}
            >
              {data.merchant?.name ?? "Merchant"}
            </p>
            <p
              className={cn(
                "truncate text-neutral-500",
                disabled ? "text-[10px]" : cn("text-[11px]", whenDesktop(embedded, "@lg:text-xs")),
              )}
            >
              {referenceLabel}
            </p>
          </div>
        </div>

        <div className={cn(disabled ? "mt-5" : cn("mt-3", whenDesktop(embedded, "@lg:mt-6")))}>
          <p
            className={cn(
              "text-neutral-500",
              disabled ? "text-[10px]" : cn("text-[11px]", whenDesktop(embedded, "@lg:text-xs")),
            )}
          >
            Amount due
          </p>
          <p
            className={cn(
              "mt-0.5 font-semibold tracking-tight text-neutral-950 tabular-nums",
              disabled ? "text-2xl" : cn("text-2xl", whenDesktop(embedded, "@lg:mt-1 @lg:text-3xl @lg:text-[2rem]")),
            )}
          >
            {totalLabel}
          </p>
        </div>

        {hasBody ? (
          <div
            className={cn(
              "border-t border-neutral-200/80",
              disabled ? "mt-6 pt-4" : cn("mt-4 pt-3", whenDesktop(embedded, "@lg:mt-8 @lg:pt-5")),
            )}
          >
            {(hasInvoiceDetails || hasMemo) && !embedded ? (
              <div className={whenDesktop(embedded, "@lg:hidden")}>
                <button
                  type="button"
                  onClick={() => setIsMobileDetailsOpen(!isMobileDetailsOpen)}
                  className="flex w-full items-center justify-between py-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-800"
                >
                  <span>Order details</span>
                  <svg
                    className={cn("size-3.5 transition-transform", isMobileDetailsOpen && "rotate-180")}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence initial={false}>
                  {isMobileDetailsOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="space-y-1 overflow-hidden pb-1"
                    >
                      {hasInvoiceDetails ? (
                        <div className="space-y-0.5">
                          <DetailRow label="Bill to" disabled={disabled} embedded={embedded}>
                            {data.invoice!.customer.name ?? data.invoice!.customer.email ?? "Customer"}
                          </DetailRow>
                          {data.invoice!.customer.name && data.invoice!.customer.email ? (
                            <DetailRow label="Email" disabled={disabled} embedded={embedded}>
                              {data.invoice!.customer.email}
                            </DetailRow>
                          ) : null}
                          {data.invoice!.due_at ? (
                            <DetailRow label="Due date" disabled={disabled} embedded={embedded}>
                              {formatCheckoutDueDate(data.invoice!.due_at)}
                            </DetailRow>
                          ) : null}
                        </div>
                      ) : null}
                      {hasMemo ? (
                        <div className={cn(hasInvoiceDetails ? "mt-1" : undefined)}>
                          <DetailRow label="Memo" disabled={disabled} embedded={embedded}>
                            <span className="whitespace-pre-wrap">{memo}</span>
                          </DetailRow>
                        </div>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}

            {hasInvoiceDetails ? (
              <div className={cn("space-y-4", whenDesktop(embedded, "hidden @lg:block"))}>
                <DetailRow label="Bill to" disabled={disabled} embedded={embedded}>
                  {data.invoice!.customer.name ?? data.invoice!.customer.email ?? "Customer"}
                </DetailRow>
                {data.invoice!.customer.name && data.invoice!.customer.email ? (
                  <DetailRow label="Email" disabled={disabled} embedded={embedded}>
                    {data.invoice!.customer.email}
                  </DetailRow>
                ) : null}
                {data.invoice!.due_at ? (
                  <DetailRow label="Due date" disabled={disabled} embedded={embedded}>
                    {formatCheckoutDueDate(data.invoice!.due_at)}
                  </DetailRow>
                ) : null}
              </div>
            ) : null}

            {hasMemo ? (
              <div className={cn(hasInvoiceDetails ? "mt-4" : undefined, whenDesktop(embedded, "hidden @lg:block"))}>
                <DetailRow label="Memo" disabled={disabled} embedded={embedded}>
                  <span className="whitespace-pre-wrap">{memo}</span>
                </DetailRow>
              </div>
            ) : null}

            {hasLineItems ? (
              <div className={cn(hasInvoiceDetails || hasMemo ? cn("mt-2", whenDesktop(embedded, "@lg:mt-4")) : undefined)}>
                <div className={whenDesktop(embedded, "@lg:hidden")}>
                  <button
                    type="button"
                    onClick={() => setIsMobileItemsOpen(!isMobileItemsOpen)}
                    className="flex w-full items-center justify-between py-1.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-800"
                  >
                    <span>
                      {lineItems.length} item{lineItems.length === 1 ? "" : "s"}
                    </span>
                    <svg
                      className={cn("size-3.5 transition-transform", isMobileItemsOpen && "rotate-180")}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {isMobileItemsOpen ? (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="space-y-2 overflow-hidden pb-1"
                      >
                        {lineItems.map((item, index) => (
                          <li key={index} className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs text-neutral-900">{item.description}</p>
                              <p className="mt-0.5 text-[11px] text-neutral-500">
                                {item.quantity} × {formatLineAmount(item.unit_amount)}
                              </p>
                            </div>
                            <p className="shrink-0 text-xs tabular-nums text-neutral-900">
                              {formatLineAmount(item.line_amount)}
                            </p>
                          </li>
                        ))}
                      </motion.ul>
                    ) : null}
                  </AnimatePresence>
                </div>

                <ul className={cn("hidden space-y-3", whenDesktop(embedded, "@lg:block"))}>
                  {lineItems.map((item, index) => (
                    <li
                      key={`${item.description}-${index}`}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className={cn("text-neutral-900", disabled ? "text-xs" : "text-sm")}>{item.description}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {item.quantity} × {formatLineAmount(item.unit_amount)}
                        </p>
                      </div>
                      <p className={cn("shrink-0 tabular-nums text-neutral-900", disabled ? "text-xs" : "text-sm")}>
                        {formatLineAmount(item.line_amount)}
                      </p>
                    </li>
                  ))}
                </ul>

                {subtotalAmount ? (
                  <div
                    className={cn(
                      "flex items-baseline justify-between gap-4 border-t border-neutral-200/80",
                      disabled ? "mt-4 pt-4" : cn("mt-3 pt-3", whenDesktop(embedded, "@lg:mt-5 @lg:pt-5")),
                    )}
                  >
                    <span
                      className={cn(
                        "text-neutral-500",
                        disabled ? "text-[10px]" : cn("text-[11px]", whenDesktop(embedded, "@lg:text-xs")),
                      )}
                    >
                      Subtotal
                    </span>
                    <span
                      className={cn(
                        "tabular-nums text-neutral-900",
                        disabled ? "text-xs" : cn("text-xs", whenDesktop(embedded, "@lg:text-sm")),
                      )}
                    >
                      {formatLineAmount(subtotalAmount)}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : hasDescriptionOnly ? (
              <DetailRow label="Description" disabled={disabled} embedded={embedded}>
                {data.payment.description}
              </DetailRow>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
