import type { WebhookEvent } from "@/constants/dashboard/webhooks/events";
import type { Organization } from "@/lib/dashboard/db/schema";
import { getDefaultTemplate, NOTIFICATION_EVENT_TITLES } from "@/lib/dashboard/integrations/notifications/defaults";
import { buildFormattedNotificationFields } from "@/lib/dashboard/integrations/notifications/variables";
import type { NotificationProviderId } from "@/lib/dashboard/integrations/types";

export type NotificationRenderContext = {
  event: WebhookEvent;
  environment: Organization["environment"];
  payload: Record<string, unknown>;
  provider: NotificationProviderId;
  template?: string;
};

function readString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

/** Supports real newlines and literal `\n` sequences from saved templates. */
export function normalizeNotificationNewlines(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");
}

export function buildNotificationVariables(input: NotificationRenderContext) {
  const formatted = buildFormattedNotificationFields(input.payload);

  return {
    id: readString(input.payload, "id"),
    status: readString(input.payload, "status"),
    amount: formatted.amount,
    currency: formatted.currency,
    currency_label: formatted.currency_label,
    currency_summary: formatted.currency_summary,
    pricing_amount: formatted.pricing_amount,
    pricing_amount_raw: formatted.pricing_amount_raw,
    pricing_currency: formatted.currency,
    token: formatted.token,
    token_amount: formatted.token_amount,
    token_amount_with_asset: formatted.token_amount_with_asset,
    token_payment_line: formatted.token_payment_line,
    description: readString(input.payload, "description"),
    checkout_url: readString(input.payload, "checkout_url"),
    tx_hash: readString(input.payload, "tx_hash"),
    deposit_tx_hash: readString(input.payload, "deposit_tx_hash"),
    settlement_tx_hash: readString(input.payload, "settlement_tx_hash"),
    refund_reason: readString(input.payload, "refund_reason"),
    environment: input.environment,
    event: input.event,
  };
}

export function renderNotificationTemplate(input: NotificationRenderContext) {
  const template = normalizeNotificationNewlines(
    input.template?.trim() || getDefaultTemplate(input.event, input.provider),
  );
  const variables = buildNotificationVariables(input);

  return template.replace(/\{\{([a-z_]+)\}\}/g, (_match, key: string) => {
    return variables[key as keyof typeof variables] ?? "";
  });
}

function markdownToDiscord(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "**$1**")
    .replace(/`([^`]+)`/g, "`$1`");
}

function markdownToSlack(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    .replace(/`([^`]+)`/g, "`$1`");
}

export function buildDiscordMessage(input: NotificationRenderContext) {
  const content = markdownToDiscord(renderNotificationTemplate(input));
  const paymentId = readString(input.payload, "id");
  const status = readString(input.payload, "status");
  const title = NOTIFICATION_EVENT_TITLES[input.event] ?? input.event;

  return {
    content,
    embeds: [
      {
        title: `KailoPay · ${title}`,
        color:
          status === "completed"
            ? 0x22c55e
            : status === "failed"
              ? 0xef4444
              : 0x6366f1,
        footer: {
          text: `Environment: ${input.environment}`,
        },
        fields: paymentId
          ? [{ name: "Payment ID", value: paymentId, inline: true }]
          : [],
      },
    ],
  };
}

export function buildSlackMessage(input: NotificationRenderContext) {
  const text = markdownToSlack(renderNotificationTemplate(input));
  const title = NOTIFICATION_EVENT_TITLES[input.event] ?? input.event;

  return {
    text: `KailoPay · ${title}\n${text}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*KailoPay · ${title}*\n${text}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Environment: \`${input.environment}\``,
          },
        ],
      },
    ],
  };
}

export function buildConnectionTestMessage(input: {
  provider: NotificationProviderId;
  organizationName: string;
  environment: Organization["environment"];
}) {
  const text = `Notifications are live! KailoPay will post payment updates here for **${input.organizationName}** (${input.environment}).`;

  if (input.provider === "discord") {
    return {
      embeds: [
        {
          title: "You're all set",
          description: text.replace(/\*\*/g, "**"),
          color: 0x6366f1,
        },
      ],
    };
  }

  return {
    text: "You're all set",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*You're all set*\n${text.replace(/\*\*/g, "*")}`,
        },
      },
    ],
  };
}
