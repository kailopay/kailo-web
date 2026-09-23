"use client";

import { useMemo } from "react";
import type { DeveloperOrder } from "@/lib/kailopay/developer/types";
import { formatIdrMinor, formatXlm } from "@/lib/kailopay/developer/format";
import { TransactionsTableSkeleton } from "@/components/dashboard/ui/transactions/transactions-table-skeleton";
import { TableEmptyState } from "@/components/dashboard/ui/shared/table-empty-state";
import { Table, useTable } from "@dub/ui";
import { InvoiceDollar } from "@dub/ui/icons";
import { formatDate } from "@dub/utils";
import type { Row } from "@tanstack/react-table";

export type DeveloperOrderRow = {
  id: string;
  createdAt: string;
  clientName: string;
  direction: string;
  status: string;
  paymentMethod: string;
  fiatAmount: string;
  assetAmount: string;
  latestEvent: string;
};

export function mapDeveloperOrder(order: DeveloperOrder): DeveloperOrderRow {
  return {
    id: order.id,
    createdAt: order.created_at,
    clientName: order.client_name || order.client_id,
    direction: order.direction,
    status: order.status,
    paymentMethod: order.payment_method,
    fiatAmount: formatIdrMinor(order.fiat_amount_minor),
    assetAmount: formatXlm(order.asset_amount),
    latestEvent: order.latest_event_type,
  };
}

export function DeveloperOrdersTable({
  orders,
  isLoading,
  emptyTitle = "No orders yet",
  emptyDescription = "Orders created through the API or playground will appear here.",
}: {
  orders: DeveloperOrder[];
  isLoading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const rows = useMemo(() => orders.map(mapDeveloperOrder), [orders]);

  const columns = useMemo(
    () => [
      {
        id: "createdAt",
        header: "Created",
        accessorKey: "createdAt",
        minSize: 120,
        cell: ({ row }: { row: Row<DeveloperOrderRow> }) =>
          formatDate(row.original.createdAt, { month: "short" }),
      },
      {
        id: "id",
        header: "Order",
        accessorKey: "id",
        minSize: 120,
        cell: ({ row }: { row: Row<DeveloperOrderRow> }) => (
          <span className="font-mono text-xs text-neutral-600">
            {row.original.id.slice(0, 8)}…
          </span>
        ),
      },
      {
        id: "clientName",
        header: "Client",
        accessorKey: "clientName",
        minSize: 140,
      },
      {
        id: "direction",
        header: "Direction",
        accessorKey: "direction",
        minSize: 100,
        cell: ({ row }: { row: Row<DeveloperOrderRow> }) => (
          <span className="capitalize">{row.original.direction}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        minSize: 120,
      },
      {
        id: "paymentMethod",
        header: "Payment",
        accessorKey: "paymentMethod",
        minSize: 100,
      },
      {
        id: "fiatAmount",
        header: "IDR",
        accessorKey: "fiatAmount",
        minSize: 120,
      },
      {
        id: "assetAmount",
        header: "XLM",
        accessorKey: "assetAmount",
        minSize: 120,
      },
      {
        id: "latestEvent",
        header: "Latest event",
        accessorKey: "latestEvent",
        minSize: 160,
      },
    ],
    [],
  );

  const { table, ...tableProps } = useTable({
    data: rows,
    columns,
    thClassName: "border-l-0",
    tdClassName: "border-l-0",
    resourceName: (plural) => `order${plural ? "s" : ""}`,
    rowCount: rows.length,
  });

  if (isLoading) {
    return <TransactionsTableSkeleton rowCount={6} />;
  }

  if (rows.length === 0) {
    return (
      <TableEmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={<InvoiceDollar className="size-4 text-neutral-700" />}
      />
    );
  }

  return <Table {...tableProps} table={table} />;
}
