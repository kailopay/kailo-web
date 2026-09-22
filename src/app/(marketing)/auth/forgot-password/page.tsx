"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { PrimaryButton } from "@/components/ui/primary-button";
import { requestPasswordReset } from "@/lib/kailopay/auth";
import { authErrorMessage } from "@/lib/kailopay/errors";
import { KailopayError } from "@/lib/kailopay/http";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (caught) {
      setError(
        caught instanceof KailopayError
          ? authErrorMessage(caught)
          : "Could not reach the server. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthPageShell>
      <h1 className="text-center text-[17px] font-semibold leading-snug text-ink">
        Reset password
      </h1>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-body">
        Enter your email and we&apos;ll send a reset link if an account exists.
      </p>

      {sent ? (
        <p className="mt-5 text-[13px] text-green-700" role="status">
          If an account exists for that email, a reset link was sent.
        </p>
      ) : (
        <form className="mt-5 flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <input
            className="ramp-input"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />
          {error ? <p className="ramp-error-message !mt-0">{error}</p> : null}
          <PrimaryButton
            type="submit"
            size="md"
            loading={busy}
            loadingLabel="Sending..."
          >
            Send reset link
          </PrimaryButton>
        </form>
      )}

      <p className="mt-5 text-center text-[13px] text-ink-muted">
        <Link href="/login" className="font-medium text-action hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
