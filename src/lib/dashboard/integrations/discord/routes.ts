import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/dashboard/mock/auth";
import { WEBHOOK_EVENTS } from "@/constants/dashboard/webhooks/events";
import type { Organization } from "@/lib/dashboard/db/schema";
import {
  assertDiscordChannelInGuild,
  sendDiscordChannelMessage,
} from "@/lib/dashboard/integrations/discord/bot";
import { isDiscordBotConfigured } from "@/lib/dashboard/integrations/discord/env";
import { buildDiscordBotOAuthUrl } from "@/lib/dashboard/integrations/discord/oauth";
import {
  buildConnectionTestMessage,
  buildDiscordMessage,
} from "@/lib/dashboard/integrations/notifications/render";
import {
  normalizeNotificationSettings,
} from "@/lib/dashboard/integrations/notifications/settings";
import { getOrganizationForMember } from "@/lib/dashboard/organizations/settlement-wallet";
import {
  getNotificationIntegrationSettings,
  getOrganizationIntegration,
  markDiscordBotIntegrationConnected,
  markIntegrationError,
  resetNotificationBotSetup,
  toPublicIntegration,
  updateNotificationIntegrationSettings,
  upsertPendingDiscordIntegration,
} from "@/lib/dashboard/integrations/service";

const completeSchema = z.object({
  channelId: z.string().min(1, "Select a channel"),
  events: z.array(z.enum(WEBHOOK_EVENTS)).optional(),
  templates: z.record(z.string(), z.string().max(2000)).optional(),
});

export async function handleDiscordConnect(
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

  if (!isDiscordBotConfigured()) {
    return NextResponse.json(
      {
        error:
          "Discord bot is not configured on this KailoPay instance. Ask your administrator to set DISCORD_CLIENT_ID and DISCORD_BOT_TOKEN.",
      },
      { status: 503 },
    );
  }

  try {
    await upsertPendingDiscordIntegration({
      organizationId: organization.id,
      environment: organization.environment,
    });

    const authorizationUrl = buildDiscordBotOAuthUrl({
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
            : "Unable to start Discord connection",
      },
      { status: 400 },
    );
  }
}

export async function handleDiscordChannels(organizationId: string) {
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
    "discord",
  );

  const settings = integration
    ? getNotificationIntegrationSettings(integration)
    : null;

  if (!integration || !settings?.discordGuildId) {
    if (integration && integration.status !== "connected") {
      await resetNotificationBotSetup(integration);
    }

    return NextResponse.json(
      {
        error: "Add the bot to your Discord server first.",
        reset: true,
      },
      { status: 400 },
    );
  }

  try {
    const { listDiscordGuildTextChannels } = await import(
      "@/lib/dashboard/integrations/discord/bot"
    );
    const channels = await listDiscordGuildTextChannels(settings.discordGuildId);

    return NextResponse.json({
      guild: {
        id: settings.discordGuildId,
        name: settings.discordGuildName ?? integration.storeIdentifier,
      },
      channels,
      selectedChannelId: settings.discordChannelId ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load Discord channels",
      },
      { status: 400 },
    );
  }
}

export async function handleDiscordComplete(
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
    "discord",
  );

  if (!integration) {
    return NextResponse.json({ error: "Integration not found" }, { status: 404 });
  }

  const currentSettings = getNotificationIntegrationSettings(integration);
  if (!currentSettings.discordGuildId) {
    return NextResponse.json(
      { error: "Add the bot to your Discord server first." },
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
    const channel = await assertDiscordChannelInGuild({
      guildId: currentSettings.discordGuildId,
      channelId: parsed.data.channelId,
    });

    const settings = normalizeNotificationSettings({
      ...currentSettings,
      events: parsed.data.events ?? currentSettings.events,
      templates: parsed.data.templates ?? currentSettings.templates,
      discordChannelId: channel.id,
      discordChannelName: channel.name,
    });

    await sendDiscordChannelMessage({
      channelId: channel.id,
      body: buildConnectionTestMessage({
        provider: "discord",
        organizationName: organization.name,
        environment: organization.environment,
      }),
    });

    const updated = await markDiscordBotIntegrationConnected({
      integrationId: integration.id,
      guildId: currentSettings.discordGuildId,
      guildName:
        currentSettings.discordGuildName ?? integration.storeIdentifier,
      channelId: channel.id,
      channelName: channel.name,
      settings,
    });

    if (!updated) {
      throw new Error("Unable to save Discord integration");
    }

    return NextResponse.json({ integration: toPublicIntegration(updated) });
  } catch (error) {
    await markIntegrationError(
      integration.id,
      error instanceof Error ? error.message : "Unable to connect Discord",
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to connect Discord",
      },
      { status: 400 },
    );
  }
}

export async function handleDiscordSettingsUpdate(
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
    "discord",
  );

  if (!integration || integration.status !== "connected") {
    return NextResponse.json({ error: "Integration not connected" }, { status: 404 });
  }

  const currentSettings = getNotificationIntegrationSettings(integration);
  if (!currentSettings.discordGuildId) {
    return NextResponse.json({ error: "Discord server is not configured" }, { status: 400 });
  }

  const body = await request.json();
  const events = Array.isArray(body.events)
    ? body.events.filter((event: string) =>
        WEBHOOK_EVENTS.includes(event as (typeof WEBHOOK_EVENTS)[number]),
      )
    : undefined;

  let channelId = currentSettings.discordChannelId;
  let channelName = currentSettings.discordChannelName;
  const previousChannelId = currentSettings.discordChannelId;

  if (typeof body.channelId === "string" && body.channelId !== channelId) {
    const channel = await assertDiscordChannelInGuild({
      guildId: currentSettings.discordGuildId,
      channelId: body.channelId,
    });
    channelId = channel.id;
    channelName = channel.name;
  }

  if (
    previousChannelId &&
    channelId &&
    previousChannelId !== channelId
  ) {
    await sendDiscordChannelMessage({
      channelId,
      body: buildConnectionTestMessage({
        provider: "discord",
        organizationName: organization.name,
        environment: organization.environment,
      }),
    });
  }

  const storeIdentifier = channelName
    ? currentSettings.discordGuildName
      ? `${currentSettings.discordGuildName} · #${channelName}`
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
    discordChannelId: channelId,
    discordChannelName: channelName,
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

export async function sendDiscordBotConnectionTest(input: {
  channelId: string;
  organizationName: string;
  environment: Organization["environment"];
}) {
  await sendDiscordChannelMessage({
    channelId: input.channelId,
    body: buildConnectionTestMessage({
      provider: "discord",
      organizationName: input.organizationName,
      environment: input.environment,
    }),
  });
}

export async function sendDiscordBotNotification(input: {
  channelId: string;
  event: (typeof WEBHOOK_EVENTS)[number];
  environment: Organization["environment"];
  payload: Record<string, unknown>;
  template?: string;
}) {
  await sendDiscordChannelMessage({
    channelId: input.channelId,
    body: buildDiscordMessage({
      provider: "discord",
      event: input.event,
      environment: input.environment,
      payload: input.payload,
      template: input.template,
    }),
  });
}
