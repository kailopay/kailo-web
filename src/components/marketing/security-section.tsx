import { securityFeatures } from "@/content/landing";

import { MarketingContainer } from "../ui/marketing-container";

export function SecuritySection() {
  return (
    <section className="bg-paper px-5 py-[88px] sm:px-8">
      <MarketingContainer>
        <h2 className="mb-9 text-center font-display text-[clamp(28px,3.4vw,44px)] font-bold leading-[1.08] tracking-[-0.028em] text-ink [font-stretch:108%] md:text-left">
          Secure payments
        </h2>
        <div className="relative flex min-h-[560px] items-end overflow-hidden rounded-[28px] bg-[#E9E9E5]">
          <img
            src="/marketing/secure-payments.webp"
            alt="A hand holding a phone that shows a completed, securely verified payment"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative grid w-full grid-cols-2 gap-3.5 p-[18px] md:grid-cols-4">
            {securityFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[18px] bg-[rgba(250,250,248,.9)] p-5 backdrop-blur-[16px]"
              >
                <h3 className="mb-2 text-[15px] font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="m-0 text-[13.5px] leading-[1.55] text-[#4A5665]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
