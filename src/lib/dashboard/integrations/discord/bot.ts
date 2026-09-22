import { getDiscordConfig } from "@/lib/dashboard/integrations/discord/env";

const DISCORD_API_BASE = "https://discord.com/api/v10";

type DiscordApiChannel = {
  id: string;
  name: string;
  type: number;
  parent_id?: string | null;
};

async function parseDiscordApiError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? `Discord API returned HTTP ${response.status}`;
  } catch {
    return `Discord API returned HTTP ${response.status}`;
  }
}

async function discordBotFetch(path: string, init?: RequestInit) {
  const { botToken } = getDiscordConfig();

  const response = await fetch(`${DISCORD_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bot ${botToken}`,
      ...(init?.headers ?? {}),
    },
  });

  return response;
}

export async function fetchDiscordGuild(guildId: string) {
  const response = await discordBotFetch(`/guilds/${guildId}`);

  if (!response.ok) {
    throw new Error(await parseDiscordApiError(response));
  }

  const data = (await response.json()) as { id?: string; name?: string };

  return {
    id: data.id ?? guildId,
    name: data.name?.trim() || "Discord server",
  };
}

export async function listDiscordGuildTextChannels(guildId: string) {
  const response = await discordBotFetch(`/guilds/${guildId}/channels`);

  if (!response.ok) {
    throw new Error(await parseDiscordApiError(response));
  }

  const channels = (await response.json()) as DiscordApiChannel[];

  return channels
    .filter((channel) => channel.type === 0)
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
      parentId: channel.parent_id ?? null,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function sendDiscordChannelMessage(input: {
  channelId: string;
  body: Record<string, unknown>;
}) {
  const response = await discordBotFetch(`/channels/${input.channelId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input.body),
  });

  if (response.status === 204 || response.ok) {
    return;
  }

  throw new Error(await parseDiscordApiError(response));
}

export async function assertDiscordChannelInGuild(input: {
  guildId: string;
  channelId: string;
}) {
  const channels = await listDiscordGuildTextChannels(input.guildId);
  const channel = channels.find((item) => item.id === input.channelId);

  if (!channel) {
    throw new Error("Selected channel is not available in this Discord server.");
  }

  return channel;
}
