import { WebhookDetailPanel } from "@/components/dashboard/developers/webhook-detail-panel";
import { DeveloperAccessGate } from "@/components/dashboard/developers/developer-access-gate";

type WebhookDetailPageProps = {
  params: Promise<{ webhookId: string }>;
};

export default async function WebhookDetailPage({ params }: WebhookDetailPageProps) {
  const { webhookId } = await params;

  return (
    <DeveloperAccessGate>
      <WebhookDetailPanel webhookId={webhookId} />
    </DeveloperAccessGate>
  );
}
