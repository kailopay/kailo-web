"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_NOTIFICATION_EVENTS, getDefaultTemplatesForProvider } from "@/lib/dashboard/integrations/notifications/defaults";
import type { NotificationIntegrationSettings, PublicOrganizationIntegration, PublicSlackIntegration } from "@/lib/dashboard/integrations/types";
import { IntegrationDetailSkeleton } from "@/components/dashboard/ui/integrations/integration-detail-skeleton";
import { IntegrationStatus } from "@/components/dashboard/ui/integrations/integration-status";
import { NotificationEventsSettings, type NotificationSaveTarget } from "@/components/dashboard/ui/integrations/notification-events-settings";
import { SettingsSection } from "@/components/dashboard/ui/settings/settings-section";
import { SmoothSkeleton } from "@/components/dashboard/ui/shared/smooth-skeleton";
import { useSetDashboardPageHeader } from "@/components/dashboard/ui/layout/dashboard-page-header-context";
import { Button } from "@dub/ui";

type SlackChannel = {
  id: string;
  name: string;
  isPrivate?: boolean;
};

function parseSettings(integration: PublicOrganizationIntegration | null): NotificationIntegrationSettings {
  const settings = integration?.settings as NotificationIntegrationSettings | undefined;

  if (!settings || !Array.isArray(settings.events)) {
    return {
      events: [...DEFAULT_NOTIFICATION_EVENTS],
      templates: getDefaultTemplatesForProvider("slack"),
    };
  }

  return {
    events: settings.events,
    templates: {
      ...getDefaultTemplatesForProvider("slack"),
      ...(settings.templates ?? {}),
    },
    channelLabel: settings.channelLabel,
    slackDelivery: settings.slackDelivery,
    slackChannelId: settings.slackChannelId,
    slackChannelName: settings.slackChannelName,
    slackTeamId: settings.slackTeamId,
    slackTeamName: settings.slackTeamName,
  };
}

function normalizeIntegrationForUi(
  integration: PublicOrganizationIntegration | null | undefined,
) {
  if (!integration || integration.status === "disconnected") {
    return null;
  }

  return integration;
}

function isBotInstallationReady(
  integration: PublicOrganizationIntegration | null,
) {
  if (!integration) {
    return false;
  }

  if (integration.status === "connected") {
    return true;
  }

  const credentials = integration.credentials as PublicSlackIntegration | undefined;
  return Boolean(
    credentials?.delivery === "bot" && credentials.installationReady,
  );
}

export function SlackIntegrationPanel({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [isChannelsLoading, setIsChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(DEFAULT_NOTIFICATION_EVENTS);
  const [templates, setTemplates] = useState<Record<string, string>>(
    getDefaultTemplatesForProvider("slack"),
  );
  const [integration, setIntegration] = useState<PublicOrganizationIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);
  const [savingTarget, setSavingTarget] = useState<NotificationSaveTarget | null>(null);
  const [testingEvent, setTestingEvent] = useState<string | null>(null);

  const headerOverride = useMemo(
    () => ({
      titleInfo: {
        title: "Send payment notifications to a Slack channel with the app.",
      },
    }),
    [],
  );

  useSetDashboardPageHeader(headerOverride);

  const applySettings = useCallback((nextIntegration: PublicOrganizationIntegration | null) => {
    const settings = parseSettings(nextIntegration);
    setSelectedEvents(settings.events);
    setTemplates(settings.templates);
    setSelectedChannelId(settings.slackChannelId ?? "");
    setTeamName(settings.slackTeamName ?? null);
  }, []);

  const resetLocalIntegrationState = useCallback(() => {
    setIntegration(null);
    applySettings(null);
    setChannels([]);
    setChannelsError(null);
    setSelectedChannelId("");
    setTeamName(null);
  }, [applySettings]);

  const loadIntegration = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/integrations/slack`);
      const data = (await response.json()) as {
        integration?: PublicOrganizationIntegration | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load Slack integration");
      }

      const nextIntegration = normalizeIntegrationForUi(data.integration ?? null);
      setIntegration(nextIntegration);
      applySettings(nextIntegration);
    } finally {
      setIsLoading(false);
    }
  }, [applySettings, organizationId]);

  const loadChannels = useCallback(async () => {
    setIsChannelsLoading(true);
    setChannelsError(null);

    try {
      const response = await fetch(`/api/organizations/${organizationId}/integrations/slack/channels`);
      const data = (await response.json()) as {
        channels?: SlackChannel[];
        team?: { id: string; name: string };
        selectedChannelId?: string | null;
        error?: string;
        reset?: boolean;
      };

      if (!response.ok) {
        if (data.reset) {
          resetLocalIntegrationState();
          return;
        }

        throw new Error(data.error ?? "Unable to load Slack channels");
      }

      setChannels(data.channels ?? []);
      setTeamName(data.team?.name ?? null);

      if (data.selectedChannelId) {
        setSelectedChannelId(data.selectedChannelId);
      } else if (!selectedChannelId && data.channels?.[0]) {
        setSelectedChannelId(data.channels[0].id);
      }
    } catch (error) {
      setChannels([]);
      setChannelsError(error instanceof Error ? error.message : "Unable to load Slack channels");
    } finally {
      setIsChannelsLoading(false);
    }
  }, [organizationId, resetLocalIntegrationState]);

  useEffect(() => {
    void loadIntegration();
  }, [loadIntegration]);

  useEffect(() => {
    const settings = parseSettings(integration);
    if (isBotInstallationReady(integration) && settings.slackTeamId) {
      void loadChannels();
    }
  }, [integration, loadChannels]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "1") {
      toast.success("App added to your Slack workspace");
      void loadIntegration();
      router.replace("/dashboard/integrations/slack");
      return;
    }

    if (!error) {
      return;
    }

    void (async () => {
      try {
        const response = await fetch(`/api/organizations/${organizationId}/integrations/slack`);
        const data = (await response.json()) as {
          integration?: PublicOrganizationIntegration | null;
        };

        toast.error(data.integration?.lastError ?? "Unable to connect Slack. Try adding the app again.");
        setIntegration(data.integration ?? null);
        applySettings(data.integration ?? null);
      } catch {
        toast.error("Unable to connect Slack");
      } finally {
        router.replace("/dashboard/integrations/slack");
      }
    })();
  }, [applySettings, organizationId, router, searchParams]);

  async function handleAddToSlack() {
    setIsConnecting(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/integrations/slack/connect`, { method: "POST" });
      const data = (await response.json()) as {
        authorizationUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.authorizationUrl) {
        throw new Error(data.error ?? "Unable to start Slack connection");
      }

      window.location.href = data.authorizationUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start Slack connection");
      setIsConnecting(false);
    }
  }

  async function handleCompleteSetup() {
    if (!selectedChannelId) {
      toast.error("Select a channel first");
      return;
    }

    setIsCompleting(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/integrations/slack/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: selectedChannelId,
          events: selectedEvents,
          templates,
        }),
      });
      const data = (await response.json()) as {
        integration?: PublicOrganizationIntegration;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to complete Slack setup");
      }

      toast.success("Slack connected");
      setIntegration(data.integration ?? null);
      applySettings(data.integration ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete Slack setup");
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleSaveChannel() {
    if (!selectedChannelId) {
      toast.error("Select a channel first");
      return;
    }

    setIsSavingChannel(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/integrations/slack`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId: selectedChannelId }),
      });
      const data = (await response.json()) as {
        integration?: PublicOrganizationIntegration;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save channel");
      }

      toast.success("Notification channel updated");
      setIntegration(data.integration ?? null);
      applySettings(data.integration ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save channel");
    } finally {
      setIsSavingChannel(false);
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

      const response = await fetch(`/api/organizations/${organizationId}/integrations/slack`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
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
      toast.error(error instanceof Error ? error.message : "Unable to save settings");
    } finally {
      setSavingTarget(null);
    }
  }

  async function handleTest(event: string, template: string) {
    setTestingEvent(event);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/integrations/slack/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, template }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send test notification");
      }

      toast.success("Test notification sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send test notification");
    } finally {
      setTestingEvent(null);
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/integrations/slack`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to disconnect Slack");
      }

      toast.success("Slack disconnected");
      resetLocalIntegrationState();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to disconnect Slack");
    } finally {
      setIsDisconnecting(false);
    }
  }

  if (isLoading) {
    return <IntegrationDetailSkeleton fieldCount={1} />;
  }

  const settings = parseSettings(integration);
  const isConnected = integration?.status === "connected";
  const hasTeam = isBotInstallationReady(integration) && Boolean(settings.slackTeamId);
  const isPendingSetup = integration?.status === "pending" && hasTeam;
  const publicSlack = integration?.credentials && "delivery" in integration.credentials ? (integration.credentials as PublicSlackIntegration) : null;

  const hasChannelChange =
    isConnected &&
    Boolean(selectedChannelId) &&
    selectedChannelId !== (settings.slackChannelId ?? "");

  const sectionAction = isConnected ? (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" text="Disconnect" className="h-9 w-fit shrink-0" loading={isDisconnecting} onClick={() => void handleDisconnect()} />
      {hasChannelChange ? (
        <Button type="button" text="Save changes" className="h-9 w-fit shrink-0" loading={isSavingChannel} onClick={() => void handleSaveChannel()} />
      ) : null}
    </div>
  ) : hasTeam ? (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" text="Disconnect" className="h-9 w-fit shrink-0" loading={isDisconnecting} onClick={() => void handleDisconnect()} />
      <Button type="button" text="Complete setup" className="h-9 w-fit shrink-0" loading={isCompleting} disabled={!selectedChannelId || selectedEvents.length === 0} onClick={() => void handleCompleteSetup()} />
    </div>
  ) : (
    <Button type="button" text="Add to Slack" className="h-9 w-fit shrink-0" loading={isConnecting} onClick={() => void handleAddToSlack()} />
  );

  return (
    <div className="mb-6 space-y-6">
      <SettingsSection
        title="Slack app"
        description="Add the app to your workspace, then choose which channel receives payment notifications."
        helpText={
          isConnected ? (
            <p className="text-sm text-neutral-500">
              Connected to <span className="text-neutral-900">{publicSlack?.teamName ?? teamName ?? settings.slackTeamName}</span>
              {publicSlack?.channelName || settings.slackChannelName ? (
                <>
                  {" "}
                  · <span className="text-neutral-900">#{publicSlack?.channelName ?? settings.slackChannelName}</span>
                </>
              ) : null}
              . Pick another channel below and click <span className="text-neutral-900">Save changes</span> to move notifications — the app will leave the previous channel automatically.
            </p>
          ) : isPendingSetup ? (
            <p className="text-sm text-neutral-500">
              App added to your workspace. Pick a notification channel, then click <span className="text-neutral-900">Complete setup</span> to finish. Use <span className="text-neutral-900">Disconnect</span> to switch to a different workspace.
            </p>
          ) : (
            <p className="text-sm text-neutral-500">
              You need permission to install apps in your Slack workspace.{" "}
              <Link href="/guides/integrations/slack" className="underline underline-offset-4 hover:text-neutral-700">
                Setup guide
              </Link>
            </p>
          )
        }
        action={sectionAction}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <IntegrationStatus integration={integration} />
          </div>

          {!hasTeam ? (
            <p className="text-sm text-neutral-500">
              Click <span className="text-neutral-900">Add to Slack</span> to install the app, then pick a channel below.
            </p>
          ) : (
            <div className="max-w-md space-y-2">
              <label htmlFor="slack-channel" className="text-sm font-medium text-neutral-900">
                Notification channel
              </label>
              {isChannelsLoading ? (
                <SmoothSkeleton className="h-10 w-full rounded-md" />
              ) : (
                <select id="slack-channel" className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none focus:ring-neutral-500" value={selectedChannelId} onChange={(event) => setSelectedChannelId(event.target.value)} disabled={channels.length === 0}>
                  {channels.length === 0 ? (
                    <option value="">No channels available</option>
                  ) : (
                    channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.isPrivate ? "🔒 " : "#"}
                        {channel.name}
                      </option>
                    ))
                  )}
                </select>
              )}
              {channelsError ? <p className="text-sm text-red-500">{channelsError}</p> : null}
              {teamName || settings.slackTeamName ? (
                <p className="text-sm text-neutral-500">
                  Workspace: <span className="text-neutral-900">{teamName ?? settings.slackTeamName}</span>
                </p>
              ) : null}
            </div>
          )}

          {integration?.lastError ? <p className="text-sm text-red-500">{integration.lastError}</p> : null}
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
        defaultTemplates={getDefaultTemplatesForProvider("slack")}
        onSave={(target) => void handleSaveSettings(target)}
        onTest={(event, template) => void handleTest(event, template)}
      />
    </div>
  );
}
