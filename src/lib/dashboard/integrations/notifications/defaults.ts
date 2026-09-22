import type { WebhookEvent } from "@/constants/dashboard/webhooks/events";
import type { NotificationProviderId } from "@/lib/dashboard/integrations/types";

export const DEFAULT_DISCORD_NOTIFICATION_TEMPLATES: Record<WebhookEvent, string> =
  {
    "payment.created":
      "**New payment started** — {{currency_summary}} is ready for your customer.\nCheckout: {{checkout_url}}",
    "payment.completed":
      "**You're paid!** {{currency_summary}}\nPaid {{token_payment_line}} · Payment `{{id}}` · Transaction: `{{tx_hash}}`",
    "payment.failed":
      "**Payment failed** for `{{id}}` — {{currency_summary}}.\nNo funds were captured — follow up with your customer if needed.",
    "payment.expired":
      "**Checkout expired** — payment `{{id}}` for {{currency_summary}} was not completed in time.",
    "payment.refunded":
      "**Refund issued** for payment `{{id}}` — {{currency_summary}}.\nReason: {{refund_reason}}",
    "payment.settlement_failed":
      "**Settlement needs attention** for payment `{{id}}` — {{currency_summary}}.\nReview it in your dashboard.",
  };

export const DEFAULT_SLACK_NOTIFICATION_TEMPLATES: Record<WebhookEvent, string> =
  {
    "payment.created":
      "*New payment started* — {{currency_summary}} is ready for your customer.\nCheckout: {{checkout_url}}",
    "payment.completed":
      "*You're paid!* {{currency_summary}}\nPaid {{token_payment_line}} · Payment `{{id}}` · Transaction: `{{tx_hash}}`",
    "payment.failed":
      "*Payment failed* for `{{id}}` — {{currency_summary}}.\nNo funds were captured — follow up with your customer if needed.",
    "payment.expired":
      "*Checkout expired* — payment `{{id}}` for {{currency_summary}} was not completed in time.",
    "payment.refunded":
      "*Refund issued* for payment `{{id}}` — {{currency_summary}}.\nReason: {{refund_reason}}",
    "payment.settlement_failed":
      "*Settlement needs attention* for payment `{{id}}` — {{currency_summary}}.\nReview it in your dashboard.",
  };

/** @deprecated Use provider-specific defaults via getDefaultTemplatesForProvider */
export const DEFAULT_NOTIFICATION_TEMPLATES = DEFAULT_DISCORD_NOTIFICATION_TEMPLATES;

export const DEFAULT_NOTIFICATION_EVENTS: WebhookEvent[] = [
  "payment.completed",
  "payment.failed",
  "payment.refunded",
];

export const NOTIFICATION_EVENT_TITLES: Record<WebhookEvent, string> = {
  "payment.created": "New payment started",
  "payment.completed": "Payment received",
  "payment.failed": "Payment failed",
  "payment.expired": "Checkout expired",
  "payment.refunded": "Refund issued",
  "payment.settlement_failed": "Settlement issue",
};

export function getDefaultTemplatesForProvider(
  provider: NotificationProviderId,
) {
  return provider === "slack"
    ? { ...DEFAULT_SLACK_NOTIFICATION_TEMPLATES }
    : { ...DEFAULT_DISCORD_NOTIFICATION_TEMPLATES };
}

export function getDefaultTemplate(
  event: WebhookEvent,
  provider: NotificationProviderId,
) {
  const templates = getDefaultTemplatesForProvider(provider);
  return (
    templates[event] ??
    (provider === "slack"
      ? "*{{event}}* — Payment `{{id}}` is *{{status}}*.\nAmount: {{currency_summary}}"
      : "**{{event}}** — Payment `{{id}}` is **{{status}}**.\nAmount: {{currency_summary}}")
  );
}

export const NOTIFICATION_TEMPLATE_VARIABLES = [
  "{{id}}",
  "{{status}}",
  "{{amount}}",
  "{{currency}}",
  "{{currency_label}}",
  "{{currency_summary}}",
  "{{pricing_amount}}",
  "{{pricing_amount_raw}}",
  "{{pricing_currency}}",
  "{{token}}",
  "{{token_amount}}",
  "{{token_amount_with_asset}}",
  "{{token_payment_line}}",
  "{{description}}",
  "{{checkout_url}}",
  "{{tx_hash}}",
  "{{deposit_tx_hash}}",
  "{{settlement_tx_hash}}",
  "{{refund_reason}}",
  "{{environment}}",
  "{{event}}",
] as const;
