"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type RampCopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
};

export function RampCopyButton({ value, label = "value", className }: RampCopyButtonProps) {
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
      aria-label={copied ? "Copied" : `Copy ${label}`}
      className={[
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-black/5 hover:text-ink",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {copied ? <Check className="h-4 w-4 text-action" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}
