import { assertAdmin } from "@/app/lib/admin-auth";
import { createSupabaseServiceClient } from "@/app/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauth = assertAdmin(request);
  if (unauth) return unauth;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "pending";

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ images: data ?? [] });
}

