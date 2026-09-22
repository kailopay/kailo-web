function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3000"
  );
}

export function getSlackRedirectUri() {
  return (
    process.env.SLACK_REDIRECT_URI ??
    `${getAppUrl().replace(/\/$/, "")}/api/integrations/slack/callback`
  );
}

export function getSlackConfig() {
  const clientId = process.env.SLACK_CLIENT_ID?.trim();
  const clientSecret = process.env.SLACK_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "Slack app is not configured. Set SLACK_CLIENT_ID and SLACK_CLIENT_SECRET.",
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri: getSlackRedirectUri(),
  };
}

export function isSlackBotConfigured() {
  return Boolean(
    process.env.SLACK_CLIENT_ID?.trim() &&
      process.env.SLACK_CLIENT_SECRET?.trim(),
  );
}

// Post messages and list channels in the installing workspace.
export const SLACK_BOT_SCOPES = [
  "channels:read",
  "channels:join",
  "groups:read",
  "chat:write",
  "chat:write.public",
].join(",");
