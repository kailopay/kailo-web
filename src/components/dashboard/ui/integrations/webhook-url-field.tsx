"use client";

import { cn } from "@dub/utils";
import { useState } from "react";

type WebhookUrlFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function WebhookUrlField({
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
}: WebhookUrlFieldProps) {
  const [showUrl, setShowUrl] = useState(false);

  return (
    <div className="max-w-md space-y-2">
      <input
        id={id}
        type={showUrl ? "text" : "password"}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full rounded-md border border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-neutral-500 sm:text-sm",
          disabled && "cursor-not-allowed bg-neutral-100 text-neutral-400",
        )}
      />
      {!disabled ? (
        <button
          type="button"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-700"
          onClick={() => setShowUrl((current) => !current)}
        >
          {showUrl ? "Hide URL" : "Show URL"}
        </button>
      ) : null}
    </div>
  );
}
