import { validateDiscordWebhookUrl } from "@/lib/dashboard/integrations/discord/client";

export type DiscordWebhookInfo = {
  id: string;
  name: string;
  channelId: string;
  guildId: string | null;
  label: string;
};

function parseDiscordWebhookParts(webhookUrl: string) {
  const normalized = validateDiscordWebhookUrl(webhookUrl);
  const { pathname } = new URL(normalized);
  const match = pathname.match(/^\/api\/webhooks\/(\d+)\/([^/]+)$/);

  if (!match) {
    throw new Error("Discord webhook URL is missing an ID or token.");
  }

  return {
    webhookId: match[1]!,
    webhookToken: match[2]!,
  };
}

export async function fetchDiscordWebhookInfo(
  webhookUrl: string,
): Promise<DiscordWebhookInfo> {
  const { webhookId, webhookToken } = parseDiscordWebhookParts(webhookUrl);
  const response = await fetch(
    `https://discord.com/api/v10/webhooks/${webhookId}/${webhookToken}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      response.status === 401 || response.status === 404
        ? "Discord webhook URL is invalid or has been revoked."
        : `Discord returned HTTP ${response.status}.`,
    );
  }

  const data = (await response.json()) as {
    id?: string;
    name?: string;
    channel_id?: string;
    guild_id?: string | null;
  };

  if (!data.channel_id) {
    throw new Error("Discord did not return channel information for this webhook.");
  }

  const name = data.name?.trim() || "Discord webhook";

  return {
    id: data.id ?? webhookId,
    name,
    channelId: data.channel_id,
    guildId: data.guild_id ?? null,
    label: name,
  };
}
