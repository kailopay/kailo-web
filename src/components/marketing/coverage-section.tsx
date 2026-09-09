import { coverageStats } from "@/content/landing";

import { StatGrid } from "../ui/stat-grid";
import { MarketingContainer } from "../ui/marketing-container";

export function CoverageSection() {
  return (
    <section className="bg-paper-warm-2 pt-24">
      <MarketingContainer className="mb-11 px-8 text-center md:text-left">
        <h2 className="mx-auto mb-5 max-w-[24ch] font-display text-[clamp(28px,3.6vw,46px)] font-bold leading-[1.06] tracking-[-0.03em] text-ink [font-stretch:108%] md:mx-0">
          Built for how Indonesia already pays.
        </h2>
        <p className="mx-auto m-0 max-w-[58ch] text-[16px] leading-[1.6] text-ink-body md:mx-0">
          QRIS, bank transfer, and e-wallet checkout for on-ramp and off-ramp on
          Stellar testnet, with sandbox flows you can demo end to end today.
        </p>
      </MarketingContainer>

      <iframe
        src="/coverage-map.html"
        title="Coverage map"
        loading="lazy"
        className="block h-[520px] w-full border-0"
      />

      <MarketingContainer className="px-8">
        <StatGrid items={coverageStats} />
      </MarketingContainer>

      <div className="h-[88px]" />
    </section>
  );
}
