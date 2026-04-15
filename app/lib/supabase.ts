import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export function createSupabaseAnonClient() {
  return createClient(env.supabase.url, env.supabase.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createSupabaseServiceClient() {
  return createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

