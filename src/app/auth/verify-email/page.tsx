"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { verifyEmail } from "@/lib/kailopay/auth";
import { rampErrorMessage } from "@/lib/kailopay/errors";
import { KailopayError } from "@/lib/kailopay/http";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is invalid or missing.");
      return;
    }

    void verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email is verified. You can continue your transaction.");
      })
      .catch((caught) => {
        setStatus("error");
        setMessage(
          caught instanceof KailopayError
            ? rampErrorMessage(caught)
            : "Could not verify your email.",
        );
      });
  }, [token]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold text-ink">Email verification</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-body">
        {status === "loading" ? "Verifying your email..." : message}
      </p>
      {status !== "loading" && (
        <Link
          href="/individuals"
          className="mt-6 inline-flex justify-center rounded-full bg-action px-6 py-3 text-[14px] font-semibold text-white"
        >
          Continue to Individuals
        </Link>
      )}
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="p-8 text-sm text-ink-muted">Loading...</main>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
