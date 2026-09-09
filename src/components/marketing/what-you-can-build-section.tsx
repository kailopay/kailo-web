import { SelectChevronIcon, SwapIcon } from "../ui/icons";
import { MarketingContainer } from "../ui/marketing-container";

export function WhatYouCanBuildSection() {
  return (
    <section className="bg-paper px-8 py-[88px]">
      <MarketingContainer>
        <div className="mb-12 text-center md:text-left">
          <h2 className="font-display text-[clamp(28px,3.4vw,44px)] font-bold leading-[1.08] tracking-[-0.028em] text-ink [font-stretch:108%]">
            What you can build
          </h2>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
          <article className="flex min-h-[470px] flex-col overflow-hidden rounded-[18px] bg-gradient-to-br from-tint to-[#DDE0FC] px-[30px] pb-0 pt-[30px]">
            <h3 className="mx-auto mb-3.5 max-w-[14ch] text-center font-display text-[clamp(21px,2.2vw,27px)] font-bold leading-[1.1] tracking-[-0.022em] text-ink md:mx-0 md:text-left">
              P2P Liquidity API
            </h3>
            <p className="mx-auto m-0 max-w-[32ch] text-center text-[14.5px] leading-[1.6] text-ink-body md:mx-0 md:text-left">
              On-ramp and off-ramp between IDR and XLM on Stellar, through one
              endpoint.
            </p>
            <div className="-mx-[30px] mt-auto pt-5">
              <div className="rounded-t-2xl bg-ground px-[22px] pb-6 pt-5 shadow-[0_-4px_30px_rgba(13,27,42,.22)]">
                <div className="mb-4 flex gap-1.5">
                  <span className="rounded-md bg-white/[0.13] px-2.5 py-[5px] font-mono text-[11px] text-[#E8EAF0]">
                    POST
                  </span>
                  <span className="px-0.5 py-[5px] font-mono text-[11px] text-ink-muted">
                    /v1/quote
                  </span>
                </div>
                <div className="font-mono text-[12px] leading-[2] text-ink-muted">
                  <div>
                    <span className="text-[#9DA5F9]">&quot;direction&quot;</span>
                    : <span className="text-[#C9D2DE]">&quot;onramp&quot;</span>,
                  </div>
                  <div>
                    <span className="text-[#9DA5F9]">&quot;currencyIn&quot;</span>
                    : <span className="text-[#C9D2DE]">&quot;IDR&quot;</span>,
                  </div>
                  <div>
                    <span className="text-[#9DA5F9]">&quot;currencyOut&quot;</span>
                    : <span className="text-[#C9D2DE]">&quot;XLM&quot;</span>,
                  </div>
                  <div>
                    <span className="text-[#9DA5F9]">&quot;amount&quot;</span>:{" "}
                    <span className="text-[#C9D2DE]">&quot;100000&quot;</span>
                  </div>
                </div>
                <div className="mt-[18px] flex items-center justify-between gap-2.5 border-t border-white/10 pt-4">
                  <span className="font-display text-[22px] font-bold tracking-[-0.028em] text-white">
                    29.60 XLM
                  </span>
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    held 30s
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article className="flex min-h-[470px] flex-col overflow-hidden rounded-[18px] bg-gradient-to-br from-[#E9EEF3] to-[#D5DEE8] px-[30px] pb-0 pt-[30px]">
            <h3 className="mx-auto mb-3.5 max-w-[14ch] text-center font-display text-[clamp(21px,2.2vw,27px)] font-bold leading-[1.1] tracking-[-0.022em] text-ink md:mx-0 md:text-left">
              Widget and SDK
            </h3>
            <p className="mx-auto m-0 max-w-[32ch] text-center text-[14.5px] leading-[1.6] text-ink-body md:mx-0 md:text-left">
              Drop-in buy and sell flow for the IDR/XLM corridor inside your app.
            </p>
            <div className="mx-1.5 mt-auto pt-5">
              <div className="rounded-t-[20px] bg-white px-[18px] pb-6 pt-5 shadow-[0_-4px_30px_rgba(22,34,51,.14)]">
                <div className="relative rounded-2xl border border-ink/[0.07] bg-white px-4 pb-[18px] pt-3.5 text-center">
                  <span className="inline-flex items-center gap-[7px] rounded-full bg-white py-[5px] pl-[5px] pr-[11px] shadow-card-soft">
                    <img
                      src="/marketing/indonesia-circle.svg"
                      alt=""
                      className="block h-[22px] w-[22px] rounded-full object-cover"
                    />
                    <span className="whitespace-nowrap text-[12.5px] font-semibold text-ink">
                      Send IDR
                    </span>
                    <SelectChevronIcon />
                  </span>
                  <div className="mt-2 font-display text-[30px] font-bold tracking-[-0.035em] text-ink">
                    100,000
                  </div>
                  <div className="absolute left-1/2 top-full z-[2] flex h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink/[0.07] bg-white shadow-[0_2px_8px_rgba(22,34,51,.1)]">
                    <SwapIcon />
                  </div>
                </div>
                <div className="mt-2 rounded-2xl bg-[#F1F1EF] px-4 pb-3.5 pt-[22px] text-center">
                  <div className="mb-2.5 font-display text-[30px] font-bold tracking-[-0.035em] text-ink">
                    29.60
                  </div>
                  <span className="inline-flex items-center gap-[7px] rounded-full bg-white py-[5px] pl-[5px] pr-[11px] shadow-card-soft">
                    <img
                      src="/marketing/payment-channels/qris.svg"
                      alt=""
                      className="block h-[22px] w-[22px] rounded-full object-contain"
                    />
                    <span className="whitespace-nowrap text-[12.5px] font-semibold text-ink">
                      Get XLM
                    </span>
                    <SelectChevronIcon />
                  </span>
                </div>
                <div className="mt-3.5 rounded-full bg-action py-3.5 text-center text-[13px] font-semibold text-white">
                  Buy &amp; sell XLM
                </div>
              </div>
            </div>
          </article>

          <article className="flex min-h-[470px] flex-col overflow-hidden rounded-[18px] bg-gradient-to-br from-[#F5F3ED] to-[#E7E3D8] px-[30px] pb-0 pt-[30px]">
            <h3 className="mx-auto mb-3.5 max-w-[14ch] text-center font-display text-[clamp(21px,2.2vw,27px)] font-bold leading-[1.1] tracking-[-0.022em] text-ink md:mx-0 md:text-left">
              Embedded wallets
            </h3>
            <p className="mx-auto m-0 max-w-[32ch] text-center text-[14.5px] leading-[1.6] text-ink-body md:mx-0 md:text-left">
              Stellar testnet wallets your users control, funded from their first
              IDR top-up.
            </p>
            <div className="-mr-[30px] ml-3 mt-auto pt-5">
              <div className="rounded-tl-[18px] bg-white px-[22px] pb-6 pt-5 shadow-[0_-4px_30px_rgba(22,34,51,.14)]">
                <div className="mb-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted-light">
                    Total balance
                  </span>
                </div>
                <div className="mb-[18px] font-display text-[34px] font-bold tracking-[-0.04em] text-ink">
                  Rp 1.240.580
                </div>
                <div className="flex items-center gap-[11px] border-t border-ink/[0.08] py-3">
                  <img
                    src="/marketing/payment-channels/qris.svg"
                    alt=""
                    className="block h-7 w-7 flex-none rounded-full object-contain"
                  />
                  <span className="flex-1 text-[13px] font-semibold text-ink">
                    XLM
                  </span>
                  <span className="text-[13px] font-semibold text-ink">
                    842.10
                  </span>
                </div>
                <div className="flex items-center gap-[11px] border-t border-ink/[0.08] py-3">
                  <img
                    src="/marketing/indonesia-circle.svg"
                    alt=""
                    className="block h-7 w-7 flex-none rounded-full object-cover"
                  />
                  <span className="flex-1 text-[13px] font-semibold text-ink">
                    IDR
                  </span>
                  <span className="text-[13px] font-semibold text-ink">
                    398.470
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </MarketingContainer>
    </section>
  );
}
