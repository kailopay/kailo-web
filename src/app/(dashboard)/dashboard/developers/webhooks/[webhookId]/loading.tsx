import { WebhookDeliveriesSkeleton } from "@/components/dashboard/ui/developers/webhook-deliveries-skeleton";
import { WebhookPlaceholder } from "@/components/dashboard/ui/developers/webhook-placeholder";

export default function WebhookDetailLoading() {
  return (
    <div className="space-y-6">
      <WebhookPlaceholder />
      <WebhookDeliveriesSkeleton />
    </div>
  );
}
