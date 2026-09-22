"use client";

import dynamic from "next/dynamic";
import paymentSuccessAnimation from "../../../../public/lottie/payment-success.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function CheckoutPaymentSuccessIndicator({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-8 text-center">
      <div className="flex h-36 w-72 items-center justify-center">
        <Lottie
          animationData={paymentSuccessAnimation}
          loop={false}
          className="h-full w-full"
          rendererSettings={{
            preserveAspectRatio: "xMidYMid meet",
          }}
          aria-hidden
        />
      </div>
      <p className="mt-2 text-sm font-medium text-neutral-900">{title}</p>
      {description ? <p className="mt-1 max-w-xs text-sm text-neutral-500">{description}</p> : null}
    </div>
  );
}
