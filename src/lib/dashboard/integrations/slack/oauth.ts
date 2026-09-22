import { createIntegrationOAuthState } from "@/lib/dashboard/integrations/state";
import {
  getSlackConfig,
  SLACK_BOT_SCOPES,
} from "@/lib/dashboard/integrations/slack/env";

export function buildSlackBotOAuthUrl(input: {
  organizationId: string;
  environment: "sandbox" | "production";
}) {
  const { clientId, redirectUri } = getSlackConfig();
  const state = createIntegrationOAuthState({
    organizationId: input.organizationId,
    environment: input.environment,
    provider: "slack",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    scope: SLACK_BOT_SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

type SlackOAuthAccessResponse = {
  ok: boolean;
  error?: string;
  access_token?: string;
  team?: {
    id?: string;
    name?: string;
  };
};

export async function exchangeSlackOAuthCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getSlackConfig();

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json()) as SlackOAuthAccessResponse;

  if (!response.ok || !data.ok || !data.access_token) {
    throw new Error(data.error ?? "Slack authorization failed.");
  }

  const teamId = data.team?.id?.trim();
  if (!teamId) {
    throw new Error("Slack did not return workspace information.");
  }

  return {
    botToken: data.access_token,
    teamId,
    teamName: data.team?.name?.trim() || "Slack workspace",
  };
}
