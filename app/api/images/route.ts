import { nanoid } from "nanoid";
import { createSupabaseServiceClient } from "@/app/lib/supabase";
import { env } from "@/app/lib/env";

export const runtime = "nodejs";

function toNumber(value: FormDataEntryValue | null, fallback: number) {
  if (value == null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("status", "approved")
    .order("z_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ images: data ?? [] });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }

  const x = toNumber(form.get("x"), 0);
  const y = toNumber(form.get("y"), 0);
  const rotation = toNumber(form.get("rotation"), 0);
  const scale = toNumber(form.get("scale"), 1);
  const z_index = Math.trunc(toNumber(form.get("z_index"), 0));

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "png";
  const path = `uploads/${Date.now()}-${nanoid(10)}.${safeExt}`;

  const supabase = createSupabaseServiceClient();
  const uploadRes = await supabase.storage
    .from(env.storage.bucket)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadRes.error) {
    return Response.json({ error: uploadRes.error.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage
    .from(env.storage.bucket)
    .getPublicUrl(path);

  const url = publicUrlData.publicUrl;
  const { data: row, error: insertError } = await supabase
    .from("images")
    .insert({
      url,
      x,
      y,
      rotation,
      scale,
      z_index,
      locked: false,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from(env.storage.bucket).remove([path]);
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  return Response.json({ image: row }, { status: 201 });
}

