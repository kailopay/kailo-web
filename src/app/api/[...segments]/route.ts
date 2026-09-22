import { handleMockApi } from "@/lib/dashboard/mock/api-handler";

type RouteContext = {
  params: Promise<{ segments: string[] }>;
};

async function dispatch(request: Request, context: RouteContext) {
  const { segments } = await context.params;
  const path = segments.join("/");
  return handleMockApi(request.method, path, request);
}

export async function GET(request: Request, context: RouteContext) {
  return dispatch(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return dispatch(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return dispatch(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return dispatch(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return dispatch(request, context);
}
