type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function backendPath(segments: string[]): string {
  return `/v1/${segments.join("/")}`;
}

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const { proxyBackendAuth } = await import("@/lib/kailopay/proxy-backend-auth");
  return proxyBackendAuth(request, backendPath(path));
}

export async function GET(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxy(request, context);
}
