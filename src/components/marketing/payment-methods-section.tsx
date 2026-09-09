import { paymentMethodLogos, type PaymentMethodLogo } from "@/content/landing";

import { MarqueeRow } from "../ui/marquee-row";
import { MarketingContainer } from "../ui/marketing-container";

function PaymentLogo({ name, src }: { name: string; src: string }) {
  return (
    <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-full bg-white shadow-card-soft">
      <img
        src={src}
        alt={name}
        className="block h-[52px] w-[52px] object-contain"
      />
    </div>
  );
}

function rotateLogos<T>(logos: readonly T[], offset: number): T[] {
  if (logos.length === 0) {
    return [];
  }

  const shift = ((offset % logos.length) + logos.length) % logos.length;
  return [...logos.slice(shift), ...logos.slice(0, shift)];
}

function renderLogos(logos: readonly PaymentMethodLogo[]) {
  return logos.map((logo) => <PaymentLogo key={logo.src} {...logo} />);
}

const secondaryRowLogos = rotateLogos(
  paymentMethodLogos,
  Math.floor(paymentMethodLogos.length / 2) + 5,
);

export function PaymentMethodsSection() {
  return (
    <section className="overflow-hidden border-y border-ink/[0.07] bg-paper-warm-2 pb-[52px] pt-14">
      <MarketingContainer className="mb-10 px-8 text-center md:text-left">
        <h2 className="mx-auto mb-3 max-w-[22ch] font-display text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.02em] text-ink [font-stretch:108%] md:mx-0">
          One integration, 30+ Indonesian payment methods
        </h2>
        <p className="mx-auto m-0 max-w-[52ch] text-[15px] leading-[1.6] text-ink-body md:mx-0">
          The same rails Indonesians already use: QRIS, bank transfer, and
          e-wallets, for on-ramp and off-ramp between IDR and XLM on Stellar.
        </p>
      </MarketingContainer>

      <div
        style={{
          maskImage:
            "linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)",
        }}
      >
        <MarqueeRow direction="left" duration={88}>
          {renderLogos(paymentMethodLogos)}
        </MarqueeRow>

        <MarqueeRow direction="right" duration={124} delay={-42}>
          {renderLogos(secondaryRowLogos)}
        </MarqueeRow>
      </div>

      <MarketingContainer className="mt-9 px-8 text-center md:text-left">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A94A3]">
          30+ Indonesian payment methods
        </span>
      </MarketingContainer>
    </section>
  );
}
