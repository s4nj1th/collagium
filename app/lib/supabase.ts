import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { createClient as createServerClient, createServiceClient as createServerService } from "@/utils/supabase/server";

/**
 * @deprecated Use @/utils/supabase/client or @/utils/supabase/server directly
 */
export function createSupabaseAnonClient() {
  // Detection for server vs browser
  if (typeof window === "undefined") {
    // This is technically async in the new utils, so this wrapper might be tricky
    // but for now we'll just advise using the new ones.
    return null as any; 
  }
  return createBrowserClient();
}

/**
 * @deprecated Use createServiceClient from @/utils/supabase/server
 */
export function createSupabaseServiceClient() {
  // Legacy sync call - the new one is async. 
  // We should update callers instead.
  return null as any;
}

