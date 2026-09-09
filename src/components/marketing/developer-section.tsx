import { EARLY_ACCESS_URL } from "@/content/landing";

import { MarketingButton } from "../ui/marketing-button";
import { MarketingContainer } from "../ui/marketing-container";

export function DeveloperSection() {
  return (
    <section className="bg-ground px-5 py-[88px] sm:px-8">
      <MarketingContainer>
        <div className="flex flex-wrap items-center gap-14">
          <div className="min-w-[300px] flex-[1_1_340px] text-center md:text-left">
            <h2 className="mb-[18px] mx-auto max-w-[20ch] font-display text-[clamp(26px,3vw,40px)] font-bold leading-[1.08] tracking-[-0.028em] text-white [font-stretch:108%] md:mx-0">
              Built for developers. One endpoint for on-ramp and off-ramp.
            </h2>
            <p className="mx-auto mb-[30px] max-w-[46ch] text-[15.5px] leading-[1.65] text-ink-muted md:mx-0">
              API infrastructure for IDR on-ramp and off-ramp on Stellar.
              Integrate QRIS, bank transfer, and e-wallet checkout into your
              app with sandbox test keys.
            </p>
            <MarketingButton href={EARLY_ACCESS_URL} external size="md">
              Book a demo
            </MarketingButton>
          </div>

          <div className="min-w-[320px] flex-[1_1_420px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-ground-deep">
            <img
              src="/marketing/developer-integration.jpg"
              alt="Merchant accepting a contactless mobile payment at checkout"
              className="block min-h-[380px] w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-9 border-t border-white/[0.09] pt-[38px] text-center md:grid-cols-3 md:text-left">
          <div>
            <h3 className="mb-[9px] text-[15px] font-semibold text-[#F0F2F6]">
              KYC and AML checks
            </h3>
            <p className="m-0 text-[14px] leading-[1.6] text-[#7E8CA0]">
              Counterparties are verified before they can trade on the network.
            </p>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
