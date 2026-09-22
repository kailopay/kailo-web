import type { WebhookEvent } from "@/constants/dashboard/webhooks/events";
import type { OrganizationIntegration } from "@/lib/dashboard/db/schema";

export type IntegrationProviderId =
  | "shopify"
  | "woocommerce"
  | "discord"
  | "slack";

export type NotificationProviderId = "discord" | "slack";

export type IntegrationStatusValue = OrganizationIntegration["status"];

export type IntegrationCatalogItem = {
  id: IntegrationProviderId;
  name: string;
  description: string;
  href: string;
  docsPath: string;
  category: "commerce" | "notifications";
  iconUrl?: string;
};

export type IntegrationListItem = IntegrationCatalogItem & {
  integration: PublicOrganizationIntegration | null;
};

export type ShopifyCredentials = {
  accessToken: string;
};

export type WooCommerceCredentials = {
  consumerKey: string;
  consumerSecret: string;
};

export type WebhookIntegrationCredentials = {
  webhookUrl: string;
};

export type SlackBotCredentials = {
  botToken: string;
};

export type NotificationIntegrationSettings = {
  events: WebhookEvent[];
  templates: Partial<Record<WebhookEvent, string>>;
  channelLabel?: string;
  discordDelivery?: "bot" | "webhook";
  discordChannelId?: string;
  discordChannelName?: string;
  discordGuildId?: string | null;
  discordGuildName?: string;
  discordWebhookName?: string;
  slackDelivery?: "bot" | "webhook";
  slackChannelId?: string;
  slackChannelName?: string;
  slackChannelIsPrivate?: boolean;
  slackTeamId?: string | null;
  slackTeamName?: string;
};

export type PublicDiscordIntegration = {
  guildName?: string;
  channelName?: string;
  delivery?: "bot" | "webhook";
  installationReady?: boolean;
};

export type PublicSlackIntegration = {
  teamName?: string;
  channelName?: string;
  delivery?: "bot" | "webhook";
  installationReady?: boolean;
};

export type IntegrationOrderInput = {
  externalOrderId: string;
  amount: string;
  currency: string;
  description?: string | null;
  customerEmail?: string | null;
};

export type PublicOrganizationIntegration = Omit<
  OrganizationIntegration,
  "credentials"
> & {
  credentials:
    | Record<string, never>
    | { webhookUrlMasked: string }
    | PublicDiscordIntegration
    | PublicSlackIntegration;
  settings: NotificationIntegrationSettings | Record<string, unknown> | null;
};
