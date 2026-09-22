import { proxyBackendAuth } from "./proxy-backend-auth";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export function createAuthRoute(backendPath: string, methods: HttpMethod[]) {
  const handlers: Record<string, (request: Request) => Promise<Response>> = {};

  for (const method of methods) {
    handlers[method] = (request: Request) => proxyBackendAuth(request, backendPath);
  }

  return handlers;
}
