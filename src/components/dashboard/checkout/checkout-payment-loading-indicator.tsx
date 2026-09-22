"use client";

import dynamic from "next/dynamic";
import paymentLoadingAnimation from "../../../../public/lottie/payment-loading.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function CheckoutPaymentLoadingIndicator({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-8 text-center">
      <div className="h-36 w-72 overflow-hidden">
        <Lottie
          animationData={paymentLoadingAnimation}
          loop
          className="h-52 w-full -translate-y-2"
          rendererSettings={{
            preserveAspectRatio: "xMidYMid slice",
          }}
          aria-hidden
        />
      </div>
      <p className="mt-2 text-sm font-medium text-neutral-900">{title}</p>
      {description ? <p className="mt-1 max-w-xs text-sm text-neutral-500">{description}</p> : null}
    </div>
  );
}
