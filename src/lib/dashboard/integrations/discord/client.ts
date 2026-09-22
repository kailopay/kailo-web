const DISCORD_HOSTS = new Set(["discord.com", "discordapp.com"]);

export function validateDiscordWebhookUrl(input: string) {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("Discord webhook URL is invalid.");
  }

  if (url.protocol !== "https:") {
    throw new Error("Discord webhook URL must use HTTPS.");
  }

  if (!DISCORD_HOSTS.has(url.hostname)) {
    throw new Error("Discord webhook URL must point to discord.com.");
  }

  if (!url.pathname.startsWith("/api/webhooks/")) {
    throw new Error("Discord webhook URL must be an incoming webhook URL.");
  }

  return url.toString();
}

async function parseDiscordError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? `Discord API returned HTTP ${response.status}`;
  } catch {
    return `Discord API returned HTTP ${response.status}`;
  }
}

export async function sendDiscordWebhook(input: {
  webhookUrl: string;
  body: Record<string, unknown>;
}) {
  const webhookUrl = validateDiscordWebhookUrl(input.webhookUrl);
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.body),
  });

  if (response.status === 204 || response.ok) {
    return;
  }

  throw new Error(await parseDiscordError(response));
}
