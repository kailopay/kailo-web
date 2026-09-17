"use client";

import { useEffect, useId, useRef, useState } from "react";

import { SelectChevronIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { PAYOUT_BANKS, payoutBankById } from "@/lib/kailopay/payout-destination";

type RampBankSelectProps = {
  value: string;
  onChange: (bankId: string) => void;
};

export function RampBankSelect({ value, onChange }: RampBankSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = payoutBankById(value) ?? PAYOUT_BANKS[0];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectBank(bankId: string) {
    onChange(bankId);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="ramp-bank-select">
      <button
        type="button"
        className={cn("ramp-bank-select__trigger", open && "is-open")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="ramp-bank-select__value">
          <img src={selected.icon} alt="" className="ramp-bank-select__logo" />
          <span className="ramp-bank-select__label">{selected.name}</span>
        </span>
        <span className={cn("ramp-bank-select__chevron", open && "is-open")}>
          <SelectChevronIcon />
        </span>
      </button>

      {open && (
        <ul id={listboxId} className="ramp-bank-select__menu" role="listbox">
          {PAYOUT_BANKS.map((bank) => {
            const isSelected = bank.id === value;
            return (
              <li key={bank.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={cn("ramp-bank-select__option", isSelected && "is-selected")}
                  onClick={() => selectBank(bank.id)}
                >
                  <img src={bank.icon} alt="" className="ramp-bank-select__logo" />
                  <span className="ramp-bank-select__label">{bank.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
