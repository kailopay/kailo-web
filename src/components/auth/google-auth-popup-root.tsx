"use client";

import { GoogleAuthPopupHandler } from "./google-auth-popup-handler";

type GoogleAuthPopupRootProps = {
  children: React.ReactNode;
};

export function GoogleAuthPopupRoot({ children }: GoogleAuthPopupRootProps) {
  return <GoogleAuthPopupHandler>{children}</GoogleAuthPopupHandler>;
}
