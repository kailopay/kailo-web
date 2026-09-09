"use client";

import { useState } from "react";

import type { FaqItem } from "@/content/landing";

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>(() =>
    items.reduce<Record<number, boolean>>((acc, item, index) => {
      if (item.defaultOpen) acc[index] = true;
      return acc;
    }, {}),
  );

  return (
    <div className="min-w-[290px] flex-[1_1_520px] border-t border-ink/[0.12]">
      {items.map((item, index) => {
        const isOpen = Boolean(openItems[index]);

        return (
          <div key={item.question} className="border-b border-ink/[0.12]">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between gap-5 border-0 bg-none py-[21px] text-left"
              aria-expanded={isOpen}
              onClick={() =>
                setOpenItems((current) => ({
                  ...current,
                  [index]: !current[index],
                }))
              }
            >
              <span className="font-display text-[clamp(14.5px,1.35vw,16.5px)] font-semibold leading-[1.35] tracking-[-0.008em] text-ink">
                {item.question}
              </span>
              <span className="flex-none text-[17px] font-normal leading-none text-ink opacity-45">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div className="max-w-[62ch] pb-6">
                <p className="m-0 text-[14.5px] leading-[1.7] text-ink-body">
                  {item.question === "Is the API live?" ? (
                    <>
                      <strong className="font-display text-[17px] font-bold text-ink">
                        No.
                      </strong>
                      {item.answer.replace(/^No\.\s*/, "")}
                    </>
                  ) : (
                    item.answer
                  )}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
