"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertBlock } from "@/components/dashboard/shared/alert-block";
import { Button } from "@/components/dashboard/ui/button";
import { DashboardAnalyticsPageLoading } from "@/components/dashboard/ui/layout/dashboard-page-loading";
import { getMe, updateProfile } from "@/lib/kailopay/auth";
import type { User } from "@/lib/kailopay/types";
import {
  developerErrorMessage,
  isDeveloperModeRequired,
} from "@/lib/kailopay/developer/access";
import type { ReactNode } from "react";

type DeveloperAccessGateProps = {
  children: ReactNode;
};

export function DeveloperAccessGate({ children }: DeveloperAccessGateProps) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabling, setIsEnabling] = useState(false);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setUser(await getMe());
    } catch (loadError) {
      setError(developerErrorMessage(loadError));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  async function enableDeveloperMode() {
    setIsEnabling(true);
    setError(null);
    try {
      setUser(await updateProfile({ developer_enabled: true }));
    } catch (enableError) {
      setError(developerErrorMessage(enableError));
    } finally {
      setIsEnabling(false);
    }
  }

  if (isLoading) {
    return <DashboardAnalyticsPageLoading />;
  }

  if (error && !user) {
    return (
      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-8">
        <AlertBlock type="error">{error}</AlertBlock>
        <Button type="button" onClick={() => void loadUser()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!user?.developer_enabled) {
    return (
      <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-8">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Enable Developer Mode</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Developer Mode unlocks analytics, verified wallets, API keys, and webhook
            management for your integration.
          </p>
        </div>
        {error ? <AlertBlock type="error">{error}</AlertBlock> : null}
        <Button
          type="button"
          isLoading={isEnabling}
          onClick={() => void enableDeveloperMode()}
        >
          Enable Developer Mode
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export function useDeveloperAccessError(error: unknown): boolean {
  return isDeveloperModeRequired(error);
}
