import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildDiscordMessage,
  buildSlackMessage,
  normalizeNotificationNewlines,
  renderNotificationTemplate,
} from "./render";

test("normalizes literal \\n sequences in templates", () => {
  const rendered = renderNotificationTemplate({
    event: "payment.completed",
    environment: "sandbox",
    provider: "discord",
    payload: { id: "pay_test", status: "completed" },
    template: "Line one\\nLine two",
  });

  assert.equal(rendered, "Line one\nLine two");
});

test("buildDiscordMessage uses content for multiline body", () => {
  const message = buildDiscordMessage({
    event: "payment.completed",
    environment: "sandbox",
    provider: "discord",
    payload: {
      id: "pay_test",
      status: "completed",
      pricing_currency: "USD",
      pricing_amount: "10.00",
      quoted_paid_amount: "10",
      paid_asset: { asset_code: "USDC" },
    },
    template: "Line one\\nLine two",
  });

  assert.equal(message.content, "Line one\nLine two");
  assert.equal((message.embeds?.[0] as { description?: string }).description, undefined);
});

test("buildSlackMessage preserves newlines in block text", () => {
  const message = buildSlackMessage({
    event: "payment.completed",
    environment: "sandbox",
    provider: "slack",
    payload: { id: "pay_test", status: "completed" },
    template: "Line one\\nLine two",
  });

  const blockText = (
    message.blocks?.[0] as { text?: { text?: string } }
  )?.text?.text;

  assert.match(blockText ?? "", /Line one\nLine two/);
});

test("normalizeNotificationNewlines handles CRLF", () => {
  assert.equal(normalizeNotificationNewlines("a\r\nb"), "a\nb");
});
