import type { NotificationProviderId } from "@/lib/dashboard/integrations/types";

const lastTestAt = new Map<string, number>();

const TEST_COOLDOWN_MS = 10_000;

export function assertIntegrationTestAllowed(integrationId: string) {
  const now = Date.now();
  const previous = lastTestAt.get(integrationId) ?? 0;

  if (now - previous < TEST_COOLDOWN_MS) {
    throw new Error("Please wait a few seconds before sending another test.");
  }

  lastTestAt.set(integrationId, now);
}

export function isNotificationProviderParam(
  provider: string,
): provider is NotificationProviderId {
  return provider === "discord" || provider === "slack";
}
