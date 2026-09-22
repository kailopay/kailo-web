import type { IntegrationCatalogItem } from "./types";

export const INTEGRATION_CATALOG: IntegrationCatalogItem[] = [
  {
    id: "shopify",
    name: "Shopify",
    description: "Create payments when new Shopify orders are placed.",
    href: "/dashboard/integrations/shopify",
    docsPath: "/guides/integrations/shopify",
    category: "commerce",
    iconUrl: "https://cdn.simpleicons.org/shopify/7AB55C",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Create payments when new WooCommerce orders are placed.",
    href: "/dashboard/integrations/woocommerce",
    docsPath: "/guides/integrations/woocommerce",
    category: "commerce",
    iconUrl: "https://cdn.simpleicons.org/woocommerce/96588A",
  },
  {
    id: "discord",
    name: "Discord",
    description: "Send payment notifications to a Discord channel with the bot.",
    href: "/dashboard/integrations/discord",
    docsPath: "/guides/integrations/discord",
    category: "notifications",
    iconUrl: "https://cdn.simpleicons.org/discord/5865F2",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send payment notifications to a Slack channel with the app.",
    href: "/dashboard/integrations/slack",
    docsPath: "/guides/integrations/slack",
    category: "notifications",
    iconUrl:
      "https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png",
  },
];

export function getIntegrationCatalogItem(provider: IntegrationCatalogItem["id"]) {
  return INTEGRATION_CATALOG.find((item) => item.id === provider) ?? null;
}
