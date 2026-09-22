"use client";

import { useMemo, useState } from "react";
import { CreateWebhookDialog } from "@/components/dashboard/developers/create-webhook-dialog";
import { WebhooksList } from "@/components/dashboard/ui/developers/webhooks-list";
import { useSetDashboardPageHeader } from "@/components/dashboard/ui/layout/dashboard-page-header-context";
import { Button } from "@dub/ui";
import { Plus2 } from "@dub/ui/icons";

export function WebhooksListPanel({ organizationId }: { organizationId: string }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const headerOverride = useMemo(
    () => ({
      titleInfo: {
        title:
          "Webhooks allow you to receive HTTP requests whenever a payment event occurs here.",
        href: "/dashboard/developers/documentation",
      },
      controls: (
        <Button
          type="button"
          variant="primary"
          text="Create webhook"
          icon={<Plus2 className="size-4" />}
          className="h-9 w-fit"
          onClick={() => setIsCreateOpen(true)}
        />
      ),
    }),
    [],
  );

  useSetDashboardPageHeader(headerOverride);

  return (
    <>
      <WebhooksList organizationId={organizationId} refreshKey={refreshKey} />

      <CreateWebhookDialog
        organizationId={organizationId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={() => {
          setRefreshKey((current) => current + 1);
        }}
      />
    </>
  );
}
