"use client";

import { useCallback, useState } from "react";
import { AlertBlock } from "@/components/dashboard/shared/alert-block";
import { DeveloperOrdersTable } from "@/components/dashboard/ui/developers/developer-orders-table";
import { useAsyncData } from "@/hooks/dashboard/use-async-data";
import { developerErrorMessage } from "@/lib/kailopay/developer/access";
import { listDeveloperOrders } from "@/lib/kailopay/developer/dashboard";
import type { DeveloperOrder } from "@/lib/kailopay/developer/types";
import { Button } from "@dub/ui";

export function DeveloperOrdersPanel() {
  const [pagingId, setPagingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<DeveloperOrder[]>([]);
  const [nextPagingId, setNextPagingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const response = await listDeveloperOrders({
      limit: 20,
      paging_id: pagingId ?? undefined,
    });
    if (pagingId) {
      setOrders((current) => [...current, ...response.orders]);
    } else {
      setOrders(response.orders);
    }
    setNextPagingId(response.paging_id);
    return response;
  }, [pagingId]);

  const { error, isLoading, reload } = useAsyncData(fetchOrders, [pagingId]);

  return (
    <div className="space-y-5">
      {error ? (
        <div className="space-y-4">
          <AlertBlock type="error">{developerErrorMessage(error)}</AlertBlock>
          <Button
            type="button"
            variant="secondary"
            text="Retry"
            onClick={() => {
              setPagingId(null);
              setOrders([]);
              reload();
            }}
          />
        </div>
      ) : null}

      <DeveloperOrdersTable orders={orders} isLoading={isLoading && orders.length === 0} />

      {nextPagingId ? (
        <Button
          type="button"
          variant="secondary"
          text="Load more"
          disabled={isLoading}
          onClick={() => setPagingId(nextPagingId)}
        />
      ) : null}
    </div>
  );
}
