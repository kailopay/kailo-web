"use client";

import Link from "next/link";
import { WebhookEventsPicker } from "@/components/dashboard/developers/webhook-events-picker";
import { WEBHOOK_EVENTS } from "@/constants/dashboard/webhooks/events";
import { DEFAULT_DISCORD_NOTIFICATION_TEMPLATES } from "@/lib/dashboard/integrations/notifications/defaults";
import { NotificationTemplateField } from "@/components/dashboard/ui/integrations/notification-template-field";
import { Button } from "@dub/ui";

const EVENT_LABELS: Record<(typeof WEBHOOK_EVENTS)[number], string> = {
  "payment.created": "Payment created",
  "payment.completed": "Payment completed",
  "payment.failed": "Payment failed",
  "payment.expired": "Payment expired",
  "payment.refunded": "Payment refunded",
  "payment.settlement_failed": "Payment settlement failed",
};

export type NotificationSaveTarget = "events" | (typeof WEBHOOK_EVENTS)[number];

type NotificationEventsSettingsProps = {
  selectedEvents: string[];
  onEventsChange: (events: string[]) => void;
  templates: Record<string, string>;
  onTemplatesChange: (templates: Record<string, string>) => void;
  isConnected: boolean;
  savingTarget: NotificationSaveTarget | null;
  testingEvent: string | null;
  variablesDocsHref: string;
  defaultTemplates?: Record<string, string>;
  onSave: (target: NotificationSaveTarget) => void;
  onTest: (event: string, template: string) => void;
};

export function NotificationEventsSettings({
  selectedEvents,
  onEventsChange,
  templates,
  onTemplatesChange,
  isConnected,
  savingTarget,
  testingEvent,
  variablesDocsHref,
  defaultTemplates = DEFAULT_DISCORD_NOTIFICATION_TEMPLATES,
  onSave,
  onTest,
}: NotificationEventsSettingsProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <div className="space-y-6 p-6">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Notification events</h2>
          <p className="text-sm text-neutral-500">
            Choose events and customize the message sent for each one.
          </p>
        </div>

        <div className="space-y-3">
          <WebhookEventsPicker
            value={selectedEvents}
            onChange={onEventsChange}
            showEventKey={false}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              text="Save changes"
              className="h-8 w-fit shrink-0"
              loading={savingTarget === "events"}
              disabled={!isConnected || selectedEvents.length === 0}
              disabledTooltip={
                isConnected
                  ? undefined
                  : "Complete setup above to save event settings."
              }
              onClick={() => onSave("events")}
            />
          </div>
        </div>

        {selectedEvents.length > 0 ? (
          <div className="space-y-5 border-t border-neutral-100 pt-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-neutral-900">Messages</h3>
              <p className="text-sm text-neutral-500">
                Use placeholders such as{" "}
                <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs text-neutral-700">
                  {"{{amount}}"}
                </code>{" "}
                in your templates.{" "}
                <Link
                  href={variablesDocsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
                >
                  View all message variables
                </Link>
                .
              </p>
            </div>

            <div className="space-y-5">
              {selectedEvents.map((event) => {
                const templateValue =
                  templates[event] ??
                  defaultTemplates[event];

                return (
                  <NotificationTemplateField
                    key={event}
                    label={
                      EVENT_LABELS[event as keyof typeof EVENT_LABELS] ?? event
                    }
                    placeholder={defaultTemplates[event]}
                    value={templateValue}
                    canSave={isConnected}
                    canTestSend={isConnected}
                    isSaving={savingTarget === event}
                    isTestSending={testingEvent === event}
                    onSave={() => onSave(event as NotificationSaveTarget)}
                    onTestSend={() => onTest(event, templateValue)}
                    onChange={(nextValue) =>
                      onTemplatesChange({
                        ...templates,
                        [event]: nextValue,
                      })
                    }
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {!isConnected ? (
        <div className="border-t border-neutral-200 px-6 py-4">
          <p className="text-sm text-neutral-500">
            Complete setup above to save these settings or send test
            notifications. You can still choose events and edit messages now.
          </p>
        </div>
      ) : null}
    </div>
  );
}
