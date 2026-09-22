import { NextResponse } from "next/server";
import { auth } from "@/lib/dashboard/mock/auth";
import { WEBHOOK_EVENTS } from "@/constants/dashboard/webhooks/events";
import { getOrganizationForMember } from "@/lib/dashboard/organizations/settlement-wallet";
import { validateDiscordWebhookUrl } from "@/lib/dashboard/integrations/discord/client";
import { fetchDiscordWebhookInfo } from "@/lib/dashboard/integrations/discord/webhook-info";
import { sendIntegrationConnectionTest } from "@/lib/dashboard/integrations/notifications/dispatch";
import {
  notificationConnectSchema,
  normalizeNotificationSettings,
} from "@/lib/dashboard/integrations/notifications/settings";
import { validateSlackWebhookUrl } from "@/lib/dashboard/integrations/slack/client";
import {
  getNotificationIntegrationSettings,
  getOrganizationIntegration,
  markIntegrationError,
  toPublicIntegration,
  updateNotificationIntegrationSettings,
  upsertNotificationIntegration,
} from "@/lib/dashboard/integrations/service";
import type { NotificationProviderId } from "@/lib/dashboard/integrations/types";

function validateWebhookUrl(provider: NotificationProviderId, webhookUrl: string) {
  if (provider === "discord") {
    return validateDiscordWebhookUrl(webhookUrl);
  }

  return validateSlackWebhookUrl(webhookUrl);
}

export async function handleNotificationConnect(
  request: Request,
  organizationId: string,
  provider: NotificationProviderId,
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

  const body = await request.json();
  const parsed = notificationConnectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    const webhookUrl = validateWebhookUrl(provider, parsed.data.webhookUrl);
    let channelLabel = parsed.data.channelLabel?.trim();
    const settingsInput: Parameters<typeof normalizeNotificationSettings>[0] = {
      events: parsed.data.events,
      templates: parsed.data.templates,
      channelLabel,
    };

    if (provider === "discord") {
      const webhook = await fetchDiscordWebhookInfo(webhookUrl);
      channelLabel = webhook.label;
      settingsInput.channelLabel = webhook.label;
      settingsInput.discordChannelId = webhook.channelId;
      settingsInput.discordGuildId = webhook.guildId;
      settingsInput.discordWebhookName = webhook.name;
    }

    const settings = normalizeNotificationSettings(settingsInput);

    await sendIntegrationConnectionTest({
      provider,
      webhookUrl,
      organizationName: organization.name,
      environment: organization.environment,
    });

    const integration = await upsertNotificationIntegration({
      organizationId: organization.id,
      environment: organization.environment,
      provider,
      webhookUrl,
      settings,
      channelLabel: channelLabel || parsed.data.channelLabel,
    });

    return NextResponse.json({ integration: toPublicIntegration(integration) });
  } catch (error) {
    const existing = await getOrganizationIntegration(
      organization.id,
      organization.environment,
      provider,
    );

    if (existing) {
      await markIntegrationError(
        existing.id,
        error instanceof Error ? error.message : "Unable to connect integration",
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to connect integration",
      },
      { status: 400 },
    );
  }
}

export async function handleNotificationSettingsUpdate(
  request: Request,
  organizationId: string,
  provider: NotificationProviderId,
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
    provider,
  );

  if (!integration || integration.status !== "connected") {
    return NextResponse.json({ error: "Integration not connected" }, { status: 404 });
  }

  const body = await request.json();
  const events = Array.isArray(body.events)
    ? body.events.filter((event: string) =>
        WEBHOOK_EVENTS.includes(event as (typeof WEBHOOK_EVENTS)[number]),
      )
    : undefined;

  const currentSettings = getNotificationIntegrationSettings(integration);

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
    ...(typeof body.channelLabel === "string"
      ? { channelLabel: body.channelLabel }
      : {}),
  });

  const updated = await updateNotificationIntegrationSettings(
    integration.id,
    settings,
    typeof body.channelLabel === "string" ? body.channelLabel : undefined,
  );

  if (!updated) {
    return NextResponse.json({ error: "Unable to save settings" }, { status: 500 });
  }

  return NextResponse.json({ integration: toPublicIntegration(updated) });
}

export async function handleNotificationTest(
  request: Request,
  organizationId: string,
  provider: NotificationProviderId,
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
    provider,
  );

  if (!integration || integration.status !== "connected") {
    return NextResponse.json({ error: "Integration not connected" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const event =
    typeof body.event === "string" &&
    WEBHOOK_EVENTS.includes(body.event as (typeof WEBHOOK_EVENTS)[number])
      ? body.event
      : "payment.completed";
  const template =
    typeof body.template === "string" ? body.template : undefined;

  const { assertIntegrationTestAllowed } = await import(
    "@/lib/dashboard/integrations/notifications/test-rate-limit"
  );
  const { sendIntegrationTestNotification } = await import(
    "@/lib/dashboard/integrations/notifications/dispatch"
  );
  const { buildTestWebhookPayload } = await import("@/lib/dashboard/webhooks/delivery");

  try {
    assertIntegrationTestAllowed(integration.id);

    await sendIntegrationTestNotification({
      integration,
      organizationName: organization.name,
      environment: organization.environment,
      event,
      payload: buildTestWebhookPayload(),
      template,
    });

    return NextResponse.json({ ok: true, event });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to send test notification",
      },
      { status: 400 },
    );
  }
}
