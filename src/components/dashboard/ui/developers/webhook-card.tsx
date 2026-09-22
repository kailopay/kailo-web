"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { WebhookEndpointRow } from "@/lib/dashboard/webhooks/types";
import {
  disableWebhookEndpoint,
  webhookErrorMessage,
} from "@/lib/kailopay/developer/webhooks";
import { WebhookAvatar } from "@/components/dashboard/ui/developers/webhook-avatar";
import { WebhookStatus } from "@/components/dashboard/ui/developers/webhook-status";
import { Button, MenuItem, Popover } from "@dub/ui";
import { Dots, Trash } from "@dub/ui/icons";
import { Command } from "cmdk";

function getWebhookLabel(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function WebhookCard({
  endpoint,
  onDeleted,
}: {
  endpoint: WebhookEndpointRow;
  onDeleted?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = endpoint.enabled === 1;

  async function handleDelete() {
    try {
      await disableWebhookEndpoint(endpoint.id);
      toast.success("Webhook deleted");
      onDeleted?.();
    } catch (error) {
      toast.error(webhookErrorMessage(error));
    }
  }

  return (
    <div className="relative rounded-xl border border-neutral-200 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-x-3">
          <div className="flex-shrink-0 rounded-md border border-neutral-200 bg-gradient-to-t from-neutral-100 p-2.5">
            <WebhookAvatar id={endpoint.url} />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold text-neutral-700">
                {getWebhookLabel(endpoint.url)}
              </span>
              <WebhookStatus endpoint={endpoint} />
            </div>
            <div className="truncate text-sm text-neutral-500">{endpoint.url}</div>
            <p className="mt-1 text-xs text-neutral-400">
              {endpoint.events.length} event type
              {endpoint.events.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {isActive ? (
          <Popover
            openPopover={isOpen}
            setOpenPopover={setIsOpen}
            align="end"
            content={
              <Command tabIndex={0} loop className="focus:outline-none">
                <Command.List className="flex w-screen flex-col gap-1 p-1.5 text-sm focus-visible:outline-none sm:w-auto sm:min-w-[140px]">
                  <MenuItem
                    as={Command.Item}
                    icon={Trash}
                    variant="danger"
                    onSelect={() => {
                      setIsOpen(false);
                      void handleDelete();
                    }}
                  >
                    Delete
                  </MenuItem>
                </Command.List>
              </Command>
            }
          >
            <Button
              type="button"
              className="size-8 shrink-0 rounded-lg p-0"
              variant="outline"
              icon={<Dots className="h-4 w-4 shrink-0" />}
            />
          </Popover>
        ) : null}
      </div>
    </div>
  );
}
