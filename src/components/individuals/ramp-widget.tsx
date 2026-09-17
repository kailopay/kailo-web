"use client";

import { GoogleAuthPopupHandler } from "../auth/google-auth-popup-handler";
import { RampFlow } from "./ramp-flow";

export function RampWidget() {
  return (
    <GoogleAuthPopupHandler>
      <RampFlow />
    </GoogleAuthPopupHandler>
  );
}
