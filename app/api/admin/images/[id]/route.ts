import { assertAdmin } from "@/app/lib/admin-auth";
import { env } from "@/app/lib/env";
import { createServiceClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

function parseStoragePathFromPublicUrl(publicUrl: string): string | null {
  try {
    const u = new URL(publicUrl);
    // typical: /storage/v1/object/public/<bucket>/<path>
    const parts = u.pathname.split("/").filter(Boolean);
    const publicIdx = parts.findIndex((p) => p === "public");
    if (publicIdx === -1) return null;
    const bucket = parts[publicIdx + 1];
    if (!bucket || bucket !== env.storage.bucket) return null;
    const pathParts = parts.slice(publicIdx + 2);
    if (!pathParts.length) return null;
    return decodeURIComponent(pathParts.join("/"));
  } catch {
    return null;
  }
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/images/[id]">) {
  const unauth = assertAdmin(request);
  if (unauth) return unauth;

  const { id } = await ctx.params;
  const body = (await request.json()) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  for (const key of [
    "x",
    "y",
    "rotation",
    "scale",
    "z_index",
    "status",
    "locked",
  ] as const) {
    if (key in body) patch[key] = body[key];
  }

  if (!Object.keys(patch).length) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("images")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ image: data });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/images/[id]">) {
  const unauth = assertAdmin(_request);
  if (unauth) return unauth;

  const { id } = await ctx.params;
  const supabase = await createServiceClient();

  const { data: row, error: fetchError } = await supabase
    .from("images")
    .select("id,url")
    .eq("id", id)
    .single();
  if (fetchError) return Response.json({ error: fetchError.message }, { status: 500 });

  const { error: delError } = await supabase.from("images").delete().eq("id", id);
  if (delError) return Response.json({ error: delError.message }, { status: 500 });

  const storagePath = parseStoragePathFromPublicUrl(row.url);
  if (storagePath) {
    await supabase.storage.from(env.storage.bucket).remove([storagePath]);
  }

  return new Response(null, { status: 204 });
}

