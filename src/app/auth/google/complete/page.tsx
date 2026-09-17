"use client";

import { GoogleAuthPopupHandler } from "@/components/auth/google-auth-popup-handler";

export default function GoogleAuthCompletePage() {
  return (
    <GoogleAuthPopupHandler>
      <div className="google-auth-popup-screen">
        <p className="google-auth-popup-screen__text">Signing you in with Google...</p>
      </div>
    </GoogleAuthPopupHandler>
  );
}
