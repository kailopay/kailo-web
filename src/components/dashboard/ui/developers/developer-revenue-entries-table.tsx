"use client";

import { useMemo } from "react";
import type { DeveloperRevenueEntry } from "@/lib/kailopay/developer/types";
import { formatIdrMinor, formatXlm } from "@/lib/kailopay/developer/format";
import { ApiKeysTableSkeleton } from "@/components/dashboard/ui/developers/api-keys-table-skeleton";
import { TableEmptyState } from "@/components/dashboard/ui/shared/table-empty-state";
import { Table, useTable } from "@dub/ui";
import { InvoiceDollar } from "@dub/ui/icons";
import { formatDate } from "@dub/utils";
import type { Row } from "@tanstack/react-table";

type DeveloperRevenueEntryRow = {
  orderId: string;
  createdAt: string;
  direction: string;
  grossIdr: string;
  netIdr: string;
  assetAmount: string;
  feePolicy: string;
};

function mapRevenueEntry(entry: DeveloperRevenueEntry): DeveloperRevenueEntryRow {
  return {
    orderId: entry.order_id,
    createdAt: entry.created_at,
    direction: entry.direction,
    grossIdr: formatIdrMinor(entry.gross_idr_minor),
    netIdr: formatIdrMinor(entry.net_idr_minor),
    assetAmount: formatXlm(entry.asset_amount),
    feePolicy: entry.fee_policy_version,
  };
}

export function DeveloperRevenueEntriesTable({
  entries,
  isLoading,
}: {
  entries: DeveloperRevenueEntry[];
  isLoading: boolean;
}) {
  const rows = useMemo(() => entries.map(mapRevenueEntry), [entries]);

  const columns = useMemo(
    () => [
      {
        id: "createdAt",
        header: "Created",
        accessorKey: "createdAt",
        minSize: 120,
        cell: ({ row }: { row: Row<DeveloperRevenueEntryRow> }) =>
          formatDate(row.original.createdAt, { month: "short" }),
      },
      {
        id: "orderId",
        header: "Order",
        accessorKey: "orderId",
        minSize: 120,
        cell: ({ row }: { row: Row<DeveloperRevenueEntryRow> }) => (
          <span className="font-mono text-xs text-neutral-600">
            {row.original.orderId.slice(0, 8)}…
          </span>
        ),
      },
      {
        id: "direction",
        header: "Direction",
        accessorKey: "direction",
        minSize: 100,
        cell: ({ row }: { row: Row<DeveloperRevenueEntryRow> }) => (
          <span className="capitalize">{row.original.direction}</span>
        ),
      },
      {
        id: "grossIdr",
        header: "Gross IDR",
        accessorKey: "grossIdr",
        minSize: 120,
      },
      {
        id: "netIdr",
        header: "Net IDR",
        accessorKey: "netIdr",
        minSize: 120,
      },
      {
        id: "assetAmount",
        header: "XLM",
        accessorKey: "assetAmount",
        minSize: 120,
      },
      {
        id: "feePolicy",
        header: "Policy",
        accessorKey: "feePolicy",
        minSize: 140,
      },
    ],
    [],
  );

  const { table, ...tableProps } = useTable({
    data: rows,
    columns,
    thClassName: "border-l-0",
    tdClassName: "border-l-0",
    resourceName: (plural) => `entr${plural ? "ies" : "y"}`,
    rowCount: rows.length,
  });

  if (isLoading) {
    return <ApiKeysTableSkeleton rowCount={6} />;
  }

  if (rows.length === 0) {
    return (
      <TableEmptyState
        title="No revenue entries yet"
        description="Fee records will appear here after orders complete."
        icon={<InvoiceDollar className="size-4 text-neutral-700" />}
      />
    );
  }

  return <Table {...tableProps} table={table} />;
}
