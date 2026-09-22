export function validateSlackWebhookUrl(input: string) {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("Slack webhook URL is invalid.");
  }

  if (url.protocol !== "https:") {
    throw new Error("Slack webhook URL must use HTTPS.");
  }

  if (url.hostname !== "hooks.slack.com") {
    throw new Error("Slack webhook URL must point to hooks.slack.com.");
  }

  if (!url.pathname.startsWith("/services/")) {
    throw new Error("Slack webhook URL must be an incoming webhook URL.");
  }

  return url.toString();
}

async function parseSlackError(response: Response) {
  const text = await response.text();

  try {
    const data = JSON.parse(text) as { error?: string };
    return data.error ?? (text || `Slack API returned HTTP ${response.status}`);
  } catch {
    return text || `Slack API returned HTTP ${response.status}`;
  }
}

export async function sendSlackWebhook(input: {
  webhookUrl: string;
  body: Record<string, unknown>;
}) {
  const webhookUrl = validateSlackWebhookUrl(input.webhookUrl);
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.body),
  });

  const text = await response.text();

  if (response.ok && text === "ok") {
    return;
  }

  if (response.ok) {
    return;
  }

  throw new Error(await parseSlackError(response));
}
