"use client";

import { useCallback, useMemo, useState } from "react";
import { useAsyncData } from "@/hooks/dashboard/use-async-data";
import type { ApiKeyRow } from "@/lib/dashboard/api-keys/types";
import { apiKeyErrorMessage, listApiKeys, revokeApiKey } from "@/lib/kailopay/developer/api-keys";
import { ApiKeysTableSkeleton } from "@/components/dashboard/ui/developers/api-keys-table-skeleton";
import { TableEmptyState } from "@/components/dashboard/ui/shared/table-empty-state";
import { Button, MenuItem, Popover, Table, usePagination, useTable } from "@dub/ui";
import { DatabaseKey, Dots, Key, Trash } from "@dub/ui/icons";
import { cn, formatDate, timeAgo } from "@dub/utils";
import type { Row } from "@tanstack/react-table";
import { Command } from "cmdk";
import { toast } from "sonner";

export function ApiKeysTable({
  organizationId,
  refreshKey = 0,
  onCreateClick,
  onRevoked,
}: {
  organizationId: string;
  refreshKey?: number;
  onCreateClick?: () => void;
  onRevoked?: () => void;
}) {
  const { pagination, setPagination } = usePagination();
  const [localRefreshKey, setLocalRefreshKey] = useState(0);

  const fetchKeys = useCallback(async () => {
    try {
      return await listApiKeys();
    } catch (error) {
      throw new Error(apiKeyErrorMessage(error));
    }
  }, []);

  const { data: keys, error, isLoading } = useAsyncData(fetchKeys, [
    organizationId,
    refreshKey,
    localRefreshKey,
  ]);

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        minSize: 160,
        cell: ({ row }: { row: Row<ApiKeyRow> }) => (
          <span className="flex items-center gap-2">
            <Key className="size-4 text-neutral-500" />
            <span className={cn(row.original.revokedAt && "text-neutral-400 line-through")}>
              {row.original.name}
            </span>
          </span>
        ),
      },
      {
        id: "keyPrefix",
        header: "Key",
        accessorKey: "keyPrefix",
        minSize: 140,
        cell: ({ row }: { row: Row<ApiKeyRow> }) => (
          <span className="font-mono text-xs text-neutral-600">{row.original.keyPrefix}</span>
        ),
      },
      {
        id: "createdAt",
        header: "Created",
        accessorKey: "createdAt",
        minSize: 120,
        cell: ({ row }: { row: Row<ApiKeyRow> }) =>
          formatDate(row.original.createdAt, { month: "short" }),
      },
      {
        id: "lastUsedAt",
        header: "Last used",
        accessorKey: "lastUsedAt",
        minSize: 120,
        cell: ({ row }: { row: Row<ApiKeyRow> }) =>
          row.original.lastUsedAt ? timeAgo(new Date(row.original.lastUsedAt)) : "Never",
      },
      {
        id: "menu",
        enableHiding: false,
        cell: ({ row }: { row: Row<ApiKeyRow> }) => (
          <RowMenuButton
            row={row}
            onRevoked={() => {
              setLocalRefreshKey((current) => current + 1);
              onRevoked?.();
            }}
          />
        ),
      },
    ],
    [onRevoked],
  );

  const { table, ...tableProps } = useTable({
    data: keys ?? [],
    columns,
    columnPinning: { right: ["menu"] },
    pagination,
    onPaginationChange: setPagination,
    thClassName: "border-l-0",
    tdClassName: "border-l-0",
    resourceName: (plural) => `API key${plural ? "s" : ""}`,
    rowCount: keys?.length ?? 0,
    error: error ?? undefined,
  });

  const hasKeys = (keys?.length ?? 0) > 0;

  return (
    <div className="grid grid-cols-1">
      {isLoading ? (
        <ApiKeysTableSkeleton />
      ) : hasKeys ? (
        <Table {...tableProps} table={table} />
      ) : (
        <TableEmptyState
          title="No API keys found"
          description="No API keys have been created for this business yet."
          icon={<DatabaseKey className="size-4 text-neutral-700" />}
          addButton={
            onCreateClick
              ? (
                  <Button
                    type="button"
                    variant="primary"
                    text="Create API key"
                    onClick={onCreateClick}
                  />
                )
              : undefined
          }
        />
      )}
    </div>
  );
}

function RowMenuButton({
  row,
  onRevoked,
}: {
  row: Row<ApiKeyRow>;
  onRevoked: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const apiKey = row.original;
  const isRevoked = Boolean(apiKey.revokedAt);

  async function handleRevoke() {
    await revokeApiKey(apiKey.id);
  }

  if (isRevoked) {
    return null;
  }

  return (
    <Popover
      openPopover={isOpen}
      setOpenPopover={setIsOpen}
      content={
        <Command tabIndex={0} loop className="focus:outline-none">
          <Command.List className="flex w-screen flex-col gap-1 p-1.5 text-sm focus-visible:outline-none sm:w-auto sm:min-w-[140px]">
            <MenuItem
              as={Command.Item}
              icon={Trash}
              variant="danger"
              onSelect={() => {
                setIsOpen(false);
                toast.promise(handleRevoke(), {
                  loading: "Revoking API key...",
                  success: () => {
                    onRevoked();
                    return "API key revoked";
                  },
                  error: (err) =>
                    err instanceof Error ? err.message : "Unable to revoke API key",
                });
              }}
            >
              Revoke
            </MenuItem>
          </Command.List>
        </Command>
      }
      align="end"
    >
      <Button
        type="button"
        className="size-8 shrink-0 whitespace-nowrap rounded-lg p-0"
        variant="outline"
        icon={<Dots className="h-4 w-4 shrink-0" />}
      />
    </Popover>
  );
}
