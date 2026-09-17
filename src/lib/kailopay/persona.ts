import type { KYCInquiry } from "./types";

export type PersonaClient = {
  destroy: () => void;
};

type PersonaCompletePayload = {
  inquiryId: string;
  status: string;
  fields: unknown;
};

type PersonaCancelPayload = {
  inquiryId: string;
  sessionToken?: string;
};

type PersonaClientInstance = {
  open: () => void;
  destroy: () => void;
};

type PersonaClientConstructor = new (options: {
  inquiryId: string;
  environmentId: string;
  sessionToken?: string;
  parent?: HTMLElement;
  frameHeight?: string;
  frameWidth?: string;
  onLoad?: () => void;
  onReady?: () => void;
  onEvent?: (eventName: string, metadata: Record<string, unknown>) => void;
  onComplete?: (payload: PersonaCompletePayload) => void;
  onCancel?: (payload: PersonaCancelPayload) => void;
  onError?: (error: unknown) => void;
}) => PersonaClientInstance;

type PersonaGlobal = {
  Client: PersonaClientConstructor;
};

declare global {
  interface Window {
    Persona?: PersonaGlobal;
  }
}

const PERSONA_SCRIPT = "https://cdn.withpersona.com/dist/persona-v5.1.2.js";
const PERSONA_READY_TIMEOUT_MS = 30_000;

function assertInquiry(inquiry: KYCInquiry): void {
  if (!inquiry.inquiry_id?.trim()) {
    throw new Error("KYC inquiry is missing inquiry_id from the API.");
  }
  if (!inquiry.environment_id?.trim()) {
    throw new Error("KYC inquiry is missing environment_id from the API.");
  }
}

export function loadPersonaScript(): Promise<PersonaGlobal> {
  if (window.Persona?.Client) return Promise.resolve(window.Persona);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PERSONA_SCRIPT}"]`);
    if (existing) {
      if (window.Persona?.Client) {
        resolve(window.Persona);
        return;
      }
      existing.addEventListener("load", () => {
        if (window.Persona?.Client) resolve(window.Persona);
        else reject(new Error("Persona failed to load"));
      });
      existing.addEventListener("error", () => reject(new Error("Could not load Persona")));
      return;
    }

    const script = document.createElement("script");
    script.src = PERSONA_SCRIPT;
    script.async = true;
    script.onload = () => {
      if (window.Persona?.Client) resolve(window.Persona);
      else reject(new Error("Persona failed to load"));
    };
    script.onerror = () => reject(new Error("Could not load Persona"));
    document.head.appendChild(script);
  });
}

/**
 * Mount Persona inline inside `container` for a backend-created inquiry.
 * Uses `parent` so the flow renders in-page (not a full-screen modal).
 */
export async function mountInlinePersona(
  inquiry: KYCInquiry,
  container: HTMLElement,
  handlers: {
    onComplete: () => void;
    onCancel: () => void;
    onError: (error: Error) => void;
    onReady?: () => void;
    onLoad?: () => void;
  },
): Promise<PersonaClient> {
  assertInquiry(inquiry);
  const Persona = await loadPersonaScript();

  return await new Promise<PersonaClient>((resolve, reject) => {
    let settled = false;
    let client: PersonaClientInstance | null = null;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      callback();
    };

    const timeoutId = window.setTimeout(() => {
      finish(() => {
        client?.destroy();
        container.innerHTML = "";
        reject(new Error("Persona verification took too long to open. Try again."));
      });
    }, PERSONA_READY_TIMEOUT_MS);

    container.replaceChildren();

    client = new Persona.Client({
      inquiryId: inquiry.inquiry_id,
      environmentId: inquiry.environment_id,
      ...(inquiry.session_token ? { sessionToken: inquiry.session_token } : {}),
      parent: container,
      frameHeight: "650px",
      frameWidth: "100%",
      onLoad: () => {
        handlers.onLoad?.();
      },
      onReady: () => {
        client?.open();
        finish(() => {
          handlers.onReady?.();
          resolve({
            destroy: () => {
              client?.destroy();
              container.innerHTML = "";
            },
          });
        });
      },
      onEvent: (eventName) => {
        if (eventName === "complete") {
          handlers.onComplete();
        }
      },
      onComplete: () => {
        handlers.onComplete();
      },
      onCancel: () => {
        handlers.onCancel();
      },
      onError: (error) => {
        handlers.onError(
          error instanceof Error ? error : new Error("Persona verification failed."),
        );
      },
    });
  });
}
