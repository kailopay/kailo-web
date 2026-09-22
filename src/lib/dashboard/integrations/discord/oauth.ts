import { createIntegrationOAuthState } from "@/lib/dashboard/integrations/state";
import {
  DISCORD_BOT_PERMISSIONS,
  getDiscordConfig,
} from "@/lib/dashboard/integrations/discord/env";

export function buildDiscordBotOAuthUrl(input: {
  organizationId: string;
  environment: "sandbox" | "production";
}) {
  const { clientId, redirectUri } = getDiscordConfig();
  const state = createIntegrationOAuthState({
    organizationId: input.organizationId,
    environment: input.environment,
    provider: "discord",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    permissions: DISCORD_BOT_PERMISSIONS,
    scope: "bot",
    response_type: "code",
    redirect_uri: redirectUri,
    state,
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}
