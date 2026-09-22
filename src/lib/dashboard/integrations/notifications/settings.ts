import { z } from "zod";
import { WEBHOOK_EVENTS } from "@/constants/dashboard/webhooks/events";
import {
  DEFAULT_NOTIFICATION_EVENTS,
  DEFAULT_NOTIFICATION_TEMPLATES,
} from "@/lib/dashboard/integrations/notifications/defaults";
import type { NotificationIntegrationSettings } from "@/lib/dashboard/integrations/types";

const templateSchema = z.record(z.string(), z.string().max(2000));

export const notificationSettingsSchema = z.object({
  events: z
    .array(z.enum(WEBHOOK_EVENTS))
    .min(1, "Select at least one event"),
  templates: templateSchema.optional().default({}),
  channelLabel: z.string().trim().max(120).optional(),
  discordDelivery: z.enum(["bot", "webhook"]).optional(),
  discordChannelId: z.string().optional(),
  discordChannelName: z.string().optional(),
  discordGuildId: z.string().nullable().optional(),
  discordGuildName: z.string().optional(),
  discordWebhookName: z.string().optional(),
  slackDelivery: z.enum(["bot", "webhook"]).optional(),
  slackChannelId: z.string().optional(),
  slackChannelName: z.string().optional(),
  slackChannelIsPrivate: z.boolean().optional(),
  slackTeamId: z.string().nullable().optional(),
  slackTeamName: z.string().optional(),
});

export const notificationConnectSchema = z.object({
  webhookUrl: z.string().url("Webhook URL must be valid"),
  channelLabel: z.string().trim().max(120).optional(),
  events: z.array(z.enum(WEBHOOK_EVENTS)).optional(),
  templates: templateSchema.optional(),
});

export function normalizeNotificationSettings(
  input?: Partial<NotificationIntegrationSettings> | null,
): NotificationIntegrationSettings {
  const events =
    input?.events && input.events.length > 0
      ? input.events
      : DEFAULT_NOTIFICATION_EVENTS;

  const templates = { ...DEFAULT_NOTIFICATION_TEMPLATES, ...(input?.templates ?? {}) };

  return {
    events,
    templates,
    channelLabel: input?.channelLabel?.trim() || undefined,
    discordDelivery: input?.discordDelivery,
    discordChannelId: input?.discordChannelId,
    discordChannelName: input?.discordChannelName,
    discordGuildId: input?.discordGuildId,
    discordGuildName: input?.discordGuildName,
    discordWebhookName: input?.discordWebhookName,
    slackDelivery: input?.slackDelivery,
    slackChannelId: input?.slackChannelId,
    slackChannelName: input?.slackChannelName,
    slackChannelIsPrivate: input?.slackChannelIsPrivate,
    slackTeamId: input?.slackTeamId,
    slackTeamName: input?.slackTeamName,
  };
}

export function parseNotificationSettings(
  value: unknown,
): NotificationIntegrationSettings {
  if (!value || typeof value !== "object") {
    return normalizeNotificationSettings();
  }

  const raw = value as Partial<NotificationIntegrationSettings>;
  const parsed = notificationSettingsSchema.safeParse(value);

  if (!parsed.success) {
    return normalizeNotificationSettings(raw);
  }

  return normalizeNotificationSettings({
    ...raw,
    ...parsed.data,
  });
}
