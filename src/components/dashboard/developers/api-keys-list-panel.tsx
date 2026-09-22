"use client";

import { useMemo, useState } from "react";
import { ApiKeysTable } from "@/components/dashboard/ui/developers/api-keys-table";
import { useSetDashboardPageHeader } from "@/components/dashboard/ui/layout/dashboard-page-header-context";
import { useCreateApiKeyModal } from "@/components/dashboard/ui/modals/add-edit-api-key-modal";
import { useApiKeyCreatedModal } from "@/components/dashboard/ui/modals/api-key-created-modal";
import { Button } from "@dub/ui";
import { Plus2 } from "@dub/ui/icons";

export function ApiKeysListPanel({ organizationId }: { organizationId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [createdSecret, setCreatedSecret] = useState("");

  const { ApiKeyCreatedModal, setShowApiKeyCreatedModal } = useApiKeyCreatedModal({
    secret: createdSecret,
  });

  const onApiKeyCreated = (secret: string) => {
    setCreatedSecret(secret);
    setShowApiKeyCreatedModal(true);
  };

  const { CreateApiKeyModal, setShowCreateApiKeyModal } = useCreateApiKeyModal({
    onApiKeyCreated,
    onSaved: () => setRefreshKey((current) => current + 1),
  });

  const openCreateModal = () => {
    setShowCreateApiKeyModal(true);
  };

  const headerOverride = useMemo(
    () => ({
      titleInfo: {
        title:
          "These API keys allow other apps to access your business. Use them with caution: do not share your API key with others, or expose it in the browser or other client-side code.",
        href: "/dashboard/developers/documentation",
      },
      controls: (
        <Button
          type="button"
          variant="primary"
          text="Create API key"
          icon={<Plus2 className="size-4" />}
          className="h-9 w-fit"
          onClick={openCreateModal}
        />
      ),
    }),
    [],
  );

  useSetDashboardPageHeader(headerOverride);

  return (
    <>
      <ApiKeyCreatedModal />
      <CreateApiKeyModal />

      <ApiKeysTable
        organizationId={organizationId}
        refreshKey={refreshKey}
        onCreateClick={openCreateModal}
        onRevoked={() => setRefreshKey((current) => current + 1)}
      />
    </>
  );
}
