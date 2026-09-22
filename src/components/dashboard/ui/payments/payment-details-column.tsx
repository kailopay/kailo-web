import Link from "next/link";
import type { Organization } from "@/lib/dashboard/db/schema";
import type { PaymentRow } from "@/lib/dashboard/payments/types";
import { getStellarExpertTxUrlIfValid } from "@/lib/dashboard/stellar/explorer";
import {
  CalendarIcon,
  CopyText,
  StatusBadge,
  TimestampTooltip,
} from "@dub/ui";
import { CreditCard, Users } from "@dub/ui/icons";
import { Wallet } from "lucide-react";
import { cn } from "@dub/utils";
import type { HTMLProps } from "react";
import { SmoothSkeleton } from "@/components/dashboard/ui/shared/smooth-skeleton";
import {
  CONFIDENTIAL_PAYER_DESCRIPTION,
  CONFIDENTIAL_PAYER_LABEL,
  formatMerchantSettlementAmount,
  formatQuotedMerchantSettlementAmount,
  formatPaidAmount,
  getPaymentStatusVariant,
  hasSettlementFallback,
  isConfidentialPayment,
} from "./payment-formatters";

export function PaymentDetailsColumn({
  payment,
  environment,
  isLoading = false,
}: {
  payment?: PaymentRow;
  environment: Organization["environment"];
  isLoading?: boolean;
}) {
  const txExplorerUrl = payment?.tx_hash
    ? getStellarExpertTxUrlIfValid(payment.tx_hash, environment)
    : null;

  const basicFields = [
    payment?.customer_id
      ? {
          id: "customer",
          icon: <Users className="size-3.5 shrink-0" />,
          text: (
            <Link
              href={`/dashboard/customers/${payment.customer_id}`}
              className="min-w-0 break-all text-xs font-medium underline decoration-dotted underline-offset-2"
            >
              {payment.customer_id}
            </Link>
          ),
        }
      : null,
    isConfidentialPayment(payment ?? { payment_flow: undefined })
      ? {
          id: "payer",
          icon: <Wallet className="size-3.5 shrink-0" />,
          text: (
            <span className="text-xs text-neutral-600">
              <span className="font-medium text-neutral-900">
                {CONFIDENTIAL_PAYER_LABEL}
              </span>
              <span className="mt-0.5 block text-neutral-500">
                {CONFIDENTIAL_PAYER_DESCRIPTION}
              </span>
            </span>
          ),
        }
      : payment?.payer_address
      ? {
          id: "payer",
          icon: <Wallet className="size-3.5 shrink-0" />,
          text: (
            <CopyText
              value={payment.payer_address}
              className="min-w-0 break-all text-left font-mono text-xs font-medium"
            >
              {payment.payer_address}
            </CopyText>
          ),
        }
      : null,
    payment?.tx_hash
      ? {
          id: "tx",
          icon: <CreditCard className="size-3.5 shrink-0" />,
          text: txExplorerUrl ? (
            <a
              href={txExplorerUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 break-all font-mono text-xs font-medium underline decoration-dotted underline-offset-2 hover:underline"
            >
              {payment.tx_hash}
            </a>
          ) : (
            <CopyText
              value={payment.tx_hash}
              className="min-w-0 break-all text-left font-mono text-xs font-medium"
            >
              {payment.tx_hash}
            </CopyText>
          ),
        }
      : null,
    payment?.created_at
      ? {
          id: "created",
          icon: <CalendarIcon className="size-3.5 shrink-0" />,
          text: (
            <span>
              Created{" "}
              <TimestampTooltip
                timestamp={payment.created_at}
                rows={["local", "utc"]}
                side="left"
              >
                <span>
                  {new Date(payment.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </TimestampTooltip>
            </span>
          ),
        }
      : null,
    payment?.confirmed_at
      ? {
          id: "confirmed",
          icon: <CalendarIcon className="size-3.5 shrink-0" />,
          text: (
            <span>
              Confirmed{" "}
              <TimestampTooltip
                timestamp={payment.confirmed_at}
                rows={["local", "utc"]}
                side="left"
              >
                <span>
                  {new Date(payment.confirmed_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </TimestampTooltip>
            </span>
          ),
        }
      : null,
    payment?.expires_at
      ? {
          id: "expires",
          icon: <CalendarIcon className="size-3.5 shrink-0" />,
          text: (
            <span>
              Expires{" "}
              <TimestampTooltip
                timestamp={payment.expires_at}
                rows={["local", "utc"]}
                side="left"
              >
                <span>
                  {new Date(payment.expires_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </TimestampTooltip>
            </span>
          ),
        }
      : null,
  ].filter((field): field is NonNullable<typeof field> => field !== null);

  return (
    <div className="grid grid-cols-1 gap-6 overflow-hidden text-sm text-neutral-900">
      <div className="border-border-subtle flex flex-col divide-y divide-neutral-200 rounded-xl border bg-white">
        <div className="p-4">
          <div className="bg-bg-subtle flex size-10 items-center justify-center rounded-full border border-neutral-100">
            <CreditCard className="size-4 text-neutral-600" />
          </div>

          <div className="mt-3">
            {payment ? (
              <div className="flex flex-col items-start gap-1 text-left">
                <span className="text-content-emphasis text-base font-semibold">
                  {formatPaidAmount(payment)}
                </span>
                <span className="text-xs text-neutral-500">
                  Merchant receives: {formatMerchantSettlementAmount(payment)}
                  {hasSettlementFallback(payment) ? (
                    <span className="mt-0.5 block text-red-600">
                      Quoted {formatQuotedMerchantSettlementAmount(payment)}
                    </span>
                  ) : null}
                </span>
                <CopyText
                  value={payment.id}
                  className="block w-full break-all text-left font-mono text-xs text-neutral-500"
                >
                  {payment.id}
                </CopyText>
              </div>
            ) : (
              <div className="space-y-2">
                <SmoothSkeleton className="h-5 w-32" />
                <SmoothSkeleton className="h-3 w-24" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 p-4">
          {payment ? (
            <StatusBadge
              variant={getPaymentStatusVariant(payment.status)}
              icon={null}
            >
              {payment.status}
            </StatusBadge>
          ) : null}

          {isLoading && !payment
            ? ["w-32", "w-40", "w-28"].map((width) => (
                <SmoothSkeleton key={width} className={cn("h-4", width)} />
              ))
            : basicFields.map(({ id, icon, text }) => (
                <div key={id} className="text-content-default flex items-start gap-1.5">
                  <span className="mt-0.5">{icon}</span>
                  <span className="min-w-0 flex-1 text-xs font-medium">{text}</span>
                </div>
              ))}
        </div>

        <div className="p-4">
          <DetailHeading>Description</DetailHeading>
          <div className="mt-2.5 text-xs text-neutral-600">
            {isLoading && !payment ? (
              <SmoothSkeleton className="h-16 w-full rounded-lg" />
            ) : (
              <p className="whitespace-pre-wrap break-words">
                {payment?.description?.trim() ? payment.description : "No description."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailHeading({ className, ...rest }: HTMLProps<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-content-emphasis text-xs font-semibold", className)}
      {...rest}
    />
  );
}
