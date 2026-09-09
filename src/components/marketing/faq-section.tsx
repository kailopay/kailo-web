import { EARLY_ACCESS_URL, faqItems } from "@/content/landing";

import { FaqAccordion } from "./faq-accordion";
import { MarketingButton } from "../ui/marketing-button";
import { MarketingContainer } from "../ui/marketing-container";

export function FaqSection() {
  return (
    <section className="bg-paper px-8 pb-[104px] pt-24">
      <MarketingContainer className="flex flex-wrap items-start gap-[clamp(40px,7vw,110px)]">
        <h2 className="m-0 min-w-[250px] flex-[0_1_300px] whitespace-pre-line font-display text-[clamp(28px,3.4vw,44px)] font-bold leading-[1.06] tracking-[-0.028em] text-ink [font-stretch:108%]">
          Frequently{"\n"}asked questions
        </h2>
        <FaqAccordion items={faqItems} />
      </MarketingContainer>
    </section>
  );
}

export function ClosingCtaSection() {
  return (
    <section className="bg-paper-warm-2 px-8 py-[104px] text-center">
      <h2 className="mx-auto mb-9 max-w-[22ch] font-display text-[clamp(30px,4.4vw,58px)] font-bold leading-[1.04] tracking-[-0.032em] text-ink [font-stretch:112%]">
        Build the IDR on-ramp and off-ramp corridor on Stellar.
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        <MarketingButton href={EARLY_ACCESS_URL} external size="lg">
          Book a demo
        </MarketingButton>
      </div>
    </section>
  );
}
