"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DEFAULT_NOTIFICATION_EVENTS,
  DEFAULT_NOTIFICATION_TEMPLATES,
} from "@/lib/dashboard/integrations/notifications/defaults";
import type {
  NotificationIntegrationSettings,
  NotificationProviderId,
  PublicOrganizationIntegration,
} from "@/lib/dashboard/integrations/types";
import { IntegrationDetailSkeleton } from "@/components/dashboard/ui/integrations/integration-detail-skeleton";
import { IntegrationStatus } from "@/components/dashboard/ui/integrations/integration-status";
import {
  NotificationEventsSettings,
  type NotificationSaveTarget,
} from "@/components/dashboard/ui/integrations/notification-events-settings";
import { WebhookUrlField } from "@/components/dashboard/ui/integrations/webhook-url-field";
import { SettingsSection } from "@/components/dashboard/ui/settings/settings-section";
import { useSetDashboardPageHeader } from "@/components/dashboard/ui/layout/dashboard-page-header-context";
import { Button } from "@dub/ui";

type NotificationIntegrationPanelProps = {
  organizationId: string;
  provider: NotificationProviderId;
  title: string;
  description: string;
  docsPath: string;
};

const WEBHOOK_PLACEHOLDERS: Record<NotificationProviderId, string> = {
  discord: "https://discord.com/api/webhooks/...",
  slack: "https://hooks.slack.com/services/...",
};

function parseSettings(
  integration: PublicOrganizationIntegration | null,
): NotificationIntegrationSettings {
  const settings = integration?.settings as
    | NotificationIntegrationSettings
    | undefined;

  if (!settings || !Array.isArray(settings.events)) {
    return {
      events: [...DEFAULT_NOTIFICATION_EVENTS],
      templates: { ...DEFAULT_NOTIFICATION_TEMPLATES },
    };
  }

  return {
    events: settings.events,
    templates: {
      ...DEFAULT_NOTIFICATION_TEMPLATES,
      ...(settings.templates ?? {}),
    },
    channelLabel: settings.channelLabel,
  };
}

export function NotificationIntegrationPanel({
  organizationId,
  provider,
  title,
  description,
  docsPath,
}: NotificationIntegrationPanelProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    DEFAULT_NOTIFICATION_EVENTS,
  );
  const [templates, setTemplates] = useState<Record<string, string>>({
    ...DEFAULT_NOTIFICATION_TEMPLATES,
  });
  const [integration, setIntegration] =
    useState<PublicOrganizationIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [savingTarget, setSavingTarget] = useState<NotificationSaveTarget | null>(
    null,
  );
  const [testingEvent, setTestingEvent] = useState<string | null>(null);

  const headerOverride = useMemo(
    () => ({
      titleInfo: {
        title: description,
      },
    }),
    [description],
  );

  useSetDashboardPageHeader(headerOverride);

  const applySettings = useCallback(
    (nextIntegration: PublicOrganizationIntegration | null) => {
      const settings = parseSettings(nextIntegration);
      setSelectedEvents(settings.events);
      setTemplates(settings.templates);
    },
    [],
  );

  const loadIntegration = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/integrations/${provider}`,
      );
      const data = (await response.json()) as {
        integration?: PublicOrganizationIntegration | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? `Unable to load ${title} integration`);
      }

      setIntegration(data.integration ?? null);
      applySettings(data.integration ?? null);
    } finally {
      setIsLoading(false);
    }
  }, [applySettings, organizationId, provider, title]);

  useEffect(() => {
    void loadIntegration();
  }, [loadIntegration]);

  async function handleConnect() {
    setIsConnecting(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/integrations/${provider}/connect`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl,
            events: selectedEvents,
            templates,
          }),
        },
      );
      const data = (await response.json()) as {
        integration?: PublicOrganizationIntegration;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? `Unable to connect ${title}`);
      }

      toast.success(`${title} connected`);
      setWebhookUrl("");
      setIntegration(data.integration ?? null);
      applySettings(data.integration ?? null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Unable to connect ${title}`,
      );
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleSaveSettings(target: NotificationSaveTarget) {
    setSavingTarget(target);
    try {
      const body =
        target === "events"
          ? { events: selectedEvents }
          : {
              templates: {
                [target]: templates[target],
              },
            };

      const response = await fetch(
        `/api/organizations/${organizationId}/integrations/${provider}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = (await response.json()) as {
        integration?: PublicOrganizationIntegration;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save settings");
      }

      toast.success("Settings saved");
      setIntegration(data.integration ?? null);
      applySettings(data.integration ?? null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save settings",
      );
    } finally {
      setSavingTarget(null);
    }
  }

  async function handleTest(event: string, template: string) {
    setTestingEvent(event);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/integrations/${provider}/test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event, template }),
        },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send test notification");
      }

      toast.success("Test notification sent");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send test notification",
      );
    } finally {
      setTestingEvent(null);
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/integrations/${provider}`,
        { method: "DELETE" },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? `Unable to disconnect ${title}`);
      }

      toast.success(`${title} disconnected`);
      setIntegration(null);
      applySettings(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Unable to disconnect ${title}`,
      );
    } finally {
      setIsDisconnecting(false);
    }
  }

  if (isLoading) {
    return <IntegrationDetailSkeleton fieldCount={1} />;
  }

  const isConnected = integration?.status === "connected";
  const maskedWebhookUrl =
    integration?.credentials &&
    "webhookUrlMasked" in integration.credentials
      ? integration.credentials.webhookUrlMasked
      : null;

  return (
    <div className="mb-6 space-y-6">
      <SettingsSection
        title={`${title} webhook`}
        description={`Connect an incoming webhook to receive KailoPay payment notifications in ${title}.`}
        helpText={
          isConnected ? (
            <p className="text-sm text-neutral-500">
              {maskedWebhookUrl ?? "Webhook connected."}
            </p>
          ) : (
            <p className="text-sm text-neutral-500">
              Paste the webhook URL from your {title} workspace.{" "}
              <Link
                href={docsPath}
                className="underline underline-offset-4 hover:text-neutral-700"
              >
                Setup guide
              </Link>
            </p>
          )
        }
        action={
          isConnected ? (
            <Button
              type="button"
              variant="secondary"
              text="Disconnect"
              className="h-9"
              loading={isDisconnecting}
              onClick={() => void handleDisconnect()}
            />
          ) : (
            <Button
              type="button"
              text={`Connect ${title}`}
              className="h-9"
              loading={isConnecting}
              disabled={!webhookUrl.trim() || selectedEvents.length === 0}
              onClick={() => void handleConnect()}
            />
          )
        }
      >
        <div className="space-y-4">
          <IntegrationStatus integration={integration} />

          {isConnected ? (
            integration?.storeIdentifier ? (
              <div>
                <p className="text-sm font-medium text-neutral-900">Channel</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {integration.storeIdentifier}
                </p>
              </div>
            ) : null
          ) : (
            <WebhookUrlField
              value={webhookUrl}
              onChange={setWebhookUrl}
              placeholder={WEBHOOK_PLACEHOLDERS[provider]}
            />
          )}

          {integration?.lastError ? (
            <p className="text-sm text-red-500">{integration.lastError}</p>
          ) : null}
        </div>
      </SettingsSection>

      <NotificationEventsSettings
        selectedEvents={selectedEvents}
        onEventsChange={setSelectedEvents}
        templates={templates}
        onTemplatesChange={setTemplates}
        isConnected={isConnected}
        savingTarget={savingTarget}
        testingEvent={testingEvent}
        variablesDocsHref="/guides/integrations/slack#message-variables"
        onSave={(target) => void handleSaveSettings(target)}
        onTest={(event, template) => void handleTest(event, template)}
      />
    </div>
  );
}
