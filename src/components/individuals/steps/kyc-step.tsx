"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { kycErrorMessage } from "@/lib/kailopay/errors";
import { KailopayError } from "@/lib/kailopay/http";
import {
  createKYCInquiry,
  getKYCStatus,
  isKYCApproved,
  isKYCInquiryAlreadySubmitted,
  isKYCAwaitingApproval,
  shouldOpenPersonaFlow,
} from "@/lib/kailopay/kyc";
import type { KYCStatus } from "@/lib/kailopay/types";
import { mountInlinePersona, type PersonaClient } from "@/lib/kailopay/persona";

type KYCStepProps = {
  onApproved: () => void;
};

const POLL_MS = 3000;

export function KYCStep({ onApproved }: KYCStepProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<PersonaClient | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const approvedRef = useRef(false);
  const awaitingReviewRef = useRef(false);
  const lastStatusRef = useRef<KYCStatus | null>(null);
  const onApprovedRef = useRef(onApproved);
  onApprovedRef.current = onApproved;

  const [loading, setLoading] = useState(true);
  const [personaReady, setPersonaReady] = useState(false);
  const [awaitingReview, setAwaitingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showPersonaLoading = (loading || !personaReady) && !error && !awaitingReview;

  const finishApproved = useCallback(() => {
    if (approvedRef.current) return;
    approvedRef.current = true;
    if (pollRef.current) clearInterval(pollRef.current);
    clientRef.current?.destroy();
    onApprovedRef.current();
  }, []);

  const rememberStatus = useCallback((status: KYCStatus) => {
    lastStatusRef.current = status;
  }, []);

  const syncKYCStatus = useCallback(async (): Promise<boolean> => {
    try {
      const status = await getKYCStatus();
      rememberStatus(status);
      if (isKYCApproved(status)) {
        finishApproved();
        return true;
      }
      if (isKYCAwaitingApproval(status)) {
        setAwaitingReview(true);
        setError(null);
        return true;
      }
    } catch {
      // Keep polling.
    }
    return false;
  }, [finishApproved, rememberStatus]);

  const pollUntilApproved = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    const tick = () => {
      void syncKYCStatus();
    };

    tick();
    pollRef.current = setInterval(tick, POLL_MS);
  }, [syncKYCStatus]);

  const beginAwaitingApproval = useCallback(() => {
    if (awaitingReviewRef.current) {
      pollUntilApproved();
      return;
    }
    awaitingReviewRef.current = true;
    setAwaitingReview(true);
    setPersonaReady(false);
    setLoading(false);
    setError(null);
    clientRef.current?.destroy();
    if (containerRef.current) containerRef.current.innerHTML = "";
    pollUntilApproved();
  }, [pollUntilApproved]);

  const waitForContainer = useCallback(async (): Promise<HTMLElement> => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const container = containerRef.current;
      if (container) return container;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    }
    throw new Error("Verification container is not ready.");
  }, []);

  const handleInquiryAlreadySubmitted = useCallback(async () => {
    beginAwaitingApproval();
    await syncKYCStatus();
  }, [beginAwaitingApproval, syncKYCStatus]);

  const handlePersonaComplete = useCallback(() => {
    beginAwaitingApproval();
    void syncKYCStatus();
  }, [beginAwaitingApproval, syncKYCStatus]);

  const startInlineKYC = useCallback(async () => {
    setAwaitingReview(false);
    setPersonaReady(false);
    setError(null);
    clientRef.current?.destroy();

    try {
      const container = await waitForContainer();
      container.innerHTML = "";
      const inquiry = await createKYCInquiry();
      clientRef.current = await mountInlinePersona(inquiry, container, {
        onReady: () => {
          setPersonaReady(true);
          setLoading(false);
          pollUntilApproved();
        },
        onComplete: handlePersonaComplete,
        onCancel: () => {
          setPersonaReady(false);
          setLoading(false);
          setError("Verification was cancelled. Complete identity check to continue.");
        },
        onError: (personaError) => {
          setPersonaReady(false);
          setLoading(false);
          setError(personaError.message);
        },
      });
    } catch (caught) {
      setPersonaReady(false);
      setLoading(false);
      if (
        caught instanceof KailopayError &&
        isKYCInquiryAlreadySubmitted(caught, lastStatusRef.current)
      ) {
        await handleInquiryAlreadySubmitted();
        return;
      }
      setError(
        caught instanceof KailopayError
          ? kycErrorMessage(caught)
          : caught instanceof Error
            ? caught.message
            : "Could not start identity verification.",
      );
    }
  }, [
    handleInquiryAlreadySubmitted,
    handlePersonaComplete,
    pollUntilApproved,
    waitForContainer,
  ]);

  useEffect(() => {
    let cancelled = false;

    void getKYCStatus()
      .then(async (status) => {
        if (cancelled) return;
        rememberStatus(status);
        if (isKYCApproved(status)) {
          finishApproved();
          return;
        }
        if (isKYCAwaitingApproval(status)) {
          beginAwaitingApproval();
          return;
        }
        if (!shouldOpenPersonaFlow(status)) {
          beginAwaitingApproval();
          return;
        }
        await startInlineKYC();
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(
          caught instanceof KailopayError
            ? kycErrorMessage(caught)
            : "Could not load verification.",
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      clientRef.current?.destroy();
    };
    // Bootstrap once. Callbacks are read from refs to avoid tearing down Persona on parent re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showIntro = !awaitingReview && !personaReady && !error;

  return (
    <div>
      {showIntro && (
        <p className="text-[13px] leading-relaxed text-ink-body">
          Complete the steps below to continue with your transaction.
        </p>
      )}

      {awaitingReview && (
        <div className="persona-inline-shell mt-4" aria-live="polite">
          <div className="persona-inline-loading">
            <div className="persona-inline-loading-shimmer" />
            <p className="persona-inline-loading-label">
              Verification submitted. Confirming your identity with KailoPay...
            </p>
            <p className="px-5 pb-2 text-center text-[12px] leading-relaxed text-ink-muted">
              This usually takes a few seconds. If it takes longer, KailoPay is still
              processing your Persona result.
            </p>
            <button
              type="button"
              onClick={() => void syncKYCStatus()}
              className="mx-auto mb-5 text-[13px] font-medium text-action hover:underline"
            >
              Check status now
            </button>
          </div>
        </div>
      )}

      {!awaitingReview && (
        <div className="persona-inline-shell mt-4" aria-busy={showPersonaLoading}>
          {showPersonaLoading && (
            <div className="persona-inline-loading" aria-hidden={personaReady}>
              <div className="persona-inline-loading-shimmer" />
              <p className="persona-inline-loading-label">Loading identity verification...</p>
            </div>
          )}
          <div
            ref={containerRef}
            className={`persona-inline-container${personaReady ? " persona-inline-container--ready" : ""}`}
            aria-label="Identity verification"
          />
          {error && (
            <div className="border-t border-ink/[0.08] px-4 py-4">
              <p className="ramp-error-message">{error}</p>
              <button
                type="button"
                onClick={() =>
                  void (lastStatusRef.current?.inquiry_id
                    ? handleInquiryAlreadySubmitted()
                    : startInlineKYC())
                }
                className="mt-3 text-[13px] font-medium text-action hover:underline"
              >
                {lastStatusRef.current?.inquiry_id
                  ? "Check verification status"
                  : "Try again"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
