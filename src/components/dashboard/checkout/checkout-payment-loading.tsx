import { LoadingSpinner } from "@dub/ui/icons";
import { cn } from "@dub/utils";
import { CheckoutPaymentLoadingIndicator } from "@/components/dashboard/checkout/checkout-payment-loading-indicator";

export { CheckoutPaymentLoadingIndicator };

type CheckoutPaymentSpinnerProps = {
  className?: string;
  size?: "sm" | "md";
};

const spinnerSizeClasses = {
  sm: "size-4",
  md: "size-5",
} as const;

export function CheckoutPaymentSpinner({
  className,
  size = "sm",
}: CheckoutPaymentSpinnerProps) {
  return <LoadingSpinner className={cn(spinnerSizeClasses[size], className)} />;
}

export type CheckoutPaymentWaitingVariant =
  | "paying"
  | "confirming"
  | "processing"
  | "checking";

const waitingCopy: Record<
  CheckoutPaymentWaitingVariant,
  { title: string; description: string }
> = {
  paying: {
    title: "Submitting payment",
    description: "Confirm the transaction in your wallet if prompted.",
  },
  confirming: {
    title: "Confirming payment",
    description: "Waiting for on-chain confirmation. This page will update automatically.",
  },
  processing: {
    title: "Processing payment",
    description: "Your payment was detected and is being processed.",
  },
  checking: {
    title: "Checking payment",
    description: "Looking for your transfer on the network.",
  },
};

export function CheckoutPaymentWaitingBanner({
  variant,
}: {
  variant: CheckoutPaymentWaitingVariant;
}) {
  const copy = waitingCopy[variant];

  return (
    <CheckoutPaymentLoadingIndicator title={copy.title} description={copy.description} />
  );
}

export function getCheckoutPaymentWaitingVariant(input: {
  isProcessing: boolean;
  isPaying: boolean;
  isConfirming: boolean;
}): CheckoutPaymentWaitingVariant | null {
  if (input.isProcessing) {
    return "processing";
  }

  if (input.isPaying) {
    return "paying";
  }

  if (input.isConfirming) {
    return "confirming";
  }

  return null;
}
