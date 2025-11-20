import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Supabase client for browser/client-side usage
 * Use this in Client Components and client-side code
 * Typed with generated database types for type safety
 * 
 * Note: Accessing NEXT_PUBLIC_* env vars directly (not via helper)
 * because Next.js needs to statically replace them at build time
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required but not set");
  }
  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not set");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

