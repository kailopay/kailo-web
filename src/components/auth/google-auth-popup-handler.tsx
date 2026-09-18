"use client";

import { useEffect, useState } from "react";

import { getMe } from "@/lib/kailopay/auth";
import {
  isGoogleAuthPopupWindow,
  notifyGoogleAuthOpener,
} from "@/lib/kailopay/google-auth-popup";

type GoogleAuthPopupHandlerProps = {
  children: React.ReactNode;
};

export function GoogleAuthPopupHandler({ children }: GoogleAuthPopupHandlerProps) {
  const [isPopupFlow, setIsPopupFlow] = useState(
    () => typeof window !== "undefined" && isGoogleAuthPopupWindow(),
  );
  const [popupError, setPopupError] = useState(false);

  useEffect(() => {
    if (!isGoogleAuthPopupWindow()) return;

    setIsPopupFlow(true);
    let cancelled = false;

    void getMe()
      .then((user) => {
        if (cancelled) return;
        if (!user.email_verified) {
          setPopupError(true);
          notifyGoogleAuthOpener(false);
          return;
        }
        notifyGoogleAuthOpener(true);
        window.close();
      })
      .catch(() => {
        if (cancelled) return;
        setPopupError(true);
        notifyGoogleAuthOpener(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isPopupFlow) {
    return (
      <div className="google-auth-popup-screen">
        <p className="google-auth-popup-screen__text">
          {popupError
            ? "Could not complete Google sign-in. You can close this window."
            : "Signing you in with Google..."}
        </p>
      </div>
    );
  }

  return children;
}
