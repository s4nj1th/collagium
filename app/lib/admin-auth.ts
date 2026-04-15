import { env } from "./env";

export function assertAdmin(request: Request) {
  const header =
    request.headers.get("x-collagium-admin-password") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";

  const provided = header;
  if (!provided || provided !== env.admin.password) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

