const SLACK_API_BASE = "https://slack.com/api";

type SlackApiResponse = {
  ok: boolean;
  error?: string;
};

type SlackConversation = {
  id: string;
  name: string;
  is_channel?: boolean;
  is_group?: boolean;
  is_private?: boolean;
  is_archived?: boolean;
  is_member?: boolean;
};

async function slackBotFetch(
  botToken: string,
  method: string,
  init?: RequestInit,
) {
  const response = await fetch(`${SLACK_API_BASE}/${method}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${botToken}`,
      ...(init?.headers ?? {}),
    },
  });

  return response;
}

function formatSlackApiError(error: string, channelIsPrivate?: boolean) {
  if (error === "not_in_channel") {
    if (channelIsPrivate) {
      return "The KailoPay app is not in this private channel. In Slack, open the channel and run /invite @KailoPay, then try again.";
    }

    return "The KailoPay app could not post to this channel. Reconnect Slack or pick another channel.";
  }

  if (error === "missing_scope") {
    return "Slack authorization is missing required permissions. Disconnect and use Add to Slack again.";
  }

  return error;
}

async function parseSlackApiError(
  response: Response,
  data?: SlackApiResponse,
  channelIsPrivate?: boolean,
) {
  if (data?.error) {
    return formatSlackApiError(data.error, channelIsPrivate);
  }

  try {
    const fallback = (await response.json()) as SlackApiResponse;
    return formatSlackApiError(
      fallback.error ?? `Slack API returned HTTP ${response.status}`,
      channelIsPrivate,
    );
  } catch {
    return `Slack API returned HTTP ${response.status}`;
  }
}

export async function listSlackWorkspaceChannels(botToken: string) {
  const response = await slackBotFetch(
    botToken,
    "conversations.list?types=public_channel,private_channel&exclude_archived=true&limit=200",
  );

  const data = (await response.json()) as SlackApiResponse & {
    channels?: SlackConversation[];
  };

  if (!response.ok || !data.ok) {
    throw new Error(await parseSlackApiError(response, data));
  }

  return (data.channels ?? [])
    .filter((channel) => !channel.is_archived)
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
      isPrivate: Boolean(channel.is_private || channel.is_group),
      isMember: Boolean(channel.is_member),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function joinSlackPublicChannel(input: {
  botToken: string;
  channelId: string;
}) {
  const response = await slackBotFetch(input.botToken, "conversations.join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: input.channelId,
    }),
  });

  const data = (await response.json()) as SlackApiResponse;

  if (!response.ok || !data.ok) {
    throw new Error(await parseSlackApiError(response, data));
  }
}

export async function sendSlackChannelMessage(input: {
  botToken: string;
  channelId: string;
  body: Record<string, unknown>;
  channelIsPrivate?: boolean;
}) {
  const post = async () => {
    const response = await slackBotFetch(input.botToken, "chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: input.channelId,
        ...input.body,
      }),
    });

    const data = (await response.json()) as SlackApiResponse;

    if (!response.ok || !data.ok) {
      const error = new Error(
        await parseSlackApiError(response, data, input.channelIsPrivate),
      ) as Error & { slackError?: string };
      error.slackError = data.error;
      throw error;
    }
  };

  try {
    await post();
  } catch (error) {
    const slackError =
      error instanceof Error &&
      "slackError" in error &&
      typeof error.slackError === "string"
        ? error.slackError
        : null;

    if (!input.channelIsPrivate && slackError === "not_in_channel") {
      await joinSlackPublicChannel({
        botToken: input.botToken,
        channelId: input.channelId,
      });
      await post();
      return;
    }

    throw error;
  }
}

export async function leaveSlackChannel(input: {
  botToken: string;
  channelId: string;
}) {
  const response = await slackBotFetch(input.botToken, "conversations.leave", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: input.channelId,
    }),
  });

  const data = (await response.json()) as SlackApiResponse;

  if (data.ok || data.error === "not_in_channel") {
    return;
  }

  throw new Error(await parseSlackApiError(response, data));
}

export async function assertSlackChannelInWorkspace(input: {
  botToken: string;
  channelId: string;
}) {
  const channels = await listSlackWorkspaceChannels(input.botToken);
  const channel = channels.find((item) => item.id === input.channelId);

  if (!channel) {
    throw new Error(
      "Selected channel is not available in this Slack workspace.",
    );
  }

  if (channel.isPrivate && !channel.isMember) {
    throw new Error(
      "The KailoPay app is not in this private channel. In Slack, open the channel and run /invite @KailoPay, then try again.",
    );
  }

  return channel;
}
