"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getMe, logout } from "@/lib/kailopay/auth";
import {
  clearPendingOrderId,
  clearRampDraft,
  createDefaultDraft,
  loadRampDraft,
  readPendingOrderId,
  saveRampDraft,
} from "@/lib/kailopay/storage";
import type { Order, RampDraft, RampStep, User } from "@/lib/kailopay/types";
import { RampHeaderConfig, RampStepHeader } from "./ramp-step-header";
import { RampViewTransition } from "./ramp-view-transition";
import { AddressStep } from "./steps/address-step";
import { AmountStep } from "./steps/amount-step";
import { AuthStep } from "./steps/auth-step";
import { KYCStep } from "./steps/kyc-step";
import { PaymentStep } from "./steps/payment-step";
import { StatusStep } from "./steps/status-step";

function defaultHeaderForStep(draft: RampDraft, handlers: {
  goToStep: (step: RampStep) => void;
  clearPaymentBack: () => void;
}): RampHeaderConfig {
  switch (draft.step) {
    case 1:
      return { title: draft.mode === "buy" ? "Buy XLM" : "Sell XLM" };
    case 2:
      return { title: "Sign in", onBack: () => handlers.goToStep(1) };
    case 3:
      return {
        title:
          draft.mode === "buy"
            ? "Where should we send your XLM?"
            : "Where should we send your IDR?",
        onBack: () => handlers.goToStep(2),
      };
    case 4:
      return { title: "Verify your identity", onBack: () => handlers.goToStep(3) };
    case 5:
      return { title: "Review and confirm", onBack: handlers.clearPaymentBack };
    case 6:
      return { title: "Order status" };
    default:
      return { title: "KailoPay" };
  }
}

export function RampFlow() {
  const [draft, setDraft] = useState<RampDraft>(() => loadRampDraft() ?? createDefaultDraft());
  const [user, setUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [reconciliationNotice, setReconciliationNotice] = useState<string | null>(null);
  const [autoSubmitPayment, setAutoSubmitPayment] = useState(false);
  const [headerOverride, setHeaderOverride] = useState<RampHeaderConfig | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getMe()
      .then((session) => {
        if (cancelled) return;
        setUser(session);
        if (session.email_verified) {
          setDraft((current) =>
            current.step === 2 ? { ...current, step: 3 } : current,
          );
        }
      })
      .catch(() => {
        // No active session — user will sign in on step 2.
      })
      .finally(() => {
        if (!cancelled) setSessionChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const pendingOrderId = readPendingOrderId();
    if (pendingOrderId) {
      setDraft((current) => ({
        ...current,
        step: 6,
        orderId: pendingOrderId,
      }));
    }
  }, []);

  useEffect(() => {
    saveRampDraft(draft);
  }, [draft]);

  useEffect(() => {
    setHeaderOverride(null);
  }, [draft.step]);

  const patchDraft = useCallback((patch: Partial<RampDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const goToStep = useCallback((step: RampStep) => {
    patchDraft({ step });
  }, [patchDraft]);

  const clearPaymentBack = useCallback(() => {
    clearPendingOrderId();
    goToStep(4);
  }, [goToStep]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {
      // Clear local state even if the cookie is already gone.
    }
    setUser(null);
    goToStep(2);
  }, [goToStep]);

  function handleNewTransaction() {
    clearRampDraft();
    clearPendingOrderId();
    setReconciliationNotice(null);
    setAutoSubmitPayment(false);
    setCreatedOrder(null);
    setDraft(createDefaultDraft());
    setUser(null);
  }

  const handleKYCApproved = useCallback(() => {
    setAutoSubmitPayment(true);
    goToStep(5);
  }, [goToStep]);

  const handleAuthenticated = useCallback((nextUser: User) => {
    setUser(nextUser);
    goToStep(3);
  }, [goToStep]);

  function handleOrderCreated(order: Order) {
    setCreatedOrder(order);
    patchDraft({ orderId: order.id, step: 6 });
  }

  function handleReconciliation(orderId: string) {
    setReconciliationNotice(
      "Your order is saved. Payment confirmation is still in progress. Keep this order for support.",
    );
    patchDraft({ orderId, step: 6 });
  }

  const header = useMemo(
    () =>
      headerOverride ??
      defaultHeaderForStep(draft, { goToStep, clearPaymentBack }),
    [headerOverride, draft, goToStep, clearPaymentBack],
  );

  const showStepHeader = draft.step !== 2 || sessionChecked;

  return (
    <div className="ramp-widget-card">
      {user && draft.step > 1 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-paper-warm-2 px-4 py-2.5 text-[12px] text-ink-body">
          <p className="min-w-0 truncate">
            Signed in as{" "}
            <span className="font-semibold text-ink">
              {user.display_name ? `${user.display_name} (${user.email})` : user.email}
            </span>
          </p>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="shrink-0 font-medium text-action hover:underline"
          >
            Sign out
          </button>
        </div>
      )}

      {showStepHeader && <RampStepHeader title={header.title} onBack={header.onBack} />}

      <RampViewTransition
        viewKey={
          draft.step === 2 && !sessionChecked
            ? "step-2-loading"
            : `step-${draft.step}`
        }
      >
        {draft.step === 1 && (
          <AmountStep
            draft={draft}
            onChange={patchDraft}
            onContinue={() => goToStep(user?.email_verified ? 3 : 2)}
          />
        )}

        {draft.step === 2 && sessionChecked && (
          <AuthStep
            initialUser={user}
            onAuthenticated={handleAuthenticated}
            onLogout={() => void handleLogout()}
            onBack={() => goToStep(1)}
            onHeaderChange={setHeaderOverride}
          />
        )}

        {draft.step === 2 && !sessionChecked && (
          <p className="text-sm text-ink-muted">Checking session...</p>
        )}

        {draft.step === 3 && (
          <AddressStep
            draft={draft}
            onChange={patchDraft}
            onContinue={() => goToStep(4)}
          />
        )}

        {draft.step === 4 && <KYCStep onApproved={handleKYCApproved} />}

        {draft.step === 5 && (
          <PaymentStep
            draft={draft}
            autoSubmit={autoSubmitPayment}
            onOrderCreated={handleOrderCreated}
            onReconciliation={(orderId) => handleReconciliation(orderId)}
            onNeedAuth={() => goToStep(2)}
            onNeedKYC={() => goToStep(4)}
            onHeaderChange={setHeaderOverride}
          />
        )}

        {draft.step === 6 && draft.orderId && (
          <StatusStep
            orderId={draft.orderId}
            initialOrder={createdOrder?.id === draft.orderId ? createdOrder : null}
            onNewTransaction={handleNewTransaction}
            onNeedAuth={() => goToStep(2)}
            notice={reconciliationNotice ?? undefined}
            onHeaderChange={setHeaderOverride}
          />
        )}
      </RampViewTransition>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-ink-muted">
        <span>Powered by</span>
        <img src="/logo-full.png" alt="KailoPay" className="h-4 w-auto opacity-80" />
      </div>
    </div>
  );
}
