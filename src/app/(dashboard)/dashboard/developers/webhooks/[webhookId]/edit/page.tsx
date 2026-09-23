import { redirect } from "next/navigation";

type WebhookEditPageProps = {
  params: Promise<{ webhookId: string }>;
};

export default async function WebhookEditPage({ params }: WebhookEditPageProps) {
  const { webhookId } = await params;
  redirect(`/dashboard/developers/webhooks/${webhookId}`);
}
