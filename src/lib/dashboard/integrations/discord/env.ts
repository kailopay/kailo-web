function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3000"
  );
}

export function getDiscordRedirectUri() {
  return (
    process.env.DISCORD_REDIRECT_URI ??
    `${getAppUrl().replace(/\/$/, "")}/api/integrations/discord/callback`
  );
}

export function getDiscordConfig() {
  const clientId = process.env.DISCORD_CLIENT_ID?.trim();
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();

  if (!clientId || !botToken) {
    throw new Error(
      "Discord bot is not configured. Set DISCORD_CLIENT_ID and DISCORD_BOT_TOKEN.",
    );
  }

  return {
    clientId,
    clientSecret,
    botToken,
    redirectUri: getDiscordRedirectUri(),
  };
}

export function isDiscordBotConfigured() {
  return Boolean(
    process.env.DISCORD_CLIENT_ID?.trim() &&
      process.env.DISCORD_BOT_TOKEN?.trim(),
  );
}

// VIEW_CHANNEL + SEND_MESSAGES + EMBED_LINKS
export const DISCORD_BOT_PERMISSIONS = "19456";
