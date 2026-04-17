"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/utils/supabase/server";
import { nanoid } from "nanoid";
import { env } from "./env";
import type { CollageImage } from "./types";

/**
 * Upload an image to Supabase storage and create a database record.
 */
export async function uploadImageAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("Missing file");

  const x = Number(formData.get("x") || 0);
  const y = Number(formData.get("y") || 0);
  const rotation = Number(formData.get("rotation") || 0);
  const scale = Number(formData.get("scale") || 1);
  const z_index = Math.trunc(Number(formData.get("z_index") || 0));
  const frame = String(formData.get("frame") || "none");

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "png";
  const path = `uploads/${Date.now()}-${nanoid(10)}.${safeExt}`;

  // Use service client to ensure we can upload and insert without RLS restrictions 
  // if the user hasn't set up public bucket policies yet.
  const supabase = await createServiceClient();

  const { error: uploadError } = await supabase.storage
    .from(env.storage.bucket)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage
    .from(env.storage.bucket)
    .getPublicUrl(path);

  const url = publicUrlData.publicUrl;
  const { data, error: insertError } = await supabase
    .from("images")
    .insert({
      url,
      x,
      y,
      rotation,
      scale,
      z_index,
      frame,
      locked: false,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertError) {
    // Cleanup if DB insert fails
    await supabase.storage.from(env.storage.bucket).remove([path]);
    throw new Error(insertError.message);
  }

  revalidatePath("/");
  return data as CollageImage;
}

/**
 * Update an image record (admin action).
 */
export async function updateImageAction(id: string, patch: any, adminPassword?: string) {
  if (adminPassword !== env.admin.password) {
    throw new Error("Unauthorized");
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("images")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath("/");
  revalidatePath("/admin");
  return data as CollageImage;
}

/**
 * Delete an image record and its associated storage file (admin action).
 */
export async function deleteImageAction(id: string, adminPassword?: string) {
  if (adminPassword !== env.admin.password) {
    throw new Error("Unauthorized");
  }

  const supabase = await createServiceClient();

  // 1. Get the URL to find the storage path
  const { data: row, error: fetchError } = await supabase
    .from("images")
    .select("url")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  // 2. Delete from DB
  const { error: delError } = await supabase.from("images").delete().eq("id", id);
  if (delError) throw new Error(delError.message);

  // 3. Delete from Storage
  const storagePath = parseStoragePathFromPublicUrl(row.url);
  if (storagePath) {
    await supabase.storage.from(env.storage.bucket).remove([storagePath]);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

/**
 * Helper to parse storage path from a Supabase public URL
 */
function parseStoragePathFromPublicUrl(publicUrl: string): string | null {
  try {
    const u = new URL(publicUrl);
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
