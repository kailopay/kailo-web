import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/dashboard/mock/auth";
import { WEBHOOK_EVENTS } from "@/constants/dashboard/webhooks/events";
import type { Organization } from "@/lib/dashboard/db/schema";
import {
  assertSlackChannelInWorkspace,
  leaveSlackChannel,
  sendSlackChannelMessage,
} from "@/lib/dashboard/integrations/slack/bot";
import { isSlackBotConfigured } from "@/lib/dashboard/integrations/slack/env";
import { buildSlackBotOAuthUrl } from "@/lib/dashboard/integrations/slack/oauth";
import {
  buildConnectionTestMessage,
  buildSlackMessage,
} from "@/lib/dashboard/integrations/notifications/render";
import { normalizeNotificationSettings } from "@/lib/dashboard/integrations/notifications/settings";
import { getOrganizationForMember } from "@/lib/dashboard/organizations/settlement-wallet";
import {
  getNotificationIntegrationSettings,
  getOrganizationIntegration,
  getSlackBotCredentials,
  markIntegrationError,
  markSlackBotIntegrationConnected,
  resetNotificationBotSetup,
  toPublicIntegration,
  updateNotificationIntegrationSettings,
  upsertPendingSlackIntegration,
} from "@/lib/dashboard/integrations/service";

const completeSchema = z.object({
  channelId: z.string().min(1, "Select a channel"),
  events: z.array(z.enum(WEBHOOK_EVENTS)).optional(),
  templates: z.record(z.string(), z.string().max(2000)).optional(),
});

export async function handleSlackConnect(organizationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await getOrganizationForMember(
    organizationId,
    session.user.id,
  );
  if (!organization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isSlackBotConfigured()) {
    return NextResponse.json(
      {
        error:
          "Slack app is not configured on this KailoPay instance. Ask your administrator to set SLACK_CLIENT_ID and SLACK_CLIENT_SECRET.",
      },
      { status: 503 },
    );
  }

  try {
    await upsertPendingSlackIntegration({
      organizationId: organization.id,
      environment: organization.environment,
    });

    const authorizationUrl = buildSlackBotOAuthUrl({
      organizationId: organization.id,
      environment: organization.environment,
    });

    return NextResponse.json({ authorizationUrl });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start Slack connection",
      },
      { status: 400 },
    );
  }
}

export async function handleSlackChannels(organizationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await getOrganizationForMember(
    organizationId,
    session.user.id,
  );
  if (!organization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const integration = await getOrganizationIntegration(
    organization.id,
    organization.environment,
    "slack",
  );

  const settings = integration
    ? getNotificationIntegrationSettings(integration)
    : null;
  const credentials = integration ? getSlackBotCredentials(integration) : null;

  if (!integration || !settings?.slackTeamId || !credentials?.botToken) {
    if (integration && integration.status !== "connected") {
      await resetNotificationBotSetup(integration);
    }

    return NextResponse.json(
      {
        error: "Add the app to your Slack workspace first.",
        reset: true,
      },
      { status: 400 },
    );
  }

  try {
    const { listSlackWorkspaceChannels } = await import(
      "@/lib/dashboard/integrations/slack/bot"
    );
    const channels = await listSlackWorkspaceChannels(credentials.botToken);

    return NextResponse.json({
      team: {
        id: settings.slackTeamId,
        name: settings.slackTeamName ?? integration.storeIdentifier,
      },
      channels,
      selectedChannelId: settings.slackChannelId ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load Slack channels",
      },
      { status: 400 },
    );
  }
}

export async function handleSlackComplete(
  request: Request,
  organizationId: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await getOrganizationForMember(
    organizationId,
    session.user.id,
  );
  if (!organization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const integration = await getOrganizationIntegration(
    organization.id,
    organization.environment,
    "slack",
  );

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  const currentSettings = getNotificationIntegrationSettings(integration);
  const credentials = getSlackBotCredentials(integration);

  if (!currentSettings.slackTeamId || !credentials?.botToken) {
    return NextResponse.json(
      { error: "Add the app to your Slack workspace first." },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    const channel = await assertSlackChannelInWorkspace({
      botToken: credentials.botToken,
      channelId: parsed.data.channelId,
    });

    const settings = normalizeNotificationSettings({
      ...currentSettings,
      events: parsed.data.events ?? currentSettings.events,
      templates: parsed.data.templates ?? currentSettings.templates,
      slackChannelId: channel.id,
      slackChannelName: channel.name,
      slackChannelIsPrivate: channel.isPrivate,
    });

    await sendSlackChannelMessage({
      botToken: credentials.botToken,
      channelId: channel.id,
      channelIsPrivate: channel.isPrivate,
      body: buildConnectionTestMessage({
        provider: "slack",
        organizationName: organization.name,
        environment: organization.environment,
      }),
    });

    const updated = await markSlackBotIntegrationConnected({
      integrationId: integration.id,
      teamId: currentSettings.slackTeamId,
      teamName:
        currentSettings.slackTeamName ?? integration.storeIdentifier,
      channelId: channel.id,
      channelName: channel.name,
      settings,
      botToken: credentials.botToken,
    });

    if (!updated) {
      throw new Error("Unable to save Slack integration");
    }

    return NextResponse.json({ integration: toPublicIntegration(updated) });
  } catch (error) {
    await markIntegrationError(
      integration.id,
      error instanceof Error ? error.message : "Unable to connect Slack",
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to connect Slack",
      },
      { status: 400 },
    );
  }
}

export async function handleSlackSettingsUpdate(
  request: Request,
  organizationId: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await getOrganizationForMember(
    organizationId,
    session.user.id,
  );
  if (!organization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const integration = await getOrganizationIntegration(
    organization.id,
    organization.environment,
    "slack",
  );

  if (!integration || integration.status !== "connected") {
    return NextResponse.json({ error: "Integration not connected" }, { status: 404 });
  }

  const currentSettings = getNotificationIntegrationSettings(integration);
  const credentials = getSlackBotCredentials(integration);

  if (!currentSettings.slackTeamId || !credentials?.botToken) {
    return NextResponse.json(
      { error: "Slack workspace is not configured" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const events = Array.isArray(body.events)
    ? body.events.filter((event: string) =>
        WEBHOOK_EVENTS.includes(event as (typeof WEBHOOK_EVENTS)[number]),
      )
    : undefined;

  let channelId = currentSettings.slackChannelId;
  let channelName = currentSettings.slackChannelName;
  let channelIsPrivate = currentSettings.slackChannelIsPrivate;
  const previousChannelId = currentSettings.slackChannelId;

  if (typeof body.channelId === "string" && body.channelId !== channelId) {
    const channel = await assertSlackChannelInWorkspace({
      botToken: credentials.botToken,
      channelId: body.channelId,
    });
    channelId = channel.id;
    channelName = channel.name;
    channelIsPrivate = channel.isPrivate;
  }

  if (
    previousChannelId &&
    channelId &&
    previousChannelId !== channelId
  ) {
    try {
      await leaveSlackChannel({
        botToken: credentials.botToken,
        channelId: previousChannelId,
      });
    } catch {
      // Best effort — the bot may never have joined the previous channel.
    }

    await sendSlackChannelMessage({
      botToken: credentials.botToken,
      channelId,
      channelIsPrivate,
      body: buildConnectionTestMessage({
        provider: "slack",
        organizationName: organization.name,
        environment: organization.environment,
      }),
    });
  }

  const storeIdentifier = channelName
    ? currentSettings.slackTeamName
      ? `${currentSettings.slackTeamName} · #${channelName}`
      : `#${channelName}`
    : undefined;

  const settings = normalizeNotificationSettings({
    ...currentSettings,
    ...(events !== undefined ? { events } : {}),
    ...(body.templates && typeof body.templates === "object"
      ? {
          templates: {
            ...currentSettings.templates,
            ...body.templates,
          },
        }
      : {}),
    slackChannelId: channelId,
    slackChannelName: channelName,
    slackChannelIsPrivate: channelIsPrivate,
    channelLabel: channelName ? `#${channelName}` : currentSettings.channelLabel,
  });

  const updated = await updateNotificationIntegrationSettings(
    integration.id,
    settings,
    storeIdentifier,
  );

  if (!updated) {
    return NextResponse.json({ error: "Unable to save settings" }, { status: 500 });
  }

  return NextResponse.json({ integration: toPublicIntegration(updated) });
}

export async function sendSlackBotNotification(input: {
  botToken: string;
  channelId: string;
  channelIsPrivate?: boolean;
  event: (typeof WEBHOOK_EVENTS)[number];
  environment: Organization["environment"];
  payload: Record<string, unknown>;
  template?: string;
}) {
  await sendSlackChannelMessage({
    botToken: input.botToken,
    channelId: input.channelId,
    channelIsPrivate: input.channelIsPrivate,
    body: buildSlackMessage({
      provider: "slack",
      event: input.event,
      environment: input.environment,
      payload: input.payload,
      template: input.template,
    }),
  });
}
