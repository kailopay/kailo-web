import { apiErrorMessage } from "@/lib/kailopay/errors";
import { KailopayError } from "@/lib/kailopay/http";

export function isDeveloperModeRequired(error: unknown): boolean {
  return (
    error instanceof KailopayError &&
    error.status === 403 &&
    (error.code === "DEVELOPER_MODE_REQUIRED" ||
      error.message.toLowerCase().includes("developer mode"))
  );
}

export function developerErrorMessage(error: unknown): string {
  if (error instanceof KailopayError) {
    if (isDeveloperModeRequired(error)) {
      return "Enable Developer Mode to access this workspace.";
    }
    return apiErrorMessage(error);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Try again.";
}
