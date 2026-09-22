"use client";

import { BACKEND_WEBHOOK_EVENT_TYPES } from "@/lib/kailopay/developer/webhooks";
import { cn } from "@/lib/dashboard/utils";

const EVENT_LABELS: Record<(typeof BACKEND_WEBHOOK_EVENT_TYPES)[number], string> = {
  "order.created": "Order created",
  "order.payment_pending": "Payment pending",
  "order.payment_confirmed": "Payment confirmed",
  "order.asset_received": "Asset received",
  "order.processing": "Processing",
  "order.completed": "Order completed",
  "order.failed": "Order failed",
  "order.expired": "Order expired",
};

export function WebhookEventsPicker({
  value,
  onChange,
  disabled = false,
  showEventKey = true,
}: {
  value: string[];
  onChange: (events: string[]) => void;
  disabled?: boolean;
  showEventKey?: boolean;
}) {
  function toggle(event: (typeof BACKEND_WEBHOOK_EVENT_TYPES)[number]) {
    if (value.includes(event)) {
      onChange(value.filter((item) => item !== event));
      return;
    }

    onChange([...value, event]);
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {BACKEND_WEBHOOK_EVENT_TYPES.map((event) => {
        const checked = value.includes(event);

        return (
          <label
            key={event}
            className={cn(
              "flex min-w-0 cursor-pointer items-start gap-3 rounded-md py-1.5",
              disabled && "pointer-events-none opacity-60",
            )}
          >
            <input
              type="checkbox"
              className="mt-0.5 shrink-0 rounded border-neutral-300"
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(event)}
            />
            <div className="min-w-0 flex-1">
              <span className="block text-sm text-neutral-900">
                {EVENT_LABELS[event]}
              </span>
              {showEventKey ? (
                <span className="mt-0.5 block break-all font-mono text-xs leading-snug text-neutral-500">
                  {event}
                </span>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}
