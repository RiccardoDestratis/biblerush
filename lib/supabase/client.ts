import { createBrowserClient } from "@supabase/ssr";
import { getEnvVar } from "@/lib/utils/env";

/**
 * Supabase client for browser/client-side usage
 * Use this in Client Components and client-side code
 */
export function createClient() {
  return createBrowserClient(
    getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

