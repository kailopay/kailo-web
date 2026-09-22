import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/dashboard/db";
import {
  organizationIntegrations,
  type Organization,
  type OrganizationIntegration,
} from "@/lib/dashboard/db/schema";
import { organizationEnvironmentWhere } from "@/lib/dashboard/organizations/environment-scope";
import { INTEGRATION_CATALOG } from "./catalog";
import type {
  IntegrationListItem,
  IntegrationProviderId,
  NotificationIntegrationSettings,
  NotificationProviderId,
  ShopifyCredentials,
  SlackBotCredentials,
  WebhookIntegrationCredentials,
  WooCommerceCredentials,
  PublicOrganizationIntegration,
} from "./types";
import { parseNotificationSettings, normalizeNotificationSettings } from "./notifications/settings";

function createWebhookSecret() {
  return `intsec_${randomBytes(24).toString("base64url")}`;
}

export function normalizeShopifyShop(input: string) {
  const trimmed = input.trim().toLowerCase().replace(/^https?:\/\//, "");
  const withoutPath = trimmed.split("/")[0] ?? trimmed;

  if (withoutPath.endsWith(".myshopify.com")) {
    return withoutPath;
  }

  const slug = withoutPath.replace(/\.myshopify\.com$/, "");
  return `${slug}.myshopify.com`;
}

export function normalizeWooCommerceStoreUrl(input: string) {
  const trimmed = input.trim().replace(/\/$/, "");
  const withProtocol = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol).origin;
}

function mapCatalogToListItems(
  rows: OrganizationIntegration[],
): IntegrationListItem[] {
  return INTEGRATION_CATALOG.map<IntegrationListItem>((item) => {
    const integration = rows.find((row) => row.provider === item.id) ?? null;

    return {
      ...item,
      integration: integration ? toPublicIntegration(integration) : null,
    };
  });
}

export async function listOrganizationIntegrations(
  organizationId: string,
  environment: Organization["environment"],
) {
  try {
    const rows = await db
      .select()
      .from(organizationIntegrations)
      .where(
        organizationEnvironmentWhere(
          organizationIntegrations.organizationId,
          organizationIntegrations.environment,
          organizationId,
          environment,
        ),
      );

    return mapCatalogToListItems(rows);
  } catch {
    return mapCatalogToListItems([]);
  }
}

export async function getOrganizationIntegration(
  organizationId: string,
  environment: Organization["environment"],
  provider: IntegrationProviderId,
) {
  const [integration] = await db
    .select()
    .from(organizationIntegrations)
    .where(
      and(
        organizationEnvironmentWhere(
          organizationIntegrations.organizationId,
          organizationIntegrations.environment,
          organizationId,
          environment,
        ),
        eq(organizationIntegrations.provider, provider),
      ),
    )
    .limit(1);

  return integration ?? null;
}

export async function upsertPendingShopifyIntegration(input: {
  organizationId: string;
  environment: Organization["environment"];
  shop: string;
}) {
  const storeIdentifier = normalizeShopifyShop(input.shop);
  const existing = await getOrganizationIntegration(
    input.organizationId,
    input.environment,
    "shopify",
  );

  if (existing) {
    const [updated] = await db
      .update(organizationIntegrations)
      .set({
        storeIdentifier,
        status: "pending",
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(organizationIntegrations.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(organizationIntegrations)
    .values({
      organizationId: input.organizationId,
      environment: input.environment,
      provider: "shopify",
      status: "pending",
      storeIdentifier,
      webhookSecret: createWebhookSecret(),
    })
    .returning();

  return created;
}

export async function markShopifyIntegrationConnected(input: {
  integrationId: string;
  accessToken: string;
  externalWebhookId?: string | null;
}) {
  const credentials: ShopifyCredentials = {
    accessToken: input.accessToken,
  };

  const [updated] = await db
    .update(organizationIntegrations)
    .set({
      status: "connected",
      credentials,
      externalWebhookId: input.externalWebhookId ?? null,
      connectedAt: new Date(),
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(organizationIntegrations.id, input.integrationId))
    .returning();

  return updated ?? null;
}

export async function upsertWooCommerceIntegration(input: {
  organizationId: string;
  environment: Organization["environment"];
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  externalWebhookId?: string | null;
}) {
  const storeIdentifier = normalizeWooCommerceStoreUrl(input.storeUrl);
  const credentials: WooCommerceCredentials = {
    consumerKey: input.consumerKey,
    consumerSecret: input.consumerSecret,
  };

  const existing = await getOrganizationIntegration(
    input.organizationId,
    input.environment,
    "woocommerce",
  );

  if (existing) {
    const [updated] = await db
      .update(organizationIntegrations)
      .set({
        storeIdentifier,
        credentials,
        status: "connected",
        externalWebhookId: input.externalWebhookId ?? null,
        connectedAt: new Date(),
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(organizationIntegrations.id, existing.id))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(organizationIntegrations)
    .values({
      organizationId: input.organizationId,
      environment: input.environment,
      provider: "woocommerce",
      status: "connected",
      storeIdentifier,
      credentials,
      webhookSecret: createWebhookSecret(),
      externalWebhookId: input.externalWebhookId ?? null,
      connectedAt: new Date(),
    })
    .returning();

  return created;
}

export function getDiscordBotDeliveryTarget(
  integration: OrganizationIntegration,
) {
  const settings = getNotificationIntegrationSettings(integration);
  const webhookCredentials = getWebhookIntegrationCredentials(integration);

  if (
    settings.discordChannelId &&
    (settings.discordDelivery === "bot" || !webhookCredentials?.webhookUrl)
  ) {
    return {
      type: "bot" as const,
      channelId: settings.discordChannelId,
    };
  }

  if (webhookCredentials?.webhookUrl) {
    return {
      type: "webhook" as const,
      webhookUrl: webhookCredentials.webhookUrl,
    };
  }

  return null;
}

export async function upsertPendingDiscordIntegration(input: {
  organizationId: string;
  environment: Organization["environment"];
}) {
  const existing = await getOrganizationIntegration(
    input.organizationId,
    input.environment,
    "discord",
  );

  if (existing) {
    const currentSettings = getNotificationIntegrationSettings(existing);
    const [updated] = await db
      .update(organizationIntegrations)
      .set({
        status: "pending",
        credentials: null,
        settings: clearBotNotificationSettings(currentSettings) as Record<
          string,
          unknown
        >,
        storeIdentifier: "Discord server",
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(organizationIntegrations.id, existing.id))
      .returning();

    return updated!;
  }

  const [created] = await db
    .insert(organizationIntegrations)
    .values({
      organizationId: input.organizationId,
      environment: input.environment,
      provider: "discord",
      status: "pending",
      storeIdentifier: "Discord server",
      settings: normalizeNotificationSettings(),
    })
    .returning();

  return created;
}

export async function markDiscordBotGuildConnected(input: {
  integrationId: string;
  guildId: string;
  guildName: string;
  settings?: NotificationIntegrationSettings;
}) {
  const settings = normalizeNotificationSettings({
    ...(input.settings ?? {}),
    discordDelivery: "bot",
    discordGuildId: input.guildId,
    discordGuildName: input.guildName,
  });

  const [updated] = await db
    .update(organizationIntegrations)
    .set({
      status: "pending",
      storeIdentifier: input.guildName,
      credentials: null,
      settings: settings as Record<string, unknown>,
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(organizationIntegrations.id, input.integrationId))
    .returning();

  return updated ?? null;
}

export async function markDiscordBotIntegrationConnected(input: {
  integrationId: string;
  guildId: string;
  guildName: string;
  channelId: string;
  channelName: string;
  settings: NotificationIntegrationSettings;
}) {
  const settings = normalizeNotificationSettings({
    ...input.settings,
    discordDelivery: "bot",
    discordGuildId: input.guildId,
    discordGuildName: input.guildName,
    discordChannelId: input.channelId,
    discordChannelName: input.channelName,
    channelLabel: `#${input.channelName}`,
  });

  const [updated] = await db
    .update(organizationIntegrations)
    .set({
      status: "connected",
      storeIdentifier: `${input.guildName} · #${input.channelName}`,
      credentials: null,
      settings: settings as Record<string, unknown>,
      connectedAt: new Date(),
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(organizationIntegrations.id, input.integrationId))
    .returning();

  return updated ?? null;
}

export function getSlackBotCredentials(
  integration: OrganizationIntegration,
) {
  if (!integration.credentials || typeof integration.credentials !== "object") {
    return null;
  }

  const credentials = integration.credentials as SlackBotCredentials;
  return credentials.botToken ? credentials : null;
}

export function getSlackBotDeliveryTarget(
  integration: OrganizationIntegration,
) {
  const settings = getNotificationIntegrationSettings(integration);
  const botCredentials = getSlackBotCredentials(integration);
  const webhookCredentials = getWebhookIntegrationCredentials(integration);

  if (
    settings.slackChannelId &&
    botCredentials?.botToken &&
    (settings.slackDelivery === "bot" || !webhookCredentials?.webhookUrl)
  ) {
    return {
      type: "bot" as const,
      channelId: settings.slackChannelId,
      botToken: botCredentials.botToken,
    };
  }

  if (webhookCredentials?.webhookUrl) {
    return {
      type: "webhook" as const,
      webhookUrl: webhookCredentials.webhookUrl,
    };
  }

  return null;
}

export async function upsertPendingSlackIntegration(input: {
  organizationId: string;
  environment: Organization["environment"];
}) {
  const existing = await getOrganizationIntegration(
    input.organizationId,
    input.environment,
    "slack",
  );

  if (existing) {
    const currentSettings = getNotificationIntegrationSettings(existing);
    const [updated] = await db
      .update(organizationIntegrations)
      .set({
        status: "pending",
        credentials: null,
        settings: clearBotNotificationSettings(currentSettings) as Record<
          string,
          unknown
        >,
        storeIdentifier: "Slack workspace",
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(organizationIntegrations.id, existing.id))
      .returning();

    return updated!;
  }

  const [created] = await db
    .insert(organizationIntegrations)
    .values({
      organizationId: input.organizationId,
      environment: input.environment,
      provider: "slack",
      status: "pending",
      storeIdentifier: "Slack workspace",
      settings: normalizeNotificationSettings(),
    })
    .returning();

  return created;
}

export async function markSlackBotTeamConnected(input: {
  integrationId: string;
  teamId: string;
  teamName: string;
  botToken: string;
  settings?: NotificationIntegrationSettings;
}) {
  const settings = normalizeNotificationSettings({
    ...(input.settings ?? {}),
    slackDelivery: "bot",
    slackTeamId: input.teamId,
    slackTeamName: input.teamName,
  });

  const credentials: SlackBotCredentials = {
    botToken: input.botToken,
  };

  const [updated] = await db
    .update(organizationIntegrations)
    .set({
      status: "pending",
      storeIdentifier: input.teamName,
      credentials,
      settings: settings as Record<string, unknown>,
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(organizationIntegrations.id, input.integrationId))
    .returning();

  return updated ?? null;
}

export async function markSlackBotIntegrationConnected(input: {
  integrationId: string;
  teamId: string;
  teamName: string;
  channelId: string;
  channelName: string;
  botToken: string;
  settings: NotificationIntegrationSettings;
}) {
  const settings = normalizeNotificationSettings({
    ...input.settings,
    slackDelivery: "bot",
    slackTeamId: input.teamId,
    slackTeamName: input.teamName,
    slackChannelId: input.channelId,
    slackChannelName: input.channelName,
    channelLabel: `#${input.channelName}`,
  });

  const credentials: SlackBotCredentials = {
    botToken: input.botToken,
  };

  const [updated] = await db
    .update(organizationIntegrations)
    .set({
      status: "connected",
      storeIdentifier: `${input.teamName} · #${input.channelName}`,
      credentials,
      settings: settings as Record<string, unknown>,
      connectedAt: new Date(),
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(organizationIntegrations.id, input.integrationId))
    .returning();

  return updated ?? null;
}

export function maskWebhookUrl(url: string) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const maskedPath = segments
      .map((segment, index) =>
        index === segments.length - 1 ? "***" : segment,
      )
      .join("/");

    return `${parsed.origin}/${maskedPath}`;
  } catch {
    return "***";
  }
}

export function getWebhookIntegrationCredentials(
  integration: OrganizationIntegration,
) {
  if (!integration.credentials || typeof integration.credentials !== "object") {
    return null;
  }

  const credentials = integration.credentials as WebhookIntegrationCredentials;
  return credentials.webhookUrl ? credentials : null;
}

export function getNotificationIntegrationSettings(
  integration: OrganizationIntegration,
): NotificationIntegrationSettings {
  return parseNotificationSettings(integration.settings);
}

function clearBotNotificationSettings(
  settings: NotificationIntegrationSettings,
): NotificationIntegrationSettings {
  return normalizeNotificationSettings({
    events: settings.events,
    templates: settings.templates,
  });
}

export function isStaleBotInstallation(
  integration: OrganizationIntegration,
) {
  if (integration.status === "connected") {
    return false;
  }

  const settings = getNotificationIntegrationSettings(integration);

  if (integration.provider === "slack") {
    const hasBotToken = Boolean(getSlackBotCredentials(integration)?.botToken);
    return Boolean(settings.slackTeamId) && !hasBotToken;
  }

  if (integration.provider === "discord") {
    return integration.status === "pending" && !settings.discordGuildId;
  }

  return false;
}

export async function resetNotificationBotSetup(
  integration: OrganizationIntegration,
) {
  if (integration.status === "connected") {
    return integration;
  }

  await db
    .delete(organizationIntegrations)
    .where(eq(organizationIntegrations.id, integration.id));

  return null;
}

export async function sanitizeNotificationIntegration(
  integration: OrganizationIntegration | null,
) {
  if (!integration || !isStaleBotInstallation(integration)) {
    return integration;
  }

  return resetNotificationBotSetup(integration);
}

export function toPublicIntegration(
  integration: OrganizationIntegration,
): PublicOrganizationIntegration {
  const settings = getNotificationIntegrationSettings(integration);
  const webhookCredentials = getWebhookIntegrationCredentials(integration);

  if (webhookCredentials?.webhookUrl) {
    return {
      ...integration,
      credentials: {
        webhookUrlMasked: maskWebhookUrl(webhookCredentials.webhookUrl),
      },
      settings,
    };
  }

  if (
    integration.provider === "discord" &&
    settings.discordGuildId &&
    (settings.discordDelivery === "bot" || integration.status !== "disconnected")
  ) {
    return {
      ...integration,
      credentials: {
        delivery: "bot",
        installationReady: true,
        guildName: settings.discordGuildName,
        channelName: settings.discordChannelName,
      },
      settings,
    };
  }

  const slackBotCredentials = getSlackBotCredentials(integration);

  if (
    integration.provider === "slack" &&
    (slackBotCredentials?.botToken || settings.slackTeamId)
  ) {
    return {
      ...integration,
      credentials: {
        delivery: "bot",
        installationReady: Boolean(slackBotCredentials?.botToken),
        teamName: settings.slackTeamName,
        channelName: settings.slackChannelName,
      },
      settings,
    };
  }

  return {
    ...integration,
    credentials: {},
    settings:
      integration.provider === "discord" || integration.provider === "slack"
        ? settings
        : (integration.settings as Record<string, unknown> | null),
  };
}

export async function upsertNotificationIntegration(input: {
  organizationId: string;
  environment: Organization["environment"];
  provider: NotificationProviderId;
  webhookUrl: string;
  settings: NotificationIntegrationSettings;
  channelLabel?: string;
}) {
  const storeIdentifier =
    input.channelLabel?.trim() ||
    (input.provider === "discord" ? "Discord channel" : "Slack channel");
  const credentials: WebhookIntegrationCredentials = {
    webhookUrl: input.webhookUrl.trim(),
  };

  const existing = await getOrganizationIntegration(
    input.organizationId,
    input.environment,
    input.provider,
  );

  if (existing) {
    const [updated] = await db
      .update(organizationIntegrations)
      .set({
        storeIdentifier,
        credentials,
        settings: input.settings as Record<string, unknown>,
        status: "connected",
        connectedAt: new Date(),
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(organizationIntegrations.id, existing.id))
      .returning();

    return updated!;
  }

  const [created] = await db
    .insert(organizationIntegrations)
    .values({
      organizationId: input.organizationId,
      environment: input.environment,
      provider: input.provider,
      status: "connected",
      storeIdentifier,
      credentials,
      settings: input.settings as Record<string, unknown>,
      connectedAt: new Date(),
    })
    .returning();

  return created;
}

export async function updateNotificationIntegrationSettings(
  integrationId: string,
  settings: NotificationIntegrationSettings,
  channelLabel?: string,
) {
  const [updated] = await db
    .update(organizationIntegrations)
    .set({
      settings: settings as Record<string, unknown>,
      ...(channelLabel?.trim()
        ? { storeIdentifier: channelLabel.trim() }
        : {}),
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(organizationIntegrations.id, integrationId))
    .returning();

  return updated ?? null;
}

export async function markIntegrationHealthy(integrationId: string) {
  await db
    .update(organizationIntegrations)
    .set({
      status: "connected",
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(organizationIntegrations.id, integrationId));
}

export async function getConnectedNotificationIntegrations(
  organizationId: string,
  environment: Organization["environment"],
) {
  const rows = await db
    .select()
    .from(organizationIntegrations)
    .where(
      and(
        organizationEnvironmentWhere(
          organizationIntegrations.organizationId,
          organizationIntegrations.environment,
          organizationId,
          environment,
        ),
        eq(organizationIntegrations.status, "connected"),
      ),
    );

  return rows.filter(
    (row) => row.provider === "discord" || row.provider === "slack",
  );
}

export async function markIntegrationError(
  integrationId: string,
  message: string,
) {
  await db
    .update(organizationIntegrations)
    .set({
      status: "error",
      lastError: message,
      updatedAt: new Date(),
    })
    .where(eq(organizationIntegrations.id, integrationId));
}

export async function disconnectIntegration(
  integration: OrganizationIntegration,
) {
  if (
    (integration.provider === "discord" ||
      integration.provider === "slack") &&
    integration.status !== "connected"
  ) {
    await db
      .delete(organizationIntegrations)
      .where(eq(organizationIntegrations.id, integration.id));

    return null;
  }

  const settings = getNotificationIntegrationSettings(integration);
  const clearedSettings = clearBotNotificationSettings(settings);
  const defaultStore =
    integration.provider === "discord" ? "Discord server" : "Slack workspace";

  const [updated] = await db
    .update(organizationIntegrations)
    .set({
      status: "disconnected",
      credentials: null,
      externalWebhookId: null,
      connectedAt: null,
      lastError: null,
      settings: clearedSettings as Record<string, unknown>,
      storeIdentifier: defaultStore,
      updatedAt: new Date(),
    })
    .where(eq(organizationIntegrations.id, integration.id))
    .returning();

  return updated ?? null;
}

export async function getIntegrationByStore(
  provider: IntegrationProviderId,
  storeIdentifier: string,
) {
  const [integration] = await db
    .select()
    .from(organizationIntegrations)
    .where(
      and(
        eq(organizationIntegrations.provider, provider),
        eq(organizationIntegrations.storeIdentifier, storeIdentifier),
        eq(organizationIntegrations.status, "connected"),
      ),
    )
    .limit(1);

  return integration ?? null;
}
