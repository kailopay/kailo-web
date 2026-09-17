"use client";

import { useState } from "react";

type RampCopyButtonProps = {
  value: string;
  label: string;
  className?: string;
};

export function RampCopyButton({ value, label, className }: RampCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={["text-[12px] font-medium text-action hover:underline", className]
        .filter(Boolean)
        .join(" ")}
    >
      {copied ? "Copied" : `Copy ${label}`}
    </button>
  );
}
