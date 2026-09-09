import { BRAND_NAME } from "@/content/landing";

import { MarketingContainer } from "../ui/marketing-container";

export function FasterPayoutsSection() {
  return (
    <section className="bg-paper-warm-2 px-5 py-[88px] sm:px-8">
      <MarketingContainer>
        <h2 className="mx-auto mb-12 max-w-[20ch] text-center font-display text-[clamp(28px,3.4vw,44px)] font-bold leading-[1.08] tracking-[-0.028em] text-ink [font-stretch:108%] md:mx-0 md:text-left">
          Faster local settlement in IDR
        </h2>

        <div className="grid grid-cols-1 items-stretch gap-[18px] md:grid-cols-3">
          <article className="flex flex-col overflow-hidden rounded-[18px] border border-ink/[0.08] bg-white px-7 pb-0 pt-7">
            <h3 className="mb-3 text-center font-display text-[20px] font-bold leading-[1.25] tracking-[-0.018em] md:text-left">
              <span className="text-action">Pay locally</span>{" "}
              <span className="text-ink">in minutes</span>
            </h3>
            <p className="mb-[26px] text-center text-[14.5px] leading-[1.6] text-ink-body md:text-left">
              Skip global card rails. Settle through QRIS and local bank
              transfers that already move Rupiah across Indonesia.
            </p>
            <div className="relative mt-auto h-[190px]">
              <div className="absolute left-[22px] right-[22px] top-4 -rotate-3 rounded-[14px] border border-ink/[0.07] bg-paper-warm p-4">
                <div className="font-display text-[26px] font-bold tracking-[-0.03em] text-[#C3C7CF]">
                  Rp 160.000
                </div>
                <div className="mt-2 flex items-center gap-[7px]">
                  <img
                    src="/marketing/payment-channels/qris.svg"
                    alt=""
                    className="block h-[15px] w-[15px] flex-none rounded-full object-contain"
                  />
                  <span className="text-[11px] font-semibold text-[#B4B9C4]">
                    IDR
                  </span>
                </div>
              </div>
              <div className="absolute left-9 right-2 top-[86px] rounded-[14px] border border-ink/[0.09] bg-white p-3 shadow-[0_6px_18px_rgba(22,34,51,.08)]">
                <div className="mb-[7px] flex items-center gap-2 rounded-[9px] bg-paper-warm px-2.5 py-[9px]">
                  <span className="text-[11px] text-action">↗</span>
                  <span className="text-[11.5px] font-semibold text-[#3A4657]">
                    Send money
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-[9px] bg-paper-warm px-2.5 py-[9px]">
                  <span className="text-[11px] text-action">↘</span>
                  <span className="text-[11.5px] font-semibold text-[#3A4657]">
                    Receive money
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article className="flex flex-col overflow-hidden rounded-[18px] border border-ink/[0.08] bg-white px-7 pb-0 pt-7">
            <h3 className="mb-3 text-center font-display text-[20px] font-bold leading-[1.25] tracking-[-0.018em] md:text-left">
              <span className="text-action">Unlock</span>{" "}
              <span className="text-ink">new revenue</span>
            </h3>
            <p className="mb-[26px] text-center text-[14.5px] leading-[1.6] text-ink-body md:text-left">
              Let users buy and sell XLM inside your product, then cash out to
              IDR through the same local rails they already trust.
            </p>
            <div className="relative mt-auto h-[190px]">
              <div className="absolute left-2 right-6 top-2.5 rounded-xl border border-ink/[0.07] bg-paper-warm px-[13px] py-[11px] text-[11px] text-[#B4B9C4]">
                You sent <strong className="text-ink-muted-light">Rp 14.000</strong> ·
                15s ago
              </div>
              <div className="absolute left-[30px] right-1.5 top-14 rounded-[14px] border border-ink/[0.09] bg-white p-4 shadow-[0_6px_18px_rgba(22,34,51,.08)]">
                <div className="mb-2.5 flex items-center gap-[7px]">
                  <span className="h-3.5 w-3.5 rounded bg-tint-2" />
                  <span className="text-[11px] font-semibold text-[#8A94A3]">
                    Your app
                  </span>
                </div>
                <div className="font-display text-[26px] font-bold tracking-[-0.03em] text-ink">
                  Rp 150.000
                </div>
                <div className="mt-1.5 flex items-center gap-[7px]">
                  <img
                    src="/marketing/payment-channels/gopay.svg"
                    alt=""
                    className="block h-[15px] w-[15px] flex-none rounded-full object-contain"
                  />
                  <span className="text-[11px] font-semibold text-[#8A94A3]">
                    IDR
                  </span>
                </div>
                <div className="mt-3 inline-flex items-center gap-[7px] rounded-[9px] bg-tint px-[11px] py-2">
                  <span className="text-[11px] text-action">↗</span>
                  <span className="text-[11px] font-semibold text-[#3A4657]">
                    Earned <strong>Rp 10.000</strong>
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article className="flex flex-col justify-center rounded-[18px] bg-action p-8 text-center md:text-left">
            <span className="mb-[26px] self-center rounded-full border border-white/[0.34] px-3.5 py-[7px] text-[12px] font-medium text-white/[0.82] md:self-start">
              Accessible to everyone
            </span>
            <p className="m-0 font-display text-[clamp(20px,2.1vw,25px)] font-semibold leading-[1.24] tracking-[-0.018em] text-white">
              From a fintech prototype to a national wallet, {BRAND_NAME} makes
              the IDR/XLM corridor reachable through a single integration.
            </p>
          </article>
        </div>
      </MarketingContainer>
    </section>
  );
}
