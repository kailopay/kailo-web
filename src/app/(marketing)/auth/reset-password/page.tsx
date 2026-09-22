"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { resetPassword } from "@/lib/kailopay/auth";
import { authErrorMessage } from "@/lib/kailopay/errors";
import { KailopayError } from "@/lib/kailopay/http";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("Reset link is invalid or missing.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (caught) {
      setError(
        caught instanceof KailopayError
          ? authErrorMessage(caught)
          : "Could not reset password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <h1 className="text-2xl font-semibold text-ink">Reset password</h1>
        <p className="mt-3 text-[14px] text-red-600">Reset link is invalid or missing.</p>
        <Link href="/individuals" className="mt-6 text-[14px] font-medium text-action">
          Back to Individuals
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold text-ink">Reset password</h1>
      {done ? (
        <>
          <p className="mt-3 text-[14px] text-ink-body">
            Your password has been reset. Sign in again to continue.
          </p>
          <Link
            href="/individuals"
            className="mt-6 inline-flex justify-center rounded-full bg-action px-6 py-3 text-[14px] font-semibold text-white"
          >
            Continue to Individuals
          </Link>
        </>
      ) : (
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            className="w-full rounded-xl border border-ink/[0.08] px-4 py-3 text-[14px] outline-none focus:border-action"
          />
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-action py-3.5 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Reset password"}
          </button>
        </form>
      )}
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="p-8 text-sm text-ink-muted">Loading...</main>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
