export const GOOGLE_AUTH_POPUP_MESSAGE = "kailopay:google-auth-complete";

export type GoogleAuthPopupMessage = {
  type: typeof GOOGLE_AUTH_POPUP_MESSAGE;
  ok: boolean;
};

const POPUP_WIDTH = 480;
const POPUP_HEIGHT = 640;

export function openGoogleLoginPopup(): Window | null {
  const dualScreenLeft = window.screenLeft ?? window.screenX;
  const dualScreenTop = window.screenTop ?? window.screenY;
  const viewportWidth = window.innerWidth ?? document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight ?? document.documentElement.clientHeight;
  const left = Math.round(dualScreenLeft + (viewportWidth - POPUP_WIDTH) / 2);
  const top = Math.round(dualScreenTop + (viewportHeight - POPUP_HEIGHT) / 2);

  return window.open(
    "/auth/google/login",
    "kailopay-google-auth",
    [
      `width=${POPUP_WIDTH}`,
      `height=${POPUP_HEIGHT}`,
      `left=${left}`,
      `top=${top}`,
      "scrollbars=yes",
      "resizable=yes",
    ].join(","),
  );
}

export function isGoogleAuthPopupMessage(data: unknown): data is GoogleAuthPopupMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as GoogleAuthPopupMessage).type === GOOGLE_AUTH_POPUP_MESSAGE &&
    typeof (data as GoogleAuthPopupMessage).ok === "boolean"
  );
}

export function notifyGoogleAuthOpener(ok: boolean): void {
  if (!window.opener || window.opener.closed) return;
  window.opener.postMessage(
    { type: GOOGLE_AUTH_POPUP_MESSAGE, ok },
    window.location.origin,
  );
}
