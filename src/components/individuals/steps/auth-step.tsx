"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getMe,
  isGoogleLoginAvailable,
  login,
  openGoogleLoginPopup,
  register,
  resendVerification,
  requestPasswordReset,
} from "@/lib/kailopay/auth";
import { isGoogleAuthPopupMessage } from "@/lib/kailopay/google-auth-popup";
import { authErrorMessage } from "@/lib/kailopay/errors";
import { KailopayError } from "@/lib/kailopay/http";
import type { User } from "@/lib/kailopay/types";
import { PrimaryButton } from "../../ui/primary-button";
import { SecondaryButton } from "../../ui/secondary-button";
import type { RampHeaderConfig } from "../ramp-step-header";
import { RampViewTransition } from "../ramp-view-transition";

type AuthStepProps = {
  initialUser: User | null;
  onAuthenticated: (user: User) => void;
  onLogout: () => void;
  onBack: () => void;
  onHeaderChange?: (config: RampHeaderConfig) => void;
};

type AuthTab = "login" | "register";

export function AuthStep({
  initialUser,
  onAuthenticated,
  onLogout,
  onBack,
  onHeaderChange,
}: AuthStepProps) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(!initialUser);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(initialUser);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [googleLoggingIn, setGoogleLoggingIn] = useState(false);
  const autoContinuedRef = useRef(false);
  const googlePopupRef = useRef<Window | null>(null);
  const googlePopupPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const googleAuthResolvedRef = useRef(false);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setLoading(false);
      return;
    }

    let cancelled = false;
    void Promise.all([getMe().catch(() => null), isGoogleLoginAvailable()])
      .then(([session, google]) => {
        if (cancelled) return;
        if (session) {
          setUser(session);
        }
        setGoogleAvailable(google);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  useEffect(() => {
    if (user?.email_verified && !autoContinuedRef.current) {
      autoContinuedRef.current = true;
      onAuthenticated(user);
    }
  }, [user, onAuthenticated]);

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
      setGoogleLoggingIn(false);

      if (!ok) {
        setError("Google sign-in was cancelled or could not be completed.");
        return;
      }

      try {
        const session = await getMe();
        setUser(session);
        if (session.email_verified) {
          onAuthenticated(session);
        }
      } catch {
        setError("Google sign-in could not be verified. Try again.");
      }
    },
    [onAuthenticated, stopGooglePopupWatch],
  );

  useEffect(() => {
    function onGoogleAuthMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!isGoogleAuthPopupMessage(event.data)) return;
      void finishGoogleLogin(event.data.ok);
    }

    window.addEventListener("message", onGoogleAuthMessage);
    return () => {
      window.removeEventListener("message", onGoogleAuthMessage);
      stopGooglePopupWatch();
    };
  }, [finishGoogleLogin, stopGooglePopupWatch]);

  function handleGoogleLogin() {
    if (googleLoggingIn) return;

    const popup = openGoogleLoginPopup();
    if (!popup) {
      setError("Allow pop-ups in your browser to sign in with Google.");
      return;
    }

    googleAuthResolvedRef.current = false;
    setError(null);
    setGoogleLoggingIn(true);
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

  useEffect(() => {
    if (!onHeaderChange) return;

    if (loading) {
      onHeaderChange({ title: "Sign in", onBack });
      return;
    }
    if (user && user.email_verified) {
      onHeaderChange({ title: "Sign in", onBack });
      return;
    }
    if (user && !user.email_verified) {
      onHeaderChange({ title: "Verify your email", onBack });
      return;
    }
    if (showForgot) {
      onHeaderChange({
        title: "Reset password",
        onBack: () => setShowForgot(false),
      });
      return;
    }
    onHeaderChange({
      title: tab === "login" ? "Sign in to continue" : "Create an account",
      onBack,
    });
  }, [loading, user, showForgot, tab, onBack, onHeaderChange]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const next =
        tab === "login"
          ? await login(email.trim(), password)
          : await register(email.trim(), password, displayName.trim() || undefined);
      setUser(next);
      if (next.email_verified) {
        onAuthenticated(next);
      }
    } catch (caught) {
      setError(
        caught instanceof KailopayError
          ? authErrorMessage(caught)
          : "Could not sign in. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await resendVerification(user.email);
      setResendSent(true);
    } catch (caught) {
      setError(
        caught instanceof KailopayError
          ? authErrorMessage(caught)
          : "Could not resend verification email.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgot(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordReset(email.trim());
      setForgotSent(true);
    } catch (caught) {
      setError(
        caught instanceof KailopayError
          ? authErrorMessage(caught)
          : "Could not send reset email.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const authLocked = submitting || googleLoggingIn;

  const viewKey = loading
    ? "loading"
    : user && user.email_verified
      ? "continuing"
      : user && !user.email_verified
        ? "verify"
        : showForgot
          ? "forgot"
          : `auth-${tab}`;

  if (loading) {
    return (
      <RampViewTransition viewKey={viewKey}>
        <p className="text-sm text-ink-muted">Checking session...</p>
      </RampViewTransition>
    );
  }

  if (user && user.email_verified) {
    return (
      <RampViewTransition viewKey={viewKey}>
        <p className="text-sm text-ink-muted">Continuing...</p>
      </RampViewTransition>
    );
  }

  if (user && !user.email_verified) {
    return (
      <RampViewTransition viewKey={viewKey}>
        <div>
          <p className="text-[13px] leading-relaxed text-ink-body">
            We sent a verification link to <strong>{user.email}</strong>. Open it to continue.
          </p>
          {resendSent && (
            <p className="mt-3 text-[13px] text-green-700">Verification email sent.</p>
          )}
          {error && <p className="mt-3 ramp-error-message">{error}</p>}
          <div className="mt-5 flex flex-col gap-3">
            <PrimaryButton
              size="md"
              onClick={() => void handleResend()}
              loading={submitting}
              loadingLabel="Sending..."
            >
              Resend verification email
            </PrimaryButton>
            <SecondaryButton onClick={onLogout}>Use a different account</SecondaryButton>
          </div>
        </div>
      </RampViewTransition>
    );
  }

  if (showForgot) {
    return (
      <RampViewTransition viewKey={viewKey}>
        <div>
          <p className="text-[13px] text-ink-body">
            Enter your email and we will send a reset link.
          </p>
          <form
            onSubmit={(event) => void handleForgot(event)}
            className="mt-5 flex flex-col gap-4"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="ramp-input"
            />
            {forgotSent && (
              <p className="text-[13px] text-green-700">
                If an account exists, a reset link has been sent.
              </p>
            )}
            {error && <p className="ramp-error-message !mt-0">{error}</p>}
            <PrimaryButton
              type="submit"
              size="md"
              loading={submitting}
              loadingLabel="Sending..."
            >
              Send reset link
            </PrimaryButton>
          </form>
          <button
            type="button"
            onClick={() => setShowForgot(false)}
            className="mt-3 text-[13px] font-medium text-ink-muted hover:text-ink"
          >
            Back to sign in
          </button>
        </div>
      </RampViewTransition>
    );
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
            disabled={googleLoggingIn}
            onClick={() => {
              setTab(item);
              setError(null);
            }}
            className={`ramp-auth-tabs__button ${tab === item ? "is-active" : ""}`}
          >
            {item === "login" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      <RampViewTransition viewKey={viewKey}>
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 flex flex-col gap-4">
          {tab === "register" && (
            <input
              type="text"
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="ramp-input"
            disabled={authLocked}
          />
          {error && <p className="ramp-error-message !mt-0">{error}</p>}
          <PrimaryButton
            type="submit"
            size="md"
            loading={authLocked}
            loadingLabel={
              googleLoggingIn
                ? "Signing in with Google..."
                : submitting
                  ? "Please wait..."
                  : undefined
            }
          >
            {tab === "login" ? "Sign in" : "Create account"}
          </PrimaryButton>
        </form>

        {tab === "login" && (
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            disabled={googleLoggingIn}
            className="mt-3 text-[13px] font-medium text-action hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Forgot password?
          </button>
        )}

        {googleAvailable && (
          <SecondaryButton
            className="mt-4"
            onClick={handleGoogleLogin}
            loading={googleLoggingIn}
            loadingLabel="Signing in with Google..."
          >
            <img src="/marketing/google.svg" alt="" width={18} height={18} />
            Continue with Google
          </SecondaryButton>
        )}
      </RampViewTransition>
    </div>
  );
}
