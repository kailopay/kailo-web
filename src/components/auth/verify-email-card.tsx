"use client";

import Link from "next/link";
import { useState } from "react";

import { PrimaryButton } from "@/components/ui/primary-button";
import { resendVerification } from "@/lib/kailopay/auth";
import { developerAuthPageHref } from "@/lib/kailopay/auth-intent";
import { authErrorMessage } from "@/lib/kailopay/errors";
import { KailopayError } from "@/lib/kailopay/http";

type VerifyEmailCardProps = {
  email: string;
  nextPath?: string | null;
};

export function VerifyEmailCard({ email, nextPath }: VerifyEmailCardProps) {
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setBusy(true);
    setError(null);
    try {
      await resendVerification(email);
      setResent(true);
    } catch (caught) {
      setError(
        caught instanceof KailopayError
          ? authErrorMessage(caught)
          : "Could not resend verification email.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-center text-[17px] font-semibold leading-snug text-ink">
        Verify your email
      </h1>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-body">
        We sent a verification link to <strong>{email}</strong>. Open it, then
        sign in to continue.
      </p>

      {resent ? (
        <p className="mt-4 text-[13px] text-green-700" role="status">
          A new verification link was sent if this email is registered.
        </p>
      ) : (
        <PrimaryButton
          className="mt-5"
          size="md"
          loading={busy}
          loadingLabel="Sending..."
          onClick={() => void handleResend()}
        >
          Resend verification email
        </PrimaryButton>
      )}

      {error ? <p className="mt-3 ramp-error-message">{error}</p> : null}

      <p className="mt-5 text-center text-[13px] text-ink-muted">
        Already verified?{" "}
        <Link
          href={developerAuthPageHref("login", nextPath)}
          className="font-medium text-action hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
