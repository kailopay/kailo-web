"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { VerifyEmailCard } from "@/components/auth/verify-email-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import {
  getMe,
  isGoogleLoginAvailable,
  login,
  openGoogleLoginPopup,
  register,
  updateProfile,
} from "@/lib/kailopay/auth";
import { developerAuthPageHref, resolvePostAuthPath } from "@/lib/kailopay/auth-intent";
import { authErrorMessage } from "@/lib/kailopay/errors";
import { isGoogleAuthPopupMessage } from "@/lib/kailopay/google-auth-popup";
import { KailopayError } from "@/lib/kailopay/http";
import type { User } from "@/lib/kailopay/types";

const PASSWORD_MIN = 10;
const PASSWORD_MAX = 128;
const BUSINESS_INTENT = "business" as const;

type AuthTab = "login" | "register";

type DeveloperAuthFormProps = {
  defaultTab: AuthTab;
  nextPath?: string | null;
};

async function finishSession(user: User, nextPath?: string | null) {
  if (!user.developer_enabled) {
    await updateProfile({ developer_enabled: true });
  }

  window.location.assign(resolvePostAuthPath(BUSINESS_INTENT, nextPath));
}

function formatAuthError(caught: unknown, tab: AuthTab): string {
  if (caught instanceof KailopayError) {
    return authErrorMessage(caught);
  }
  if (caught instanceof Error && caught.message) {
    return caught.message;
  }
  return tab === "login"
    ? "Could not sign in. Try again."
    : "Could not create account. Try again.";
}

export function DeveloperAuthForm({ defaultTab, nextPath }: DeveloperAuthFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const googleAuthResolvedRef = useRef(false);
  const googlePopupRef = useRef<Window | null>(null);
  const googlePopupPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const authLocked = submitting || googleBusy;

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    void isGoogleLoginAvailable().then(setGoogleAvailable);
  }, []);

  const stopGooglePopupWatch = useCallback(() => {
    if (googlePopupPollRef.current) {
      clearInterval(googlePopupPollRef.current);
      googlePopupPollRef.current = null;
    }
    googlePopupRef.current = null;
  }, []);

  const finishGoogleLogin = useCallback(
    async (ok: boolean) => {
      if (googleAuthResolvedRef.current) return;
      googleAuthResolvedRef.current = true;
      stopGooglePopupWatch();

      if (!ok) {
        setGoogleBusy(false);
        setError("Google sign-in was cancelled or could not be completed.");
        return;
      }

      try {
        const user = await getMe();
        await finishSession(user, nextPath);
      } catch (caught) {
        setGoogleBusy(false);
        setError(formatAuthError(caught, "login"));
      }
    },
    [nextPath, stopGooglePopupWatch],
  );

  useEffect(() => {
    function onGoogleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isGoogleAuthPopupMessage(event.data)) return;
      void finishGoogleLogin(event.data.ok);
    }

    window.addEventListener("message", onGoogleMessage);
    return () => {
      window.removeEventListener("message", onGoogleMessage);
      stopGooglePopupWatch();
    };
  }, [finishGoogleLogin, stopGooglePopupWatch]);

  function switchTab(nextTab: AuthTab) {
    setTab(nextTab);
    setError(null);
    router.replace(developerAuthPageHref(nextTab, nextPath));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (tab === "register") {
        if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
          setError(`Password must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters.`);
          return;
        }

        await register(
          email.trim(),
          password,
          displayName.trim() || undefined,
        );
        setUnverifiedEmail(email.trim());
        return;
      }

      const user = await login(email.trim(), password);
      if (!user.email_verified) {
        setUnverifiedEmail(email.trim());
        return;
      }
      await finishSession(user, nextPath);
    } catch (caught) {
      if (tab === "login" && caught instanceof KailopayError && caught.status === 403) {
        setUnverifiedEmail(email.trim());
        return;
      }
      setError(formatAuthError(caught, tab));
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    if (googleBusy) return;

    const popup = openGoogleLoginPopup();
    if (!popup) {
      setError("Allow pop-ups in your browser to sign in with Google.");
      return;
    }

    googleAuthResolvedRef.current = false;
    setError(null);
    setGoogleBusy(true);
    googlePopupRef.current = popup;

    googlePopupPollRef.current = setInterval(() => {
      const activePopup = googlePopupRef.current;
      if (!activePopup) return;

      if (activePopup.closed) {
        void getMe()
          .then((session) => {
            if (googleAuthResolvedRef.current) return;
            void finishGoogleLogin(session.email_verified);
          })
          .catch(() => {
            if (!googleAuthResolvedRef.current) {
              void finishGoogleLogin(false);
            }
          });
        return;
      }

      void getMe()
        .then((session) => {
          if (googleAuthResolvedRef.current) return;
          if (!session.email_verified) return;
          activePopup.close();
          void finishGoogleLogin(true);
        })
        .catch(() => {
          // Session not ready yet; keep polling until the popup closes.
        });
    }, 400);
  }

  if (unverifiedEmail) {
    return <VerifyEmailCard email={unverifiedEmail} nextPath={nextPath} />;
  }

  return (
    <div>
      <div className="ramp-auth-tabs">
        <div
          className={`ramp-auth-tabs__indicator ${tab === "register" ? "is-register" : ""}`}
          aria-hidden="true"
        />
        {(["login", "register"] as AuthTab[]).map((item) => (
          <button
            key={item}
            type="button"
            disabled={authLocked}
            onClick={() => switchTab(item)}
            className={`ramp-auth-tabs__button ${tab === item ? "is-active" : ""}`}
          >
            {item === "login" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 flex flex-col gap-4">
        {tab === "register" && (
          <input
            type="text"
            autoComplete="name"
            maxLength={100}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Display name (optional)"
            className="ramp-input"
            disabled={authLocked}
          />
        )}
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="ramp-input"
          disabled={authLocked}
        />
        <input
          type="password"
          required
          autoComplete={tab === "login" ? "current-password" : "new-password"}
          minLength={tab === "register" ? PASSWORD_MIN : undefined}
          maxLength={tab === "register" ? PASSWORD_MAX : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="ramp-input"
          disabled={authLocked}
        />

        {error ? <p className="ramp-error-message !mt-0">{error}</p> : null}

        <PrimaryButton
          type="submit"
          size="md"
          loading={authLocked}
          loadingLabel={
            googleBusy
              ? "Signing in with Google..."
              : submitting
                ? "Please wait..."
                : undefined
          }
        >
          {tab === "login" ? "Sign in" : "Create account"}
        </PrimaryButton>
      </form>

      {tab === "login" ? (
        <button
          type="button"
          onClick={() => router.push("/auth/forgot-password")}
          disabled={authLocked}
          className="mt-3 text-[13px] font-medium text-action hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Forgot password?
        </button>
      ) : null}

      {googleAvailable ? (
        <>
          <SecondaryButton
            className="mt-4"
            onClick={handleGoogleLogin}
            loading={googleBusy}
            loadingLabel="Signing in with Google..."
            disabled={submitting}
          >
            <img src="/marketing/google.svg" alt="" width={18} height={18} />
            Continue with Google
          </SecondaryButton>
          {googleBusy ? (
            <p className="ramp-step-loading mt-3" role="status" aria-live="polite">
              <span className="ramp-step-loading__spinner" aria-hidden="true" />
              <span className="ramp-step-loading__message">
                Complete sign-in in the Google window, or wait while we redirect you.
              </span>
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
