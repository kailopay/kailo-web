import {
  DEFAULT_APP_URL,
  DEFAULT_DOCS_URL,
  DEFAULT_GITHUB_REPO_URL,
} from "@/constants/dashboard/app/defaults";

export type PublicEnv = {
  docsUrl: string;
  githubUrl: string;
  appUrl: string;
  personaEnvironmentId: string | null;
  personaInquiryTemplateId: string | null;
};

declare global {
  interface Window {
    __KAILOPAY_PUBLIC_ENV__?: PublicEnv;
  }
}

function trimOrNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function readPublicEnvFromProcess(): PublicEnv {
  return {
    docsUrl: trimOrNull(process.env.NEXT_PUBLIC_DOCS_URL) ?? DEFAULT_DOCS_URL,
    githubUrl:
      trimOrNull(process.env.NEXT_PUBLIC_GITHUB_URL) ?? DEFAULT_GITHUB_REPO_URL,
    appUrl: trimOrNull(process.env.NEXT_PUBLIC_APP_URL) ?? DEFAULT_APP_URL,
    personaEnvironmentId: trimOrNull(
      process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID,
    ),
    personaInquiryTemplateId: trimOrNull(
      process.env.NEXT_PUBLIC_PERSONA_INQUIRY_TEMPLATE_ID,
    ),
  };
}

export function getPublicEnv(): PublicEnv {
  if (typeof window !== "undefined" && window.__KAILOPAY_PUBLIC_ENV__) {
    return window.__KAILOPAY_PUBLIC_ENV__;
  }

  return readPublicEnvFromProcess();
}
