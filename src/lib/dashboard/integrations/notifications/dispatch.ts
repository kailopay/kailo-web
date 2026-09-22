import type { WebhookEvent } from "@/constants/dashboard/webhooks/events";
import type { Organization, OrganizationIntegration } from "@/lib/dashboard/db/schema";
import { sendDiscordWebhook } from "@/lib/dashboard/integrations/discord/client";
import { sendDiscordBotNotification } from "@/lib/dashboard/integrations/discord/routes";
import {
  buildConnectionTestMessage,
  buildDiscordMessage,
  buildSlackMessage,
} from "@/lib/dashboard/integrations/notifications/render";
import { sendSlackWebhook } from "@/lib/dashboard/integrations/slack/client";
import { sendSlackBotNotification } from "@/lib/dashboard/integrations/slack/routes";
import {
  getDiscordBotDeliveryTarget,
  getSlackBotDeliveryTarget,
  getNotificationIntegrationSettings,
  getConnectedNotificationIntegrations,
  markIntegrationError,
  markIntegrationHealthy,
} from "@/lib/dashboard/integrations/service";
import type { NotificationProviderId } from "@/lib/dashboard/integrations/types";

const NOTIFICATION_PROVIDERS: NotificationProviderId[] = ["discord", "slack"];

function isNotificationProvider(
  provider: OrganizationIntegration["provider"],
): provider is NotificationProviderId {
  return provider === "discord" || provider === "slack";
}

async function sendDiscordNotification(input: {
  integration: OrganizationIntegration;
  event: WebhookEvent;
  environment: Organization["environment"];
  payload: Record<string, unknown>;
  template?: string;
}) {
  const target = getDiscordBotDeliveryTarget(input.integration);

  if (target?.type === "bot") {
    await sendDiscordBotNotification({
      channelId: target.channelId,
      event: input.event,
      environment: input.environment,
      payload: input.payload,
      template: input.template,
    });
    return;
  }

  if (target?.type === "webhook") {
    await sendDiscordWebhook({
      webhookUrl: target.webhookUrl,
      body: buildDiscordMessage({
        provider: "discord",
        event: input.event,
        environment: input.environment,
        payload: input.payload,
        template: input.template,
      }),
    });
    return;
  }

  throw new Error("Discord delivery is not configured.");
}

async function sendSlackNotification(input: {
  integration: OrganizationIntegration;
  event: WebhookEvent;
  environment: Organization["environment"];
  payload: Record<string, unknown>;
  template?: string;
}) {
  const target = getSlackBotDeliveryTarget(input.integration);
  const settings = getNotificationIntegrationSettings(input.integration);

  if (target?.type === "bot") {
    await sendSlackBotNotification({
      botToken: target.botToken,
      channelId: target.channelId,
      channelIsPrivate: settings.slackChannelIsPrivate,
      event: input.event,
      environment: input.environment,
      payload: input.payload,
      template: input.template,
    });
    return;
  }

  if (target?.type === "webhook") {
    await sendSlackWebhook({
      webhookUrl: target.webhookUrl,
      body: buildSlackMessage({
        provider: "slack",
        event: input.event,
        environment: input.environment,
        payload: input.payload,
        template: input.template,
      }),
    });
    return;
  }

  throw new Error("Slack delivery is not configured.");
}

async function sendProviderNotification(input: {
  provider: NotificationProviderId;
  integration: OrganizationIntegration;
  event: WebhookEvent;
  environment: Organization["environment"];
  payload: Record<string, unknown>;
  template?: string;
}) {
  if (input.provider === "discord") {
    await sendDiscordNotification({
      integration: input.integration,
      event: input.event,
      environment: input.environment,
      payload: input.payload,
      template: input.template,
    });
    return;
  }

  await sendSlackNotification({
    integration: input.integration,
    event: input.event,
    environment: input.environment,
    payload: input.payload,
    template: input.template,
  });
}

export async function sendIntegrationConnectionTest(input: {
  provider: NotificationProviderId;
  webhookUrl?: string;
  channelId?: string;
  botToken?: string;
  organizationName: string;
  environment: Organization["environment"];
}) {
  const body = buildConnectionTestMessage(input);

  if (input.provider === "discord") {
    if (input.channelId) {
      const { sendDiscordChannelMessage } = await import(
        "@/lib/dashboard/integrations/discord/bot"
      );
      await sendDiscordChannelMessage({ channelId: input.channelId, body });
      return;
    }

    if (input.webhookUrl) {
      await sendDiscordWebhook({ webhookUrl: input.webhookUrl, body });
    }

    return;
  }

  if (!input.webhookUrl && !input.channelId && !input.botToken) {
    throw new Error("Slack delivery is not configured.");
  }

  if (input.botToken && input.channelId) {
    const { sendSlackChannelMessage } = await import(
      "@/lib/dashboard/integrations/slack/bot"
    );
    await sendSlackChannelMessage({
      botToken: input.botToken,
      channelId: input.channelId,
      body,
    });
    return;
  }

  if (!input.webhookUrl) {
    throw new Error("Webhook URL is not configured.");
  }

  await sendSlackWebhook({ webhookUrl: input.webhookUrl, body });
}

export async function dispatchIntegrationNotifications(input: {
  organizationId: string;
  environment: Organization["environment"];
  event: WebhookEvent;
  payload: Record<string, unknown>;
}) {
  const integrations = await getConnectedNotificationIntegrations(
    input.organizationId,
    input.environment,
  );

  const targets = integrations.filter((integration) =>
    isNotificationProvider(integration.provider),
  );

  await Promise.allSettled(
    targets.map(async (integration) => {
      const settings = getNotificationIntegrationSettings(integration);
      if (!settings.events.includes(input.event)) {
        return;
      }

      if (integration.provider === "slack") {
        const target = getSlackBotDeliveryTarget(integration);
        if (!target) {
          return;
        }
      }

      if (integration.provider === "discord") {
        const target = getDiscordBotDeliveryTarget(integration);
        if (!target) {
          return;
        }
      }

      try {
        await sendProviderNotification({
          provider: integration.provider as NotificationProviderId,
          integration,
          event: input.event,
          environment: input.environment,
          payload: input.payload,
          template: settings.templates[input.event],
        });
        await markIntegrationHealthy(integration.id);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Notification delivery failed";
        await markIntegrationError(integration.id, message);
      }
    }),
  );
}

export async function sendIntegrationTestNotification(input: {
  integration: OrganizationIntegration;
  organizationName: string;
  environment: Organization["environment"];
  event: WebhookEvent;
  payload: Record<string, unknown>;
  template?: string;
}) {
  if (!isNotificationProvider(input.integration.provider)) {
    throw new Error("Unsupported notification provider.");
  }

  const settings = getNotificationIntegrationSettings(input.integration);

  await sendProviderNotification({
    provider: input.integration.provider,
    integration: input.integration,
    event: input.event,
    environment: input.environment,
    payload: input.payload,
    template: input.template ?? settings.templates[input.event],
  });

  await markIntegrationHealthy(input.integration.id);
}

export function isNotificationIntegrationProvider(
  provider: string,
): provider is NotificationProviderId {
  return NOTIFICATION_PROVIDERS.includes(provider as NotificationProviderId);
}
